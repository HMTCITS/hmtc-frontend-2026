const TIMELINE_ITEMS = [
  {
    day: '01',
    label: 'Hari Pertama',
    title: 'Pembukaan & Fondasi Keilmiahan',
    description: 'Mengenal arah Bluecamp 2026 dan membangun dasar berpikir ilmiah sebelum masuk ke eksplorasi gagasan.',
    sessions: [
      {
        time: '08.00',
        title: 'Registrasi & Pembukaan',
        detail: 'Pengarahan dan ice breaking peserta',
        role: 'P',
        name: 'Panitia',
      },
      {
        time: '10.00',
        title: 'Dasar Metodologi Penelitian',
        detail: 'Kerangka berpikir ilmiah & perumusan masalah',
        role: 'P',
        name: 'Pemateri 1',
      },
      {
        time: '13.30',
        title: 'Literasi & Penelusuran Referensi',
        detail: 'Membaca, menyaring, dan mengutip sumber',
        role: 'P',
        name: 'Pemateri 2',
      },
    ],
  },
  {
    day: '02',
    label: 'Hari Kedua',
    title: 'Eksplorasi & Pengembangan Ide',
    description: 'Peserta menggali ide, berdiskusi lintas kelompok, dan mulai membentuk arah proyek keilmiahan.',
    sessions: [
      {
        time: '09.00',
        title: 'Workshop Pengembangan Ide',
        detail: 'Dari rasa ingin tahu menjadi rumusan gagasan',
        role: 'P',
        name: 'Pemateri 3',
      },
      {
        time: '11.00',
        title: 'Diskusi Kelompok',
        detail: 'Pendalaman topik bersama mentor',
        role: 'M',
        name: 'Mentor',
      },
      {
        time: '14.00',
        title: 'Talkshow Riset & Teknologi',
        detail: 'Inspirasi dari praktik riset terkini',
        role: 'N',
        name: 'Narasumber',
      },
    ],
  },
  {
    day: '03',
    label: 'Hari Ketiga',
    title: 'Presentasi & Penutupan',
    description: 'Puncak rangkaian — peserta mempresentasikan hasil eksplorasi dan merayakan perjalanannya.',
    sessions: [
      {
        time: '09.00',
        title: 'Mentoring Akhir',
        detail: 'Pematangan proyek sebelum presentasi',
        role: 'M',
        name: 'Mentor',
      },
      {
        time: '11.00',
        title: 'Presentasi Proyek Peserta',
        detail: 'Memaparkan gagasan & temuan',
        role: 'P',
        name: 'Peserta',
      },
      {
        time: '14.00',
        title: 'Apresiasi & Penutupan',
        detail: 'Refleksi dan penutupan Bluecamp 2026',
        role: 'P',
        name: 'Panitia',
      },
    ],
  },
];

export default function Timeline() {
  return (
    <section id='program' className='py-[118px]'>
      <div className='mx-auto max-w-[1180px] px-6 md:px-8'>
        <div className='mb-[54px] max-w-[760px]'>
          <span className='inline-flex items-center gap-[0.6em] text-[0.72rem] font-bold tracking-[0.22em] text-[#1561BD] uppercase'>
            <svg
              className='h-2 w-[22px] text-[#E88E00]'
              viewBox='0 0 24 12'
              fill='currentColor'
            >
              <path d='M0 0l8 6-8 6zM8 0l8 6-8 6z'></path>
            </svg>
            Detail Program
          </span>
          <h2 className='mt-4 text-[clamp(2rem,4.2vw,3.3rem)] leading-none font-black tracking-tight text-[#14181f] uppercase'>
            Alur <span className='text-[#E88E00]'>Kegiatan</span>
          </h2>
          <p className='mt-[18px] max-w-[640px] text-[1.08rem] text-[#3a424e]'>
            Susunan agenda harian Bluecamp 2026, lengkap dengan sorotan sesi,
            topik, dan pemateri di setiap harinya.
          </p>
        </div>

        <div className="relative mt-2 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-[2px] before:bg-gradient-to-b before:from-[#1561BD] before:to-[#5D92D0] before:content-[''] md:before:left-[138px]">
          {TIMELINE_ITEMS.map((item) => (
            <div key={item.day} className='relative mb-8 pl-8 md:pl-[200px]'>
              <div className='top-0 left-0 mb-3 flex w-auto items-baseline gap-3 text-left md:absolute md:mb-0 md:block md:w-[118px] md:text-right'>
                <div className='text-3xl leading-none font-extrabold text-[#1561BD] md:text-[2.4rem]'>
                  {item.day}
                </div>
                <div className='mt-1 text-[0.66rem] font-bold tracking-widest text-[#6b7585] uppercase'>
                  Hari
                </div>
              </div>
              <span
                className={`absolute top-2 left-[1px] z-10 h-4 w-4 rounded-full border-[3px] bg-white md:left-[131px] ${item.day === '03' ? 'border-[#FFB23A]' : 'border-[#1561BD]'}`}
              ></span>
              <div className='rounded-[5px] border border-[#e4e9f0] bg-white p-6 shadow-md shadow-[#073a76]/5'>
                <div className='mb-[6px] flex flex-wrap items-baseline justify-between gap-2'>
                  <h3 className='text-xl font-black tracking-tight text-[#14181f] uppercase'>
                    {item.title}
                  </h3>
                  <span className='text-[0.82rem] font-bold tracking-wide text-[#0A4A98]'>
                    {item.label}
                  </span>
                </div>
                <p className='mb-[18px] text-[0.98rem] text-[#3a424e]'>
                  {item.description}
                </p>
                <div className='flex flex-col border-t border-[#e4e9f0]'>
                  {item.sessions.map((session, index) => (
                    <div
                      key={index}
                      className='grid grid-cols-1 items-center gap-[6px] border-b border-[#e4e9f0] py-[13px] last:border-b-0 md:grid-cols-[96px_1fr_auto] md:gap-4'
                    >
                      <span className='text-[0.9rem] font-bold text-[#1561BD] tabular-nums'>
                        {session.time}
                      </span>
                      <div className='flex flex-col gap-1'>
                        <div className='text-[0.98rem] font-bold text-[#14181f]'>
                          {session.title}
                        </div>
                        <div className='text-sm text-[#6b7585]'>
                          {session.detail}
                        </div>
                      </div>
                      <div className='mt-2 flex items-center gap-[9px] md:mt-0'>
                        <span className='grid h-[30px] w-[30px] place-items-center rounded-full bg-[#eaf1fa] text-[0.78rem] font-extrabold text-[#0A4A98]'>
                          {session.role}
                        </span>
                        <span className='text-[0.82rem] font-semibold text-[#3a424e]'>
                          {session.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
