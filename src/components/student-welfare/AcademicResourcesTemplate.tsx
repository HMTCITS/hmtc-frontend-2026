'use client';

import { ChevronDown,Search, X } from 'lucide-react';
import { useEffect,useMemo, useState } from 'react';

import Footer from '@/layouts/Footer';
import NavbarLanding from '@/layouts/NavbarLanding';

export type TutorialType = 'ETS' | 'EAS';
export type TutorialSemester = 'Ganjil' | 'Genap';

export type Tutorial = {
  id: number;
  course: string;
  title: string;
  type: TutorialType;
  year: string;
  semester: TutorialSemester;
  duration: string;
  tutor: string;
  role?: string;
  desc: string;
  youtubeId: string;
};

export type AcademicResourcesContent = {
  breadcrumb: { orgName: string; sectionName: string };
  title: { main: string; emphasis: string };
  lede: string;
  hashtags: string[];
  tutorials: Tutorial[];
};

const EXAM_TYPES = ['Semua', 'ETS', 'EAS'] as const;
const SEMESTERS = ['Semua', 'Ganjil', 'Genap'] as const;

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('');
}


function VideoThumbnail({ youtubeId }: { youtubeId: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
      alt=''
      className='absolute inset-0 h-full w-full object-cover'
    />
  );
}

function VideoCard({
  tutorial,
  onOpen,
}: {
  tutorial: Tutorial;
  onOpen: (t: Tutorial) => void;
}) {
  return (
    <article
      className='group cursor-pointer'
      onClick={() => onOpen(tutorial)}
    >
      <div className='relative aspect-[16/10] overflow-hidden rounded-sm'>
        <VideoThumbnail youtubeId={tutorial.youtubeId} />
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55' />

        <div className='absolute top-3 left-3 right-3 z-10 flex items-start justify-between'>
          <span
            className={`rounded-[3px] px-2.5 py-1 font-plus-jakarta-sans text-[10px] font-semibold tracking-widest uppercase ${
              tutorial.type === 'ETS'
                ? 'bg-[#1f2937] text-white'
                : 'bg-[#7a1d2e] text-white'
            }`}
          >
            {tutorial.type}
          </span>
          <span className='rounded-[3px] bg-black/70 px-2 py-0.5 font-plus-jakarta-sans text-[11px] font-medium tabular-nums text-white'>
            {tutorial.duration}
          </span>
        </div>

        <div className='absolute inset-0 z-10 grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
          <span className='grid h-14 w-14 place-items-center rounded-full bg-white/95 shadow-[0_4px_24px_rgba(0,0,0,0.25)]'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='#131312'
              className='ml-1'
            >
              <path d='M8 5v14l11-7z' />
            </svg>
          </span>
        </div>
      </div>

      <div className='mt-4 flex items-center gap-2 font-plus-jakarta-sans text-[11.5px] uppercase tracking-[0.08em] text-[#6B6A65]'>
        <span>
          {tutorial.year} · {tutorial.semester}
        </span>
      </div>

      <h3 className='mt-2 font-libre text-[22px] font-normal leading-[1.25] tracking-[-0.005em] text-[#131312]'>
        {tutorial.title}
      </h3>
      <p className='mt-0.5 font-plus-jakarta-sans text-[13.5px] text-[#6B6A65]'>
        {tutorial.course}
      </p>

      <div className='mt-3.5 flex items-center gap-2.5 border-t border-[#E6E3DC] pt-3'>
        <span className='grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#c9bfae] to-[#7a6f5c] font-plus-jakarta-sans text-[11px] font-semibold text-white'>
          {getInitials(tutorial.tutor)}
        </span>
        <div>
          <div className='font-plus-jakarta-sans text-[13px] font-medium text-[#2A2A28]'>
            {tutorial.tutor}
          </div>
          <div className='font-plus-jakarta-sans text-[11px] uppercase tracking-[0.06em] text-[#6B6A65]'>
            {tutorial.role}
          </div>
        </div>
      </div>
    </article>
  );
}

