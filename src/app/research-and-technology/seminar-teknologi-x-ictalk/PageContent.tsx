import SeminarEventTemplate, {
  type SeminarEventContent,
} from '@/components/seminar/SeminarEventTemplate';

const seminarDosen4Content: SeminarEventContent = {
  breadcrumb: {
    orgName: 'HMTC Niat Baik',
    divisionName: 'Research and Technology',
  },
  title: 'Your Cloud Bill, Decoded: Where the Money Goes and How to Optimize',
  summary:
    'Join Harafi from the Indonesia Cloud Community (iCCom) as he explains why cloud costs keep rising, how to identify what is driving them, and which optimization strategies actually reduce spending, illustrated with a real-world case study.',
  cta: {
    href: '#seminar-registration-4',
    label: 'Register Now',
  },
  heroImage: {
    src: '/research-and-technology/seminar-dosen-4/hero-iccom-cloud-cost.webp',
    alt: 'Indonesia Cloud Community logo',
  },
  speaker: {
    name: 'Harafi',
    title: 'AWS Solutions Architect / Staff at PT. Central Data Technology',
    description:
      'Harafi is an AWS Solutions Architect and Staff at PT. Central Data Technology, presenting for the Indonesia Cloud Community (iCCom) on cloud cost management and optimization.',
    imageSrc: '/research-and-technology/seminar-dosen-4/speaker-harafi.webp',
    badges: [
      'AWS Solutions Architect',
      'Staff at PT. Central Data Technology',
      'Indonesia Cloud Community (iCCom)',
    ],
    stats: [],
  },
  metaItems: [
    { label: 'Date', value: '11 November 2026' },
    { label: 'Place', value: 'Online, Zoom Meeting' },
    { label: 'RSVP', value: 'Required' },
  ],
  topics: [
    {
      title: 'Why Cloud Costs Keep Rising',
      description:
        'Understanding the common reasons cloud spending grows over time, even when usage seems under control.',
      iconKey: 'refreshCcw',
    },
    {
      title: 'Identifying Cost Drivers',
      description:
        'How to find out which services, resources and usage patterns are responsible for the bill.',
      iconKey: 'brainCircuit',
    },
    {
      title: 'Cloud Cost Optimization Strategies',
      description:
        'Practical strategies to reduce cloud spending without sacrificing how the workload runs.',
      iconKey: 'cog',
    },
    {
      title: 'Real-World Cost Optimization Case Study',
      description:
        'A walkthrough of a real cost optimization case, from the initial problem to the outcome.',
      iconKey: 'bookOpen',
    },
  ],
  benefits: [
    'Learn how to use the cloud properly and correctly.',
    'Get direct access to discuss topics with the speaker.',
    'Learn how to optimize your cloud spending.',
    'Attractive door prizes for lucky participants.',
    'Receive a Certificate.',
  ],
  registration: {
    id: 'seminar-registration-4',
    eyebrow: 'Seminar Dosen',
    title: 'Secure Your Spot',
    description:
      'Registration is mandatory to attend this session. Please fill out the form below to secure your spot.',
    fields: [
      { id: 'fullName', label: 'Nama', placeholder: 'Laila S. Chudori' },
      { id: 'email', label: 'Email', placeholder: 'nama@email.com' },
      { id: 'phone', label: 'Nomor HP', placeholder: '08XXXXXXXXXX' },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        placeholder: 'https://linkedin.com/in/username',
      },
      { id: 'company', label: 'Company', placeholder: 'Nama perusahaan' },
    ],
    submitLabel: 'Daftar',
    apiEndpoint: '/api/seminar-dosen-4',
    successMessage: 'Pendaftaran diterima. Sampai jumpa di sesi seminar!',
    rsvpClosesAt: '2026-11-11T21:00:00+07:00',
    closedMessage: 'RSVP Closed, thank you',
  },
};

export default function SeminarDosen4() {
  return <SeminarEventTemplate content={seminarDosen4Content} />;
}
