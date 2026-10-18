import SeminarEventTemplate, {
  type SeminarEventContent,
} from '@/components/seminar/SeminarEventTemplate';

const seminarDosen2Content: SeminarEventContent = {
  breadcrumb: {
    orgName: 'HMTC Niat Baik',
    divisionName: 'Research and Technology',
  },
  title: 'Static and Dynamic Malware Analysis with Real Malware Samples from Honeypot',
  summary:
    'Join Dr. Baskoro Adi Pratomo, S.Kom., M.Kom., Ph.D., Head of Sub-directorate of Application and Digital Platform at ITS, as he dives into the world of cybersecurity — exploring how live network data from honeypots can be used to identify and dissect malicious software behavior.',
  cta: {
    href: '#seminar-registration',
    label: 'Register Now',
  },
  heroImage: {
    src: '/research-and-technology/seminar-dosen-2/hero-cybersecurity.jpg',
    alt: 'Cybersecurity and malware analysis visualization',
  },
  speaker: {
    name: 'Dr. Baskoro Adi Pratomo, S.Kom., M.Kom., Ph.D.',
    title: 'Head of Sub-directorate of Application and Digital Platform, ITS.',
    description:
      'Dr. Baskoro Adi Pratomo, S.Kom., M.Kom., Ph.D. is an Informatics lecturer at ITS specializing in Cybersecurity, with expertise in Honeypots, Network Traffic analysis, Machine Learning, and Intrusion Detection Systems. He presents on "Static and Dynamic Malware Analysis with Real Malware Samples from Honeypot," focusing on how live network data can be utilized to identify and dissect malicious software behavior.',
    imageSrc: '/research-and-technology/seminar-dosen-2/speaker-dr-baskoro.png',
    badges: [
      'Informatics Lecturer @ ITS',
      'Head of Sub-directorate of Application and Digital Platform',
    ],
    stats: [
      { label: 'Publications', value: '40+' },
      { label: 'Citations', value: '12k' },
    ],
  },
  metaItems: [
    { label: 'Date', value: '26 Juni 2026' },
    { label: 'Place', value: 'Online, Zoom Meeting' },
    { label: 'RSVP', value: 'Required' },
  ],
  topics: [
    {
      title: 'Malware Analysis',
      description:
        'Deep dive into static and dynamic techniques for examining real malware samples captured from honeypot deployments to understand malicious behavior.',
      iconKey: 'brainCircuit',
    },
    {
      title: 'Cybersecurity',
      description:
        'The overarching discipline guiding the detection, classification, and mitigation of cyber threats — from network intrusions to advanced persistent threats.',
      iconKey: 'cog',
    },
    {
      title: 'Honeypots',
      description:
        'Decoy systems designed to attract and capture real-world attack traffic, providing authentic malware samples for research and defense strategy development.',
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
      { id: 'fullName', label: 'Nama', placeholder: 'Laila S. Chudori' },
      { id: 'nrp', label: 'NRP', placeholder: '50XXXXXXX' },
      { id: 'angkatan', label: 'Angkatan', placeholder: '2023' },
      {
        id: 'prodi',
        label: 'Prodi',
        placeholder: 'Pilih prodi',
        type: 'select',
        options: ['Teknik Informatika', 'RKA', 'RPL'],
      },
    ],
    submitLabel: 'Daftar',
    apiEndpoint: '/api/seminar-dosen-2',
    successMessage: 'Pendaftaran diterima. Sampai jumpa di sesi seminar!',
    attendanceLink: 'its.id/m/SeminarDosen2ETC2026',
    rsvpClosesAt: '2026-06-26T23:59:59+07:00',
    closedMessage: 'RSVP Closed, thank you',
  },
};

export default function SeminarDosen2() {
  return <SeminarEventTemplate content={seminarDosen2Content} />;
}
