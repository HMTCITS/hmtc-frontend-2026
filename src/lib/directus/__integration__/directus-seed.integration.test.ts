/**
 * Integration tests against a real local Directus (`pnpm directus:setup`).
 *
 * They check what the CMS relies on from the schema, migrations and seed:
 * the development users can log in, see only their own membership, the
 * reader token is limited to public data, and Directus rotates and revokes
 * refresh tokens the way the session code expects.
 *
 * Talks to Directus over plain fetch so it does not depend on app code.
 * Fails (does not skip) when Directus is unreachable, so a broken CI setup
 * cannot pass.
 */

const DIRECTUS_URL = (
  process.env.DIRECTUS_URL ?? 'http://localhost:8055'
).replace(/\/+$/, '');
const READER_TOKEN =
  process.env.DIRECTUS_READ_TOKEN ?? 'local-nextjs-reader-token';

const RESEARCH_TECHNOLOGY = {
  id: '7870e406-aaef-430e-8df8-1c7f8d2b3682',
  slug: 'research-and-technology',
};

const DEV_USERS = [
  {
    email: 'editor@example.com',
    password: 'editor-local',
    id: 'd0000000-0000-4000-8000-000000000001',
    role: 'editor',
  },
  {
    email: 'reviewer@example.com',
    password: 'reviewer-local',
    id: 'd0000000-0000-4000-8000-000000000002',
    role: 'reviewer',
  },
  {
    email: 'publisher@example.com',
    password: 'publisher-local',
    id: 'd0000000-0000-4000-8000-000000000003',
    role: 'publisher',
  },
] as const;

const EDITOR = DEV_USERS[0];

type Tokens = { access_token: string; refresh_token: string; expires: number };

async function call(
  path: string,
  init: { method?: string; token?: string; body?: unknown } = {},
): Promise<{ status: number; json: any }> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await response.text();
  return { status: response.status, json: text ? JSON.parse(text) : null };
}

async function login(email: string, password: string): Promise<Tokens> {
  const { status, json } = await call('/auth/login', {
    method: 'POST',
    body: { email, password, mode: 'json' },
  });
  expect(status).toBe(200);
  return json.data as Tokens;
}

function refresh(refreshToken: string) {
  return call('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken, mode: 'json' },
  });
}

beforeAll(async () => {
  let health: Response;
  try {
    health = await fetch(`${DIRECTUS_URL}/server/health`);
  } catch (error) {
    throw new Error(
      `Directus is not reachable at ${DIRECTUS_URL}. Run \`pnpm directus:setup\` first. (${String(error)})`,
    );
  }
  if (!health.ok) {
    throw new Error(
      `Directus at ${DIRECTUS_URL} is unhealthy (HTTP ${health.status}).`,
    );
  }
});

describe.each(DEV_USERS)('dev user $email', (user) => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = (await login(user.email, user.password)).access_token;
  });

  it('logs in with the seeded password', () => {
    expect(accessToken).toEqual(expect.any(String));
  });

  it('reads its own profile through /users/me', async () => {
    const { status, json } = await call(
      '/users/me?fields=id,email,first_name,last_name',
      { token: accessToken },
    );
    expect(status).toBe(200);
    expect(json.data).toMatchObject({ id: user.id, email: user.email });
  });

  it('is not an admin', async () => {
    const { status, json } = await call('/policies/me/globals', {
      token: accessToken,
    });
    expect(status).toBe(200);
    expect(json.data.admin_access).toBe(false);
  });

  it(`sees exactly its own active ${user.role} membership in research-and-technology`, async () => {
    const query = new URLSearchParams({
      'filter[user][_eq]': '$CURRENT_USER',
      'filter[is_active][_eq]': 'true',
      fields: 'membership_role,department.id,department.slug',
      limit: '-1',
    });
    const { status, json } = await call(
      `/items/cms_department_memberships?${query}`,
      { token: accessToken },
    );
    expect(status).toBe(200);
    expect(json.data).toEqual([
      { membership_role: user.role, department: RESEARCH_TECHNOLOGY },
    ]);
  });

  it("cannot read other users' memberships", async () => {
    const { status, json } = await call(
      '/items/cms_department_memberships?fields=user&limit=-1',
      { token: accessToken },
    );
    expect(status).toBe(200);
    const owners = new Set(
      (json.data as Array<{ user: string }>).map((row) => row.user),
    );
    expect(Array.from(owners)).toEqual([user.id]);
  });
});

describe('reader token', () => {
  it('reads active departments', async () => {
    const { status, json } = await call(
      '/items/cms_departments?fields=id,slug&limit=-1',
      { token: READER_TOKEN },
    );
    expect(status).toBe(200);
    expect(json.data).toEqual(
      expect.arrayContaining([
        { id: RESEARCH_TECHNOLOGY.id, slug: RESEARCH_TECHNOLOGY.slug },
      ]),
    );
  });

  it('cannot read department memberships', async () => {
    const { status } = await call('/items/cms_department_memberships', {
      token: READER_TOKEN,
    });
    expect(status).toBe(403);
  });
});

describe('refresh tokens', () => {
  it('rotate on refresh, and the old one is rejected afterwards', async () => {
    const first = await login(EDITOR.email, EDITOR.password);

    const rotated = await refresh(first.refresh_token);
    expect(rotated.status).toBe(200);
    expect(rotated.json.data.refresh_token).not.toBe(first.refresh_token);

    const reused = await refresh(first.refresh_token);
    expect(reused.status).toBe(401);
  });

  it('are revoked by logout', async () => {
    const tokens = await login(EDITOR.email, EDITOR.password);

    const logout = await call('/auth/logout', {
      method: 'POST',
      body: { refresh_token: tokens.refresh_token, mode: 'json' },
    });
    expect(logout.status).toBe(204);

    const reused = await refresh(tokens.refresh_token);
    expect(reused.status).toBe(401);
  });

  it('reject a wrong password with INVALID_CREDENTIALS', async () => {
    const { status, json } = await call('/auth/login', {
      method: 'POST',
      body: { email: EDITOR.email, password: 'wrong', mode: 'json' },
    });
    expect(status).toBe(401);
    expect(json.errors[0].extensions.code).toBe('INVALID_CREDENTIALS');
  });
});
