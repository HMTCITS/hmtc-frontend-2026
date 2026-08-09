import { NextResponse } from 'next/server';

type TCRunPayload = {
  namaLengkap: string;
  alamatEmail: string;
  nomorWhatsapp: string;
  angkatan: string;
  nominalDonasi?: number;
  buktiPembayaran?: File | null;
  submittedAt?: string;
};

function getRequiredEnv() {
  const baseUrl = process.env.NOCODB_BASE_URL;
  const apiToken = process.env.NOCODB_API_TOKEN;
  const tableId = 'murxeodpqdflzn9';

  if (!baseUrl || !apiToken || !tableId) {
    return {
      ok: false as const,
      message:
        'NocoDB env belum lengkap. Isi NOCODB_BASE_URL, NOCODB_API_TOKEN, dan TABLE_ID.',
    };
  }

  return {
    ok: true as const,
    baseUrl,
    apiToken,
    tableId,
    viewId: process.env.NOCODB_VIEW_ID,
    fieldNamaLengkap: 'namaLengkap',
    fieldAlamatEmail: 'alamatEmail',
    fieldNomorWhatsapp: 'nomorWhatsapp',
    fieldAngkatan: 'angkatan',
    fieldNominalDonasi: 'nominalDonasi',
    fieldBuktiPembayaran: 'buktiPembayaran',
    fieldSubmittedAt: 'submittedAt',
  };
}

