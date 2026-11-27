/**
 * HMTC CMS — mock data for the `/dashboard/cms` shell (task A8).
 *
 * Everything here follows the wire DTOs in `src/lib/cms/dto.ts` exactly, so
 * swapping the mock for real `/api/cms/*` responses later is a data change, not
 * a component change. Department and proker ids come from
 * `directus/seed/10-reference-data.sql` (the production ids), so fixtures stay
 * aligned with what the real API will return.
 *
 * Isomorphic: no secrets, safe to import from client components.
 */
import type { PageSummary } from '@/lib/cms/dto';

const DEPARTMENT = {
  internalAffairs: 'bcee2c03-67a3-4978-a684-c388f9a6541c',
  researchTechnology: '7870e406-aaef-430e-8df8-1c7f8d2b3682',
  studentWelfare: 'ccbbc8b8-f2da-41c0-8ddf-e0591f968dca',
  studentSocialDevelopment: 'bbaafea7-0257-4f1b-9323-3c86501aaeb8',
} as const;

const PROKER = {
  syukuranWisudawan: '04ecbd3c-a83d-4732-a83e-6747d1f8a279',
  academicResources: '9b588eaa-27e2-4a53-92b5-b5bb3c27fbb6',
  seminarDosen: '65242631-5141-44f6-b0d3-5022b7028c0c',
  seminarDosen2: 'a237c086-5c33-4925-9063-eac3b707804b',
  seminarDosen3: '874a9ec9-f917-43ad-bd3e-ee6287fa8a31',
  bluecamp: 'faf07ffb-76be-4a4f-b897-4e970dc99e00',
  tcRun: '14d6cf90-88f0-439d-ad49-39b36ce18a08',
} as const;

/**
 * Sample pages covering every `PageStatus` so the table and the state
 * components can be reviewed without a backend.
 */
export const MOCK_PAGES: readonly PageSummary[] = [
  {
    id: '5f0a2f52-9c6e-4c31-9d47-1a2b3c4d5e01',
    title: 'Syukuran Wisudawan ke-133',
    slug: 'syukuran-wisudawan',
    pageType: 'event',
    status: 'published',
    departmentId: DEPARTMENT.internalAffairs,
    prokerId: PROKER.syukuranWisudawan,
    editionYear: 2026,
    isLive: true,
    publishedAt: '2026-10-28T09:00:00.000Z',
    updatedAt: '2026-11-08T14:30:00.000Z',
    path: '/internal-affairs/syukuran-wisudawan/2026',
  },
  {
    id: '5f0a2f52-9c6e-4c31-9d47-1a2b3c4d5e02',
    title: 'Bluecamp 2026',
    slug: 'bluecamp',
    pageType: 'event',
    status: 'in_review',
    departmentId: DEPARTMENT.researchTechnology,
    prokerId: PROKER.bluecamp,
    editionYear: 2026,
    isLive: false,
    publishedAt: null,
    updatedAt: '2026-11-09T10:12:00.000Z',
    path: '/research-and-technology/bluecamp/2026',
  },
  {
    id: '5f0a2f52-9c6e-4c31-9d47-1a2b3c4d5e03',
    title: 'Seminar Dosen: AI SDLC',
    slug: 'seminar-dosen',
    pageType: 'event',
    status: 'changes_requested',
    departmentId: DEPARTMENT.researchTechnology,
    prokerId: PROKER.seminarDosen,
    editionYear: 2026,
    isLive: false,
    publishedAt: null,
    updatedAt: '2026-11-09T16:45:00.000Z',
    path: '/research-and-technology/seminar-dosen/2026',
  },
  {
    id: '5f0a2f52-9c6e-4c31-9d47-1a2b3c4d5e04',
    title: 'Academic Resources',
    slug: 'academic-resources',
    pageType: 'program',
    status: 'published',
    departmentId: DEPARTMENT.studentWelfare,
    prokerId: PROKER.academicResources,
    editionYear: 2026,
    isLive: true,
    publishedAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-11-01T11:00:00.000Z',
    path: '/student-welfare/academic-resources/2026',
  },
  {
    id: '5f0a2f52-9c6e-4c31-9d47-1a2b3c4d5e05',
    title: 'TC Run 2026',
    slug: 'tc-run',
    pageType: 'event',
    status: 'draft',
    departmentId: DEPARTMENT.studentSocialDevelopment,
    prokerId: PROKER.tcRun,
    editionYear: 2026,
    isLive: false,
    publishedAt: null,
    updatedAt: '2026-11-10T07:20:00.000Z',
    path: '/student-social-development/tc-run/2026',
  },
  {
    id: '5f0a2f52-9c6e-4c31-9d47-1a2b3c4d5e06',
    title: 'Seminar Dosen 2: XR Gamification',
    slug: 'seminar-dosen-2',
    pageType: 'event',
    status: 'archived',
    departmentId: DEPARTMENT.researchTechnology,
    prokerId: PROKER.seminarDosen2,
    editionYear: 2025,
    isLive: false,
    publishedAt: null,
    updatedAt: '2026-06-30T12:00:00.000Z',
    path: '/research-and-technology/seminar-dosen-2/2025',
  },
] as const;
