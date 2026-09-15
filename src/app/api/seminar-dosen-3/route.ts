import { NextResponse } from 'next/server';

type SeminarDosen3Payload = {
  fullName?: string;
  nrp?: string;
  angkatan?: string;
  prodi?: string;
  submittedAt?: string;
};

function getRequiredEnv() {
  const baseUrl = process.env.NOCODB_BASE_URL;
  const apiToken = process.env.NOCODB_API_TOKEN;
  const tableId = process.env.NOCODB_SEMINAR_DOSEN_3_TABLE_ID;

  if (!baseUrl || !apiToken || !tableId) {
    return {
      ok: false as const,
      message:
        'NocoDB env belum lengkap. Isi NOCODB_BASE_URL, NOCODB_API_TOKEN, dan NOCODB_SEMINAR_DOSEN_3_TABLE_ID.',
    };
  }

  return {
    ok: true as const,
    baseUrl,
    apiToken,
    tableId,
    viewId:
      process.env.NOCODB_SEMINAR_DOSEN_3_VIEW_ID || process.env.NOCODB_VIEW_ID,
    fieldFullName:
      process.env.NOCODB_FIELD_SEMINAR_DOSEN_3_FULL_NAME || 'fullName',
    fieldNrp: process.env.NOCODB_FIELD_SEMINAR_DOSEN_3_NRP || 'nrp',
    fieldAngkatan:
      process.env.NOCODB_FIELD_SEMINAR_DOSEN_3_ANGKATAN || 'angkatan',
    fieldProdi: process.env.NOCODB_FIELD_SEMINAR_DOSEN_3_PRODI || 'prodi',
    fieldSubmittedAt:
      process.env.NOCODB_FIELD_SEMINAR_DOSEN_3_SUBMITTED_AT || 'submittedAt',
  };
}

function getQuota(): number {
  const raw = process.env.NOCODB_SEMINAR_DOSEN_3_QUOTA;
  const parsed = raw ? Number.parseInt(raw, 10) : 80;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 80;
}

async function fetchRecordCount(params: {
  baseUrl: string;
  apiToken: string;
  tableId: string;
  viewId?: string;
}): Promise<number> {
  const endpoint = new URL(
    `/api/v2/tables/${encodeURIComponent(params.tableId)}/records/count`,
    params.baseUrl,
  );
  if (params.viewId) {
    endpoint.searchParams.set('viewId', params.viewId);
  }

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    headers: { 'xc-token': params.apiToken },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`NocoDB count gagal: ${response.status}`);
  }

  const data = (await response.json().catch(() => ({}))) as { count?: number };
  return data.count ?? 0;
}

export async function GET() {
  const env = getRequiredEnv();
  if (!env.ok) {
    return NextResponse.json({ message: env.message }, { status: 500 });
  }

  const quota = getQuota();

  try {
    const count = await fetchRecordCount(env);
    return NextResponse.json({ count, quota, isFull: count >= quota });
  } catch {
    return NextResponse.json(
      { message: 'Tidak bisa terhubung ke NocoDB self-host.' },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const env = getRequiredEnv();
  if (!env.ok) {
    return NextResponse.json({ message: env.message }, { status: 500 });
  }

  let body: SeminarDosen3Payload;
  try {
    body = (await request.json()) as SeminarDosen3Payload;
  } catch {
    return NextResponse.json(
      { message: 'Payload JSON tidak valid.' },
      { status: 400 },
    );
  }

  const fullName = body.fullName?.trim();
  const nrp = body.nrp?.trim();
  const angkatan = body.angkatan?.trim();
  const prodi = body.prodi?.trim();
  const submittedAt = body.submittedAt?.trim() || new Date().toISOString();

  if (!fullName || !nrp || !angkatan || !prodi) {
    return NextResponse.json(
      { message: 'Nama, NRP, Angkatan, dan Prodi wajib diisi.' },
      { status: 400 },
    );
  }

  const quota = getQuota();
  try {
    const currentCount = await fetchRecordCount(env);
    if (currentCount >= quota) {
      return NextResponse.json(
        { message: 'Kuota sudah penuh. Pendaftaran ditutup.' },
        { status: 409 },
      );
    }
  } catch (error) {
    void error;
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
    [env.fieldAngkatan]: angkatan,
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
