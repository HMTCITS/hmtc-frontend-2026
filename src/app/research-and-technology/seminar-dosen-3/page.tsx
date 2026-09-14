import SeminarEventTemplate, {
  type SeminarEventContent,
} from '@/components/seminar/SeminarEventTemplate';

const seminarDosen3Content: SeminarEventContent = {
  breadcrumb: {
    orgName: 'HMTC Niat Baik',
    divisionName: 'Research and Technology',
  },
  title: 'Learning by Experiencing: The Application of Extended Reality and Gamification in Training, Education, and Communities',
  summary:
    'Join Hadziq Fabroyir, S.Kom., Ph.D., Lecturer at the Grafika, Interaksi, Gim, dan Analitika Laboratory, ITS, as he explores how Extended Reality (XR), immersive technology, and gamification can transform the way we learn, train, and engage with communities.',
  cta: {
    href: '#seminar-registration-3',
    label: 'Register Now',
  },
  heroImage: {
    src: '/research-and-technology/seminar-dosen-3/hero-xr-gamification.png',
    alt: 'Extended Reality and Gamification in Training, Education, and Communities',
  },
  speaker: {
    name: 'Hadziq Fabroyir, S.Kom., Ph.D.',
    title: 'Lecturer at the Grafika, Interaksi, Gim, dan Analitika Laboratory, ITS',
    description:
      'Hadziq Fabroyir, S.Kom., Ph.D. is an Informatics lecturer at ITS specializing in Extended Reality (XR), Human-Computer Interaction, and immersive digital experiences. His work explores how emerging technologies, gamification, and design thinking can be applied to education, training, and community engagement.',
    imageSrc: '/research-and-technology/seminar-dosen-3/speaker-hadziq.png',
    badges: [
      'Informatics Lecturer @ ITS',
      'Lecturer of Grafika, Interaksi, Gim, dan Analitika (GIGa) Laboratory @ ITS',
    ],
    stats: [
      { label: 'Publications', value: '40+' },
      { label: 'Citations', value: '300+' },
    ],
  },
  metaItems: [
    { label: 'Date', value: '2 Oktober 2026' },
    { label: 'Place', value: 'Offline, IF-105 Department of Informatics' },
    { label: 'RSVP', value: 'Required (Limited to 80 People)' },
  ],
  topics: [
    {
      title: 'Extended Reality (XR)',
      description:
        'Exploring the potential of immersive technologies to enhance learning and engagement in various domains.',
      iconKey: 'glasses',
    },
    {
      title: 'Gamification',
      description:
        'The application of game-design elements and principles in non-game contexts to enhance learning, training, and community engagement.',
      iconKey: 'gamepad2',
    },
    {
      title: 'Experiential Learning',
      description:
        'Learning through direct experience and reflection, often involving hands-on activities and real-world applications.',
      iconKey: 'bookOpen',
    },
  ],
  registration: {
    id: 'seminar-registration-3',
    eyebrow: 'Seminar Dosen',
    title: 'Secure Your Spot',
    description:
      'Registration is mandatory to attend this session. Please fill out the form below to secure your spot. Note that the seminar is limited to 80 participants, so register early to ensure your place.',
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
    apiEndpoint: '/api/seminar-dosen-3',
    successMessage: 'Pendaftaran diterima. Sampai jumpa di sesi seminar!',
    rsvpClosesAt: '2026-10-02T23:59:59+07:00',
    closedMessage: 'RSVP Closed, thank you',
    quota: 80,
  },
};

export default function SeminarDosen3() {
  return <SeminarEventTemplate content={seminarDosen3Content} />;
}
