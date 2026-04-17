import SeminarEventTemplate, {
  type SeminarEventContent,
} from '@/components/seminar/SeminarEventTemplate';

const seminarDosenContent: SeminarEventContent = {
  breadcrumb: {
    orgName: 'HMTC Niat Baik',
    divisionName: 'Research and Technology',
  },
  title:
    'Transforming Software Development with AI: From Requirements to Deployment',
  summary:
    'Join Dr. Sarwosri, S.Kom., M.T., an esteemed Informatics lecturer and Software Engineering expert from ITS, as she explores the paradigm shift in the modern software development landscape.',
  cta: {
    href: '#seminar-registration',
    label: 'Register Now',
  },
  heroImage: {
    src: '/research-and-technology/seminar-dosen/hero-ai-sdlc.png',
    alt: 'Code editor and AI assistant suggestion panel',
  },
  speaker: {
    name: 'Dr. Sarwosri, S.Kom., M.T.',
    title: 'Head of Software Engineering Laboratory, ITS.',
    description:
      'Dr. Sarwosri, S.Kom., M.T. is an Informatics lecturer at ITS specializing in Software Engineering, with expertise in Software Quality Measurement, Process Improvement, Ontology Modeling, and Software Cost Estimation.',
    imageSrc: '/research-and-technology/seminar-dosen/speaker-dr-sarwosri.png',
    badges: [
      'Informatics Lecturer @ ITS',
      'Head of Software Engineering Laboratory',
    ],
    stats: [
      { label: 'Publications', value: '47' },
      { label: 'Citations', value: '112' },
    ],
  },
  metaItems: [
    { label: 'Date', value: '24 April 2026' },
    { label: 'Place', value: 'Online, Zoom Meeting' },
    { label: 'RSVP', value: 'Required' },
  ],
  topics: [
    {
      title: 'Artificial Intelligence',
      description:
        'The primary engine driving the transformation of manual tasks into automated, intelligent processes across the entire software ecosystem.',
      iconKey: 'brainCircuit',
    },
    {
      title: 'Software Development Life Cycle',
      description:
        'The core framework being redefined, showing how AI integration accelerates the journey from initial requirements to final deployment.',
      iconKey: 'cog',
    },
    {
      title: 'Process Improvement',
      description:
        'The ultimate goal: utilizing software quality metrics and AI to eliminate bottlenecks and elevate the standards of development workflows.',
      iconKey: 'refreshCcw',
    },
  ],
  registration: {
    id: 'seminar-registration',
    eyebrow: 'Seminar Dosen',
    title: 'Secure Your Spot',
    description:
      'Registration is mandatory to attend this session. Upon successful RSVP, the Zoom meeting link will be shown.',
    fields: [
      { id: 'fullName', label: 'Full Name', placeholder: 'Laila S. Chudori' },
      { id: 'nrp', label: 'NRP', placeholder: '50XXXXXXX' },
      {
        id: 'prodi',
        label: 'Prodi',
        placeholder: 'Teknik Informatika',
      },
    ],
    submitLabel: 'Daftar',
    apiEndpoint: '/api/seminar-dosen',
    successMessage: 'Pendaftaran diterima. Sampai jumpa di sesi seminar!',
    rsvpClosesAt: '2026-04-24T23:59:59+07:00',
    closedMessage: 'RSVP Closed, thank you',
  },
};

export default function SeminarDosen() {
  return <SeminarEventTemplate content={seminarDosenContent} />;
}