function VideoModal({
  tutorial,
  onClose,
}: {
  tutorial: Tutorial;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className='fixed inset-0 z-100 grid place-items-center p-4 sm:p-10'
      style={{ background: 'rgba(10,10,10,0.78)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className='w-full max-w-[960px] overflow-hidden rounded-md bg-[#FBFAF7]'
        style={{ animation: 'sw-pop 0.25s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-[#E6E3DC] px-4 py-3.5'>
          <div className='flex items-center gap-2.5 font-plus-jakarta-sans text-[11px] uppercase tracking-[0.08em] text-[#6B6A65]'>
            <span>Student Welfare</span>
            <svg width='10' height='10' viewBox='0 0 10 10'>
              <path
                d='M3 1l4 4-4 4'
                stroke='currentColor'
                strokeWidth='1.2'
                fill='none'
              />
            </svg>
            <b className='text-[#131312]'>{tutorial.course}</b>
          </div>
          <button
            onClick={onClose}
            className='grid h-8 w-8 place-items-center rounded-full text-[#2A2A28] transition-colors hover:bg-[#E6E3DC]'
            aria-label='Tutup'
          >
            <X className='h-4.5 w-4.5' />
          </button>
        </div>

        <div className='relative aspect-video bg-black'>
          <iframe
            src={`https://www.youtube.com/embed/${tutorial.youtubeId}?autoplay=1&rel=0`}
            title={tutorial.title}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
            className='absolute inset-0 h-full w-full border-0'
          />
        </div>

        <div className='px-7 pb-7 pt-5'>
          <div className='flex flex-wrap gap-4 font-plus-jakarta-sans text-[13px] text-[#6B6A65]'>
            <span>
              {tutorial.year} · Sem. {tutorial.semester}
            </span>
          </div>
          <h3 className='mt-1.5 font-libre text-[28px] font-normal leading-[1.15] text-[#131312]'>
            {tutorial.title}
          </h3>
          <div className='mt-0.5 font-plus-jakarta-sans text-[13.5px] text-[#6B6A65]'>
            {tutorial.course}
          </div>
          <p className='mt-3.5 max-w-[70ch] font-plus-jakarta-sans text-[14px] leading-[1.65] text-[#2A2A28]'>
            {tutorial.desc}
          </p>
          <div className='mt-4 flex items-center gap-2.5 border-t border-[#E6E3DC] pt-4'>
            <span className='grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#c9bfae] to-[#7a6f5c] font-plus-jakarta-sans text-[11px] font-semibold text-white'>
              {getInitials(tutorial.tutor)}
            </span>
            <div>
              <div className='font-plus-jakarta-sans text-[13px] font-medium text-[#2A2A28]'>
                {tutorial.tutor}
              </div>
              <div className='font-plus-jakarta-sans text-[11px] uppercase tracking-[0.06em] text-[#6B6A65]'>
                {tutorial.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sw-pop {
          from { transform: translateY(8px) scale(0.98); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function AcademicResourcesTemplate({
  content,
}: {
  content: AcademicResourcesContent;
}) {
  const [query, setQuery] = useState('');
  const [examType, setExamType] = useState<string>('Semua');
  const [year, setYear] = useState('Semua Tahun');
  const [semester, setSemester] = useState('Semua');
  const [activeModal, setActiveModal] = useState<Tutorial | null>(null);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(content.tutorials.map((t) => t.year))).sort(
      (a, b) => b.localeCompare(a),
    );
    return ['Semua Tahun', ...years];
  }, [content.tutorials]);

  const filtered = useMemo(() => {
    return content.tutorials.filter((t) => {
      if (examType !== 'Semua' && t.type !== examType) return false;
      if (year !== 'Semua Tahun' && t.year !== year) return false;
      if (semester !== 'Semua' && t.semester !== semester) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !`${t.title} ${t.course} ${t.tutor}`
            .toLowerCase()
            .includes(q)
        )
          return false;
      }
      return true;
    });
  }, [content.tutorials, examType, year, semester, query]);

  const onReset = () => {
    setQuery('');
    setExamType('Semua');
    setYear('Semua Tahun');
    setSemester('Semua');
  };

  const hasActiveFilters =
    examType !== 'Semua' || year !== 'Semua Tahun' || semester !== 'Semua';

  return (
    <>
      <NavbarLanding isActive />

      <main className='min-h-screen bg-[#FBFAF7]'>
        {/* Hero */}
        <section className='mx-auto max-w-[1240px] px-6 pb-10 pt-14 sm:px-10 lg:px-10'>
          <div className='flex items-center gap-2.5 font-plus-jakarta-sans text-[12px] uppercase tracking-[0.08em] text-[#6B6A65]'>
            <span>{content.breadcrumb.orgName}</span>
            <svg width='10' height='10' viewBox='0 0 10 10'>
              <path
                d='M3 1l4 4-4 4'
                stroke='currentColor'
                strokeWidth='1.2'
                fill='none'
                opacity='0.5'
              />
            </svg>
            <b className='font-medium text-[#131312]'>
              {content.breadcrumb.sectionName}
            </b>
          </div>

          <h1 className='mt-4 max-w-[14ch] font-libre text-[clamp(40px,5.4vw,72px)] font-normal leading-[1.05] tracking-[-0.01em] text-[#131312]'>
            {content.title.main}{' '}
            <em className='italic text-[#2A2A28]'>{content.title.emphasis}</em>
          </h1>

          <p className='mt-5 max-w-[62ch] font-plus-jakarta-sans text-[16px] leading-[1.65] text-[#2A2A28]'>
            {content.lede}
          </p>

          <div className='mt-5 flex flex-wrap gap-4 font-plus-jakarta-sans text-[13px] text-[#6B6A65]'>
            {content.hashtags.map((tag) => (
              <span key={tag}>
                <span className='text-[#131312]'>#</span>
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Filter bar */}
        <section className='mx-auto max-w-[1240px] px-6 sm:px-10 lg:px-10'>
          <div className='grid gap-2.5 rounded-sm border border-[#E6E3DC] bg-white p-3.5 sm:grid-cols-[1fr_auto] lg:grid-cols-[1.4fr_auto_auto_auto_auto]'>
            {/* Search */}
            <label className='flex items-center gap-2.5 rounded-sm bg-[#FBFAF7] px-3.5 py-2.5 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-[#131312]'>
              <Search className='h-4 w-4 flex-shrink-0 text-[#6B6A65]' />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Cari mata kuliah, topik, atau tutor…'
                className='w-full bg-transparent font-plus-jakarta-sans text-[14px] text-[#131312] outline-none placeholder:text-[#6B6A65]'
              />
            </label>

            {/* Segmented toggle */}
            <div
              className='flex rounded-full border border-[#E6E3DC] bg-[#FBFAF7] p-[3px]'
              role='tablist'
              aria-label='Tipe Ujian'
            >
              {EXAM_TYPES.map((t) => (
                <button
                  key={t}
                  role='tab'
                  aria-selected={examType === t}
                  onClick={() => setExamType(t)}
                  className={`rounded-full px-[18px] py-2 font-plus-jakarta-sans text-[12.5px] font-medium uppercase tracking-[0.04em] transition-all ${
                    examType === t
                      ? 'bg-[#131312] text-white'
                      : 'text-[#6B6A65] hover:text-[#131312]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Year select */}
            <div className='relative'>
              <label className='absolute -top-[7px] z-10 left-2.5 bg-white px-1.5 font-plus-jakarta-sans text-[10px] uppercase tracking-[0.1em] text-[#6B6A65]'>
                Tahun Ajar
              </label>
              <div className='relative'>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className='w-full min-w-[150px] appearance-none rounded-sm border border-[#E6E3DC] bg-white py-[11px] pl-3.5 pr-9 font-plus-jakarta-sans text-[13px] font-medium text-[#131312] outline-none'
                >
                  {availableYears.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#131312]' />
              </div>
            </div>

            {/* Semester select */}
            <div className='relative'>
              <label className='absolute -top-[7px] z-10 left-2.5 bg-white px-1.5 font-plus-jakarta-sans text-[10px] uppercase tracking-[0.1em] text-[#6B6A65]'>
                Semester
              </label>
              <div className='relative'>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className='w-full min-w-[130px] appearance-none rounded-sm border border-[#E6E3DC] bg-white py-[11px] pl-3.5 pr-9 font-plus-jakarta-sans text-[13px] font-medium text-[#131312] outline-none'
                >
                  {SEMESTERS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#131312]' />
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={onReset}
              className='px-2.5 py-2 font-plus-jakarta-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B6A65] transition-colors hover:text-[#131312]'
            >
              Reset
            </button>
          </div>

          {/* Filter meta */}
          <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
            <p className='font-plus-jakarta-sans text-[13px] text-[#6B6A65]'>
              Menampilkan{' '}
              <b className='text-[#131312]'>{filtered.length}</b> tutorial
            </p>
            {hasActiveFilters && (
              <div className='flex flex-wrap gap-2'>
                {examType !== 'Semua' && (
                  <span className='flex items-center gap-1.5 rounded-full bg-[#EEEAE0] px-3 py-1 font-plus-jakarta-sans text-[12px] text-[#2A2A28]'>
                    Tipe: {examType}
                    <button
                      onClick={() => setExamType('Semua')}
                      className='text-[#6B6A65] hover:text-[#131312]'
                      aria-label='Hapus filter tipe'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </span>
                )}
                {year !== 'Semua Tahun' && (
                  <span className='flex items-center gap-1.5 rounded-full bg-[#EEEAE0] px-3 py-1 font-plus-jakarta-sans text-[12px] text-[#2A2A28]'>
                    Tahun: {year}
                    <button
                      onClick={() => setYear('Semua Tahun')}
                      className='text-[#6B6A65] hover:text-[#131312]'
                      aria-label='Hapus filter tahun'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </span>
                )}
                {semester !== 'Semua' && (
                  <span className='flex items-center gap-1.5 rounded-full bg-[#EEEAE0] px-3 py-1 font-plus-jakarta-sans text-[12px] text-[#2A2A28]'>
                    Semester: {semester}
                    <button
                      onClick={() => setSemester('Semua')}
                      className='text-[#6B6A65] hover:text-[#131312]'
                      aria-label='Hapus filter semester'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Video grid */}
        <section className='mx-auto max-w-[1240px] px-6 pb-20 sm:px-10 lg:px-10'>
          <div className='mb-5 mt-14 flex items-end justify-between border-b border-[#E6E3DC] pb-4'>
            <h2 className='font-libre text-[32px] font-normal leading-none tracking-[-0.005em] text-[#131312]'>
              Video Tutorial
            </h2>
            <span className='font-plus-jakarta-sans text-[12px] uppercase tracking-[0.1em] text-[#6B6A65]'>
              Diurutkan: Terbaru
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className='rounded-sm border border-dashed border-[#D8D4CB] py-[72px] text-center'>
              <h3 className='font-libre text-[26px] font-normal text-[#131312]'>
                Belum ada tutorial yang cocok.
              </h3>
              <p className='mt-1 font-plus-jakarta-sans text-[14px] text-[#6B6A65]'>
                Coba ubah filter atau kata kuncinya.
              </p>
            </div>
          ) : (
            <div className='grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-3'>
              {filtered.map((tutorial) => (
                <VideoCard
                  key={tutorial.id}
                  tutorial={tutorial}
                  onOpen={setActiveModal}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {activeModal && (
        <VideoModal
          tutorial={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
