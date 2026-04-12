import { NextResponse } from 'next/server';

type MagicalMessagePayload = {
  doaHarapan?: string;
  namaPenulis?: string;
  submittedAt?: string;
};

function getRequiredEnv() {
  const baseUrl = process.env.NOCODB_BASE_URL;
  const apiToken = process.env.NOCODB_API_TOKEN;
  const tableId = process.env.NOCODB_TABLE_ID;

  if (!baseUrl || !apiToken || !tableId) {
    return {
      ok: false as const,
      message:
        'NocoDB env belum lengkap. Isi NOCODB_BASE_URL, NOCODB_API_TOKEN, dan NOCODB_TABLE_ID.',
    };
  }

  return {
    ok: true as const,
    baseUrl,
    apiToken,
    tableId,
    viewId: process.env.NOCODB_VIEW_ID,
    fieldDoaHarapan: process.env.NOCODB_FIELD_DOA_HARAPAN || 'doaHarapan',
    fieldNamaPenulis: process.env.NOCODB_FIELD_NAMA_PENULIS || 'namaPenulis',
    fieldSubmittedAt: process.env.NOCODB_FIELD_SUBMITTED_AT || 'submittedAt',
  };
}

export async function POST(request: Request) {
  const env = getRequiredEnv();
  if (!env.ok) {
    return NextResponse.json({ message: env.message }, { status: 500 });
  }

  let body: MagicalMessagePayload;
  try {
    body = (await request.json()) as MagicalMessagePayload;
  } catch {
    return NextResponse.json(
      { message: 'Payload JSON tidak valid.' },
      { status: 400 },
    );
  }

  const doaHarapan = body.doaHarapan?.trim();
  const namaPenulis = body.namaPenulis?.trim();
  const submittedAt = body.submittedAt?.trim() || new Date().toISOString();

  if (!doaHarapan || !namaPenulis) {
    return NextResponse.json(
      { message: 'Doa dan Harapan serta Nama Pengirim wajib diisi.' },
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
    [env.fieldDoaHarapan]: doaHarapan,
    [env.fieldNamaPenulis]: namaPenulis,
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
        'Gagal menyimpan data ke NocoDB.';

      return NextResponse.json({ message }, { status: nocodbResponse.status });
    }

    return NextResponse.json(
      { message: 'Pesan berhasil dikirim.' },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Tidak bisa terhubung ke NocoDB self-host.' },
      { status: 502 },
    );
  }
}
