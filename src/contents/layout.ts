import { PROKER_BASE_PATHS, prokerHref } from '@/lib/config';

// Proker links are year-scoped (`/<domain>/<proker>/<year>`); the year comes
// from `src/lib/config.ts` and must not be written here.
export const NAVBAR_LINKS = [
  { id: 1, name: 'Beranda', href: '/', offset: -50 },
  {
    id: 2,
    name: 'Academic Resources',
    href: prokerHref(PROKER_BASE_PATHS.academicResources),
    offset: 1500,
  },
  // { id: 3, name: 'Gallery', href: '#gallery', offset: -100 },
  { id: 4, name: 'Info', href: '/info' },
];

export const PROGRAM_KERJA_LINKS = [
  {
    id: 1,
    label: 'Syukuran Wisuda',
    href: prokerHref(PROKER_BASE_PATHS.syukuranWisudawan),
    offset: -80,
  },
  {
    id: 2,
    label: 'Video Tutorial',
    href: prokerHref(PROKER_BASE_PATHS.academicResources),
    offset: -80,
  },
  {
    id: 3,
    label: 'Seminar Dosen 1',
    href: prokerHref(PROKER_BASE_PATHS.seminarDosen),
    offset: -80,
  },
  {
    id: 4,
    label: 'Seminar Dosen 2',
    href: prokerHref(PROKER_BASE_PATHS.seminarDosen2),
    offset: -80,
  },
  {
    id: 5,
    label: 'Seminar Dosen 3',
    href: prokerHref(PROKER_BASE_PATHS.seminarDosen3),
    offset: -80,
  },
  {
    id: 6,
    label: 'Bluecamp',
    href: prokerHref(PROKER_BASE_PATHS.bluecamp),
    offset: -80,
  },
  {
    id: 7,
    label: 'TC Run',
    href: prokerHref(PROKER_BASE_PATHS.tcRun),
    offset: -80,
  },
];

export const Misi = [
  {
    text: 'Membina kekeluargaan dengan menjaga keharmonisan dan kebersamaan di lingkup internal Teknik Informatika ITS berlandaskan asas keterbukaan dan saling menghargai. ',
  },
  {
    text: 'Membentuk perilaku yang responsif serta membudayakan umpan balik yang efektif.',
  },
  {
    text: 'Menciptakan dan memperkuat hubungan dengan stakeholder demi meningkatkan perkembangan HMTC ITS.',
  },
  {
    text: 'Optimasi pengembangan potensi mahasiswa Teknik Informatika. ',
  },
];
