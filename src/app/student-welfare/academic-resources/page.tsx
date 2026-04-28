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
  lede: 'Kumpulan video tutorial mata kuliah dari kakak tingkat untuk teman-teman Teknik Informatika. Dirancang khusus menjelang ETS dan EAS — ringkas, fokus pada soal yang sering keluar, dan dibawakan dengan bahasa yang mudah diikuti. Dukung sesama, satu langkah lebih dekat ke wisuda.',
  hashtags: [
    'P3K-TutorETS',
    'SWNiatBaik',
    'UpdateWebsite',
    'CMINiatBaik',
    'HMTCNiatBaik26',
    'ITSSurabaya',
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
      desc: `
        Kalau esai: Membuat sebuah program dari RISC/CISC. Kalau pilihan ganda: Bisa tentang alokasi memori, syntax RISC/CISC, komponen komputer, flag, dan program I/O.
        Latihan Soal: https://drive.google.com/file/d/1ANMnGMzcpH5o7_r10sjWFzCsvgh7IX5G/view?usp=sharing
        Tips and Trick: Belajar dari berbagai sumber. Misalnya di YouTube ada materi lengkap tentang Organisasi Komputer atau bisa baca buku yang dikasih dosen dan pakai bantuan AI untuk belajar. Selain itu, coba juga untuk niat mengerjakan tugasnya dan setiap ada evaluasi ikut Tutornya Student Welfare HMTC. 
      `,
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
      desc: `
        Jujur ETS aku Competitive Programming sih :v
        Latihan Soal: Kayak praktikum-praktikkum sih
        Tips and Trick: Rajin-rajin main Competitive Programming di website-website gratis kok, kayak TOKI, Hackerrank, SPOJ, LeetCode, Codeforces. Banyak juga yang sudah bahas soal-soalnya di internet, ex. YouTube.
      `,
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
      desc: `
        Overview Computer, Overview OS, Process and Thread, Concurrency (possible)
        Cheat Sheets: https://drive.google.com/file/d/1gtbRBH52zdWsim7c1nGP86UyObVRd8lm/view?usp=sharing, https://drive.google.com/file/d/19YKkR85G0BvCaYdfBtmRWxVuQrbo054A/view?usp=sharing
        Latihan Soal: https://drive.google.com/file/d/1i5BGxNi10hcmnv6AKUNZ7-ahcA4376j5/view?usp=sharing, https://drive.google.com/file/d/1n-G3htBNGyAEJ0VT9f_Q1-ujuHUiYA9L/view?usp=sharing, https://drive.google.com/file/d/1vD6av4n87WbW9rYUsFABN24cvn2vls_4/view?usp=sharing
        Tips and Trick: Baca tidak hanya PPT, tapi lebih ke arah buku kalau mau niat, minusnya dalam bahasa Inggris. Pahami konsep bukan menghafal. Bisa nonton di channel Youtube jugfa buat referensi, tapi balik lagi, kebanyak resource yang bagus pasti dalam bahasa Inggris. Semangat all :)
      `,
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
      desc: `
        Pengenalan Statistika dan Analisis Data, Probabilitas, Variabel Random dan Distribusi Probabilitas, Ekspektasi Matematika, Distribusi Peluang Diskrit
        Cheat Sheets: https://drive.google.com/drive/folders/1hx5ttVRSCYI3Ni5VTc7ocsCYml6oitc_?usp=sharing
        Latihan Soal: https://drive.google.com/drive/folders/1hx5ttVRSCYI3Ni5VTc7ocsCYml6oitc_?usp=sharing
        Tips and Tricks: Belajar yang rajin tentu saja. Jangan sistem kebut semalam. Kalau tidak paham tanya teman, tanya asdos, tanya dosen, tanya siapapun, yang penting jadi paham. Belajar latihan soal ya, jangan cuman hapalin rumus dan teori. Karena hapal belum tentu bisa menerapkan :D
      `,
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
      desc: `
        Supervised Learning (Klasifikasi seperti KNN, Naive Bayes, Decision Tree, Regresi), Umsupervised Learning (K-Means, Hierarchical Clustering),
        Cheat Sheets: https://drive.google.com/file/d/1mz2AMVx2mgK0C3yWcJujf6MXxUuJM3eN/view?usp=sharing
        Latihan Soal: https://docs.google.com/spreadsheets/d/1x9q0Zb0kpWthEXdoXPny_Rp-Anm7TtJQ/edit?usp=sharing&ouid=106297328592408170076&rtpof=true&sd=true
        Tips and Tricks: Belajar yang rajin tentu saja. Jangan sistem kebut semalam. Kalau tidak paham tanya teman, tanya asdos, tanya dosen, tanya siapapun, yang penting jadi paham. Belajar latihan soal ya, jangan cuman hapalin rumus dan teori. Karena hapal belum tentu bisa menerapkan :D
      `,
      youtubeId: 'rhBxcw5aPZM',
    },
  ],
};

export default function AcademicResourcesPage() {
  return <AcademicResourcesTemplate content={academicResourcesContent} />;
}
