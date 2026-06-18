const FEEDBACK_DATA = [
  {
    text: 'Bluecamp 2026 benar-benar membuka cara pandang saya terhadap proses riset. Materinya runtut dan sesinya membuat saya berani mencoba ide sendiri.',
    color: '#1561BD',
    dept: 'Teknik Informatika · 2024',
  },
  {
    text: 'Diskusi kelompoknya seru. Saya jadi terbiasa menyampaikan gagasan dan menerima masukan dari teman maupun mentor.',
    color: '#E88E00',
    dept: 'Teknik Komputer · 2024',
  },
  {
    text: 'Awalnya ragu, tapi suasananya hangat dan tidak menggurui. Pematerinya sabar membimbing dari nol sampai paham.',
    color: '#0A4A98',
    dept: 'Sistem Informasi · 2025',
  },
  {
    text: 'Bagian paling berkesan adalah workshop pengembangan ide. Dari rasa penasaran kecil bisa tumbuh jadi proyek yang nyata.',
    color: '#3978C4',
    dept: 'Teknik Informatika · 2025',
  },
  {
    text: 'Alur kegiatannya tertata, jadi mudah mengikuti dari hari pertama sampai presentasi akhir. Banyak relasi baru juga.',
    color: '#B56F00',
    dept: 'Teknik Elektro · 2024',
  },
  {
    text: 'Mentoringnya personal dan membangun. Saya pulang dengan pemahaman penelitian yang jauh lebih utuh.',
    color: '#073A76',
    dept: 'Teknik Komputer · 2025',
  },
];

export default function Feedback() {
  return (
    <section id='feedback' className='bg-[#f3f7fc] py-[118px]'>
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
            Feedback Bluecamp 2026
          </span>
          <h2 className='mt-4 text-[clamp(2rem,4.2vw,3.3rem)] leading-none font-black tracking-tight text-[#14181f] uppercase'>
            Suara <span className='text-[#E88E00]'>Peserta</span>
          </h2>
          <p className='mt-[18px] max-w-[640px] text-[1.08rem] text-[#3a424e]'>
            Kesan, cerita, dan harapan peserta setelah menjalani rangkaian
            eksplorasi keilmiahan bersama Bluecamp 2026.
          </p>
        </div>

        <div className='columns-1 gap-[22px] [column-fill:balance] sm:columns-2 lg:columns-3'>
          {FEEDBACK_DATA.map((feed, idx) => (
            <div
              key={idx}
              className='group relative mb-[22px] break-inside-avoid rounded-[6px] border border-[#e4e9f0] bg-white p-[26px_26px_24px] shadow-md shadow-[#073a76]/5'
            >
              <span className='absolute top-[18px] right-[22px] text-[#eaf1fa] transition-colors duration-300 group-hover:text-[#5D92D0]/20'>
                <svg
                  className='h-10 w-10'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M7 7H3v7h4l-2 4h3l2-4V7H7zm11 0h-4v7h4l-2 4h3l2-4V7h-3z'></path>
                </svg>
              </span>
              <div className='mb-3.5 flex gap-[3px] text-[#FFB23A]'>
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className='h-4 w-4'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 6 21.4l1.4-6.8L2.3 9.1l6.9-.8z'></path>
                  </svg>
                ))}
              </div>
              <p className='m-0 mb-[22px] text-[1.0rem] leading-[1.66] text-wrap text-[#3a424e]'>
                {feed.text}
              </p>
              <div className='flex items-center gap-3.5'>
                <span
                  className='grid h-[46px] w-[46px] flex-shrink-0 place-items-center rounded-full text-[1.05rem] font-black text-white'
                  style={{ backgroundColor: feed.color }}
                >
                  P
                </span>
                <div>
                  <span className='block text-[0.98rem] leading-tight font-bold text-[#14181f]'>
                    Peserta Bluecamp
                  </span>
                  <span className='mt-0.5 block text-[0.82rem] text-[#6b7585]'>
                    {feed.dept}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