export async function POST(request: Request) {
  const env = getRequiredEnv();
  if (!env.ok) {
    return NextResponse.json({ message: env.message }, { status: 500 });
  }

  let body: TCRunPayload;
  try {
    const payload = await request.formData();
    const rawNominal = payload.get('nominalDonasi');
    body = {
      namaLengkap: payload.get('namaLengkap') as string,
      alamatEmail: payload.get('alamatEmail') as string,
      nomorWhatsapp: payload.get('nomorWhatsapp') as string,
      angkatan: payload.get('angkatan') as string,
      nominalDonasi: rawNominal ? Number(rawNominal) : undefined,
      buktiPembayaran: payload.get('buktiPembayaran') as File | null,
      submittedAt: payload.get('submittedAt') as string,
    };
  } catch {
    return NextResponse.json(
      { message: 'Payload tidak valid.' },
      { status: 400 },
    );
  }

  const namaLengkap = body.namaLengkap?.toString().trim();
  const alamatEmail = body.alamatEmail?.toString().trim();
  const nomorWhatsapp = body.nomorWhatsapp?.toString().trim();
  const angkatan = body.angkatan?.toString().trim();

  const nominalDonasi =
    body.nominalDonasi !== undefined && !isNaN(body.nominalDonasi)
      ? body.nominalDonasi
      : null;
  const buktiPembayaran =
    body.buktiPembayaran instanceof File && body.buktiPembayaran.size > 0
      ? body.buktiPembayaran
      : null;

  const submittedAt =
    body.submittedAt?.toString().trim() || new Date().toISOString();

  const hasNominal = nominalDonasi !== null && nominalDonasi > 0;
  const hasBukti = buktiPembayaran !== null;

  // Mutual dependency validation (optional fields, but if one is filled, both must be filled)
  if (hasNominal && !hasBukti) {
    return NextResponse.json(
      {
        message: 'Bukti pembayaran wajib diunggah jika mengisi nominal donasi.',
      },
      { status: 400 },
    );
  }

  if (!hasNominal && hasBukti) {
    return NextResponse.json(
      {
        message: 'Nominal donasi wajib diisi jika mengunggah bukti pembayaran.',
      },
      { status: 400 },
    );
  }

  if (nominalDonasi !== null && (isNaN(nominalDonasi) || nominalDonasi < 0)) {
    return NextResponse.json(
      { message: 'Nominal donasi tidak valid.' },
      { status: 400 },
    );
  }

  if (
    body.buktiPembayaran !== null &&
    body.buktiPembayaran !== undefined &&
    !(body.buktiPembayaran instanceof File)
  ) {
    return NextResponse.json(
      { message: 'bukti pembayaran tidak valid' },
      { status: 400 },
    );
  }

  // General required fields (excluding optional donation/payment proof)
  if (!namaLengkap || !angkatan || !alamatEmail || !nomorWhatsapp) {
    return NextResponse.json(
      { message: 'Semua field wajib diisi.' },
      { status: 400 },
    );
  }

  // Max length
  for (const [key, value] of Object.entries({
    namaLengkap,
    angkatan,
    alamatEmail,
    nomorWhatsapp,
  })) {
    if (value.length > 255) {
      const readableKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
      return NextResponse.json(
        { message: `${readableKey} terlalu panjang. Maksimal 255 karakter.` },
        { status: 400 },
      );
    }
  }

  // File validations (only if buktiPembayaran is provided)
  if (hasBukti) {
    if (!['image/jpeg', 'image/png'].includes(buktiPembayaran.type)) {
      return NextResponse.json(
        {
          message:
            'Format file tidak didukung. Harap upload file JPG atau PNG.',
        },
        { status: 400 },
      );
    }

    if (buktiPembayaran.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Ukuran file terlalu besar. Maksimal 5MB.' },
        { status: 400 },
      );
    }
  }

  if (!alamatEmail.includes('@')) {
    return NextResponse.json(
      { message: 'Alamat email tidak valid.' },
      { status: 400 },
    );
  }

  if (!/^\d{4}$/.test(angkatan) && angkatan.toLocaleLowerCase() !== 'alumni') {
    return NextResponse.json(
      {
        message:
          'Angkatan tidak valid. Harap masukkan tahun yang benar atau tulis "Alumni".',
      },
      { status: 400 },
    );
  }

  if (!/^\d+$/.test(nomorWhatsapp)) {
    return NextResponse.json(
      {
        message: 'Nomor WhatsApp tidak valid. Harap masukkan nomor yang benar.',
      },
      { status: 400 },
    );
  }

  let uploadedFileMeta = null;

  if (hasBukti) {
    const formData = new FormData();
    formData.append('file', buktiPembayaran);

    try {
      const uploadResponse = await fetch(
        `${env.baseUrl}/api/v2/storage/upload`,
        {
          method: 'POST',
          headers: {
            'xc-token': env.apiToken,
          },
          body: formData,
        },
      );
      if (!uploadResponse.ok) {
        throw new Error('Gagal mengunggah file.');
      }
      const uploadResult = await uploadResponse.json();
      uploadedFileMeta = Array.isArray(uploadResult)
        ? uploadResult[0]
        : uploadResult;
    } catch {
      return NextResponse.json(
        { message: 'Gagal mengunggah file.' },
        { status: 500 },
      );
    }
  }

  const endpoint = new URL(
    `/api/v2/tables/${encodeURIComponent(env.tableId)}/records`,
    env.baseUrl,
  );
  if (env.viewId) {
    endpoint.searchParams.set('viewId', env.viewId);
  }

  const rowData: Record<string, any> = {
    [env.fieldNamaLengkap]: namaLengkap,
    [env.fieldAlamatEmail]: alamatEmail,
    [env.fieldNomorWhatsapp]: nomorWhatsapp,
    [env.fieldAngkatan]: angkatan,
    [env.fieldSubmittedAt]: submittedAt,
  };

  if (hasNominal) {
    rowData[env.fieldNominalDonasi] = nominalDonasi;
  }

  if (uploadedFileMeta) {
    const uploadFileArray = [uploadedFileMeta];
    rowData[env.fieldBuktiPembayaran] = uploadFileArray;
  }

  try {
    const nocodbResponse = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xc-token': env.apiToken,
      },
      body: JSON.stringify(rowData),
      cache: 'no-store',
    });

    if (!nocodbResponse.ok) {
      const nocodbError = (await nocodbResponse.json().catch(() => null)) as {
        msg?: string;
        message?: string;
      } | null;
      const message =
        nocodbError?.message ||
        nocodbError?.msg ||
        'Gagal menyimpan data pendaftaran ke NocoDB.';

      return NextResponse.json({ message }, { status: nocodbResponse.status });
    }

    return NextResponse.json(
      { message: 'Pendaftaran berhasil dikirim.' },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Tidak bisa terhubung ke NocoDB self-host.' },
      { status: 502 },
    );
  }
}
