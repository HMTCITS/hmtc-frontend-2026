import { NextResponse } from 'next/server';

type SeminarDosenPayload = {
  fullName?: string;
  nrp?: string;
  prodi?: string;
  submittedAt?: string;
};

function getRequiredEnv() {
  const baseUrl = process.env.NOCODB_BASE_URL;
  const apiToken = process.env.NOCODB_API_TOKEN;
  const tableId = process.env.NOCODB_SEMINAR_DOSEN_TABLE_ID;

  if (!baseUrl || !apiToken || !tableId) {
    return {
      ok: false as const,
      message:
        'NocoDB env belum lengkap. Isi NOCODB_BASE_URL, NOCODB_API_TOKEN, dan NOCODB_SEMINAR_DOSEN_TABLE_ID.',
    };
  }

  return {
    ok: true as const,
    baseUrl,
    apiToken,
    tableId,
    viewId:
      process.env.NOCODB_SEMINAR_DOSEN_VIEW_ID || process.env.NOCODB_VIEW_ID,
    fieldFullName:
      process.env.NOCODB_FIELD_SEMINAR_DOSEN_FULL_NAME || 'fullName',
    fieldNrp: process.env.NOCODB_FIELD_SEMINAR_DOSEN_NRP || 'nrp',
    fieldProdi: process.env.NOCODB_FIELD_SEMINAR_DOSEN_PRODI || 'prodi',
    fieldSubmittedAt:
      process.env.NOCODB_FIELD_SEMINAR_DOSEN_SUBMITTED_AT || 'submittedAt',
  };
}

export async function POST(request: Request) {
  const env = getRequiredEnv();
  if (!env.ok) {
    return NextResponse.json({ message: env.message }, { status: 500 });
  }

  let body: SeminarDosenPayload;
  try {
    body = (await request.json()) as SeminarDosenPayload;
  } catch {
    return NextResponse.json(
      { message: 'Payload JSON tidak valid.' },
      { status: 400 },
    );
  }

  const fullName = body.fullName?.trim();
  const nrp = body.nrp?.trim();
  const prodi = body.prodi?.trim();
  const submittedAt = body.submittedAt?.trim() || new Date().toISOString();

  if (!fullName || !nrp || !prodi) {
    return NextResponse.json(
      { message: 'Full Name, NRP, dan Prodi wajib diisi.' },
      { status: 400 },
    );
  }

  const endpoint = new URL(
    `/api/v2/tables/${encodeURIComponent(env.tableId)}/records`,
    env.baseUrl,
  );
  if (env.viewId) {
    endpoint.searchParams.set('viewId', env.viewId);
  }

  const rowData: Record<string, string> = {
    [env.fieldFullName]: fullName,
    [env.fieldNrp]: nrp,
    [env.fieldProdi]: prodi,
    [env.fieldSubmittedAt]: submittedAt,
  };

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
        'Gagal menyimpan data seminar ke NocoDB.';

      return NextResponse.json({ message }, { status: nocodbResponse.status });
    }

    return NextResponse.json(
      { message: 'Pendaftaran seminar berhasil dikirim.' },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Tidak bisa terhubung ke NocoDB self-host.' },
      { status: 502 },
    );
  }
}
