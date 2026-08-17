const FEEDBACK_DATA = [
  {
    name: 'Muhammad Farhan',
    title: 'Apa dampak jangka panjang yang kamu harapkan dapat dirasakan oleh peserta Bluecamp ini?',
    text: 'Efek jangka panjangnya aku harap mahasiswa angkatan 25 yang mengikuti Bluecamp jadi punya persiapan atau pengetahuan lebih dalam mengikuti lomba, riset dan segala hal yang berkaitan dengan Keilmiahan sehingga mereka lebih berani dalam mengambil kesempatan di bidang Keilmiahan dan juga percaya diri dalam mengikuti kegiatan kegiatan di Keilmiahan itu sendiri.',
    color: '#1561BD',
    role: 'Panitia Bluecamp',
  },
  {
    name: 'Kartika Nana',
    title: 'Bagian mana dari Bluecamp yang menurutmu paling berguna bagi para peserta?',
    text: 'Saat mereka dibagi kelompok dan harus membuat suatu penelitian untuk dipresentasikan pada hari terakhir. Aku rasa pada saat ini, peserta akan belajar langsung untuk menerapkan materi-materi yang telah diterima dari Bluecamp yang kemudian dikombinasikan dengan kerjasama tim. Apalagi untuk tim yang berhasil memenangkan apresiasi, menunjukkan mereka berhasil menerapkan target yang panitia ingin capai pada saat pelaksanaan acara. Mungkin, bagi tim yang dapat apresiasi, hal ini juga menjadi salah satu hal paling membekas sebagai penutup acara Bluecamp',
    color: '#E88E00',
    role: 'Panitia Bluecamp',
  },
  {
    name: 'Levina',
    title: 'Apa momen yang paling berkesan dalam rangkaian kegiatan Bluecamp ini?',
    text: 'Momen yang paling bikin aku merasa bahwa riset itu ternyata ga sekaku yang aku bayangkan adalah saat sesi materi Studi Literatur dan Rumusan Masalah. Waktu itu aku melihat langsung bagaimana cara penggunaan Mendeley yang menurut aku cukup menarik. Melihat bagaimana sitasi dan daftar pustaka bisa tersusun secara otomatis bikin aku sadar kalau ternyata ada banyak hal dalam penelitian yang bisa dilakukan dengan lebih praktis. Dari situ aku jadi melihat kalau riset bukan hanya soal teori dan penulisan, tapi juga ada berbagai tools yang membantu prosesnya.',
    color: '#0A4A98',
    role: 'Peserta Bluecamp',
  },
  {
    name: 'Ryu',
    title: 'Apa momen yang paling berkesan dalam rangkaian kegiatan Bluecamp ini?',
    text: 'Momen paling seru itu pas sesi penjelasan tentang perumusan masalah. Penyampaian dari pemateri sangat jelas, praktis, dan applicable banget. Sesi itu benar-benar membuka perspektif baru bagi saya bahwa menyusun riset atau inovasi ternyata bisa se-eksploratif itu dan gak sekaku yang dibayangkan.',
    color: '#3978C4',
    role: 'Peserta Bluecamp',
  },
  {
    name: 'Haziq',
    title: 'Apa momen yang paling berkesan dalam rangkaian kegiatan Bluecamp ini?',
    text: 'Hari kedua bluecamp di mana pematerinya itu kak luna, lupa di sesi apa, tapi yang jelas hari itu langsung bikin aku melek dan jadi semangat banget untuk terjun ke dunia riset berkat pemaparan materi dan pengalaman yang diberikan oleh kak luna itu. Aku jadi sadar kalo riset itu sebenarnya menyenangkan banget dan memang sesuai sama passion aku dari dulu',
    color: '#B56F00',
    role: 'Peserta Bluecamp',
  },
  {
    name: 'Lathifah Sahda',
    title: 'Satu tips agar ide riset dapat dieksekusi dengan baik.',
    text: "Buat deadline palsu yang lebih mepet dari deadline aslinya, dan treat it like it's real. Karena kalo deadline jauh = nggak ada urgensi = ide nggak jalan. Selain itu, setiap deliverable harus ada satu nama yang bertanggung jawab, kalau nggak ada yang namanya nempel di satu output, nggak akan ada yang ngerasa perlu mastiin itu selesai.",
    color: '#B56F00',
    role: 'Pemateri Bluecamp',
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
              <span className='relative flex gap-8 text-[#eaf1fa] transition-colors duration-300 group-hover:text-[#5D92D0]/20'>
                <h3 className='mb-3.5 text-[1.1rem] font-bold text-[#14181f]'>
                  {feed.title}
                </h3>
                <svg
                  className='h-10 w-10 flex-shrink-0'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M7 7H3v7h4l-2 4h3l2-4V7H7zm11 0h-4v7h4l-2 4h3l2-4V7h-3z'></path>
                </svg>
              </span>
              <p className='m-0 mb-[22px] text-[1.0rem] leading-[1.66] text-wrap text-[#3a424e]'>
                {feed.text}
              </p>
              <div className='flex items-center gap-3.5'>
                <span
                  className='grid h-[46px] w-[46px] flex-shrink-0 place-items-center rounded-full text-[1.05rem] font-black text-white'
                  style={{ backgroundColor: feed.color }}
                >
                  {feed.name.charAt(0)}
                </span>
                <div>
                  <span className='block text-[0.98rem] leading-tight font-bold text-[#14181f]'>
                    {feed.name}
                  </span>
                  <span className='mt-0.5 block text-[0.82rem] text-[#6b7585]'>
                    {feed.role}
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
