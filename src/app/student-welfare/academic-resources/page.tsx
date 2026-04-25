import AcademicResourcesTemplate, {
  type AcademicResourcesContent,
} from '@/components/student-welfare/AcademicResourcesTemplate';

const academicResourcesContent: AcademicResourcesContent = {
  breadcrumb: {
    orgName: 'HMTC Niat Baik',
    sectionName: 'Student Welfare',
  },
  title: {
    main: 'Belajar bareng,',
    emphasis: 'sama-sama lulus.',
  },
  lede: 'Kumpulan video tutorial mata kuliah dari kakak tingkat untuk teman-teman Teknik Komputer. Dirancang khusus menjelang ETS dan EAS — ringkas, fokus pada soal yang sering keluar, dan dibawakan dengan bahasa yang mudah diikuti. Dukung sesama, satu langkah lebih dekat ke wisuda.',
  hashtags: [
    'StudentWelfare',
    'HMTCNiatBaik',
    'BelajarBareng',
    'HMTCITS',
    'ITDevKeren',
  ],
  tutorials: [
    {
      id: 1,
      course: 'Organisasi Komputer',
      title: 'Tutor ETS ORKOM 2026',
      type: 'ETS',
      year: '2025/2026',
      semester: 'Genap',
      duration: '24:18',
      tutor: 'Nyoman Surya Hutama Andyartha',

      desc: '-',
      youtubeId: 'P_mP47wqCLQ',
    },
    {
      id: 2,
      course: 'Struktur Data',
      title: 'Tutor ETS Struktur Data 2026',
      type: 'ETS',
      year: '2025/2026',
      semester: 'Genap',
      duration: '32:05',
      tutor: 'Mitra Partogi',

      desc: '-',
      youtubeId: 'LxMQUPs2Jow',
    },
    {
      id: 3,
      course: 'Sistem Operasi',
      title: 'Tutor ETS Sistem Operasi 2026',
      type: 'ETS',
      year: '2025/2026',
      semester: 'Genap',
      duration: '18:42',
      tutor: '-',

      desc: '-',
      youtubeId: 'qMD0GpiIUhc',
    },
    {
      id: 4,
      course: 'Probabilitas dan Statistika',
      title: 'Tutor ETS Probabilitas & Statistika 2026',
      type: 'ETS',
      year: '2025/2026',
      semester: 'Genap',
      duration: '41:22',
      tutor: 'Thalita Aika Rahmani',

      desc: '-',
      youtubeId: 'iKqxw6hzx0c',
    },
    {
      id: 5,
      course: 'Machine Learning',
      title: 'Tutor ETS Machine Learning/PM 2025',
      type: 'ETS',
      year: '2025/2026',
      semester: 'Genap',
      duration: '27:55',
      tutor: 'Tamam Fajar Briliansyah',

      desc: '-',
      youtubeId: 'rhBxcw5aPZM',
    }
  ],
};

export default function AcademicResourcesPage() {
  return <AcademicResourcesTemplate content={academicResourcesContent} />;
}
