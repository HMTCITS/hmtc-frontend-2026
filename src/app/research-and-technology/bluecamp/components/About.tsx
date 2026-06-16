export default function About() {
  return (
    <section
      id='tentang'
      className='mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-16 px-6 py-[118px] md:px-8 lg:grid-cols-[0.9fr_1.1fr]'
    >
      <div className='lg:sticky lg:top-[120px]'>
        <span className='inline-flex items-center gap-[0.6em] text-[0.72rem] font-bold tracking-[0.22em] text-[#1561BD] uppercase'>
          <svg
            className='h-2 w-[22px] text-[#E88E00]'
            viewBox='0 0 24 12'
            fill='currentColor'
          >
            <path d='M0 0l8 6-8 6zM8 0l8 6-8 6z'></path>
          </svg>
          Tentang
        </span>
        <h2 className='mt-4 text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[0.95] font-black tracking-tight uppercase'>
          Setiap Gagasan
          <br />
          Berawal dari
          <br />
          <span className='text-[#1561BD]'>Rasa Ingin Tahu</span>
        </h2>
        <div className='my-6 h-[5px] w-[64px] bg-[#FFB23A]'></div>
        <div className='flex items-center gap-4 rounded-[4px] border border-[#e4e9f0] bg-white p-[22px_24px] shadow-sm'>
          <div className='grid h-[46px] w-[46px] flex-shrink-0 place-items-center rounded-[3px] bg-[#eaf1fa] text-[#1561BD]'>
            <svg
              className='h-6 w-6'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M3 11l18-8-8 18-2-7-8-3z'></path>
            </svg>
          </div>
          <div>
            <div className='text-[0.98rem] font-bold'>Bluecamp 2026</div>
            <div className='text-[0.85rem] text-[#6b7585]'>
              Sesi pembelajaran, diskusi &amp; pengembangan proyek
            </div>
          </div>
        </div>
      </div>
      <div className='text-[1.22rem] leading-[1.74] text-[#3a424e]'>
        <p className='mb-[1.3em] text-justify text-wrap'>
          <span className='float-left pt-1 pr-4 text-[4.6rem] leading-[0.78] font-black text-[#1561BD]'>
            S
          </span>
          setiap gagasan besar sering kali berawal dari rasa ingin tahu dan
          keberanian untuk mengeksplorasi lebih jauh.{' '}
          <strong className='font-bold text-[#14181f]'>Bluecamp 2026</strong>{' '}
          mewadahi rangkaian proses tersebut melalui berbagai sesi pembelajaran,
          diskusi, serta pengembangan proyek yang berfokus pada bidang
          keilmiahan.
        </p>
        <p className='text-justify text-wrap'>
          Halaman ini memuat dokumentasi perjalanan Bluecamp 2026; mulai dari
          pelaksanaan kegiatan, materi yang dibawakan, hingga dinamika peserta
          dalam mengeksplorasi ide dan mengembangkan pemahaman mereka terhadap
          proses penelitian dan pengembangan gagasan.
        </p>
      </div>
    </section>
  );
}
