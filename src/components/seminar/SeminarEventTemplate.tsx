'use client';
import { ArrowRight, BrainCircuit, Cog, RefreshCcw } from 'lucide-react';

import NextImage from '@/components/NextImage';
import PixelBlast from '@/components/PixelBlast';
import SeminarRegistrationForm, {
  type SeminarRegistrationConfig,
} from '@/components/seminar/SeminarRegistrationForm';
import { Button } from '@/components/ui/button';
import Footer from '@/layouts/Footer';
import NavbarLanding from '@/layouts/NavbarLanding';

type SeminarCta = {
  href: string;
  label: string;
};

type SeminarSpeakerStat = {
  label: string;
  value: string;
};

type SeminarSpeaker = {
  name: string;
  title: string;
  description: string;
  imageSrc: string;
  badges: string[];
  stats: SeminarSpeakerStat[];
};

type SeminarTopic = {
  title: string;
  description: string;
  iconKey: 'brainCircuit' | 'cog' | 'refreshCcw';
};

type SeminarMetaItem = {
  label: string;
  value: string;
};

type SeminarFormField = {
  id: string;
  label: string;
  placeholder: string;
};

export type SeminarRegistration = SeminarRegistrationConfig & {
  fields: SeminarFormField[];
};

export type SeminarEventContent = {
  breadcrumb: {
    orgName: string;
    divisionName: string;
  };
  title: string;
  summary: string;
  cta: SeminarCta;
  heroImage: {
    src: string;
    alt: string;
  };
  speaker: SeminarSpeaker;
  metaItems: SeminarMetaItem[];
  topics: SeminarTopic[];
  registration: SeminarRegistration;
};

type SeminarEventTemplateProps = {
  content: SeminarEventContent;
};

function SpeakerPreview({
  imageSrc,
  name,
  title,
}: {
  imageSrc: string;
  name: string;
  title: string;
}) {
  return (
    <div className='flex items-center gap-4 rounded-2xl'>
      <NextImage
        src={imageSrc}
        alt={name}
        width={64}
        height={64}
        className='h-16 w-16 rounded-full object-cover object-top'
      />
      <div className='text-black'>
        <p className='font-plus-jakarta-sans text-lg leading-tight font-bold md:text-xl'>
          {name}
        </p>
        <p className='font-plus-jakarta-sans text-sm leading-tight font-medium md:text-base'>
          {title}
        </p>
      </div>
    </div>
  );
}

function TopicCard({ topic }: { topic: SeminarTopic }) {
  const iconMap = {
    brainCircuit: BrainCircuit,
    cog: Cog,
    refreshCcw: RefreshCcw,
  } as const;

  const Icon = iconMap[topic.iconKey];

  return (
    <article className='rounded-lg border border-[#CED4DA] bg-white p-6 shadow-[4px_4px_8px_0_rgba(0,0,0,0.05)]'>
      <Icon className='mb-4 h-5 w-5 text-[#2F6FED]' />
      <h3 className='mb-2 font-inter text-xl leading-tight font-semibold tracking-tight text-black'>
        {topic.title}
      </h3>
      <p className='font-plus-jakarta-sans text-sm leading-relaxed text-[#212121]'>
        {topic.description}
      </p>
    </article>
  );
}

export default function SeminarEventTemplate({
  content,
}: SeminarEventTemplateProps) {
  return (
    <>
      <NavbarLanding isActive />

      <main className='bg-white'>
        <section className='relative overflow-hidden px-4 py-12 sm:px-8 lg:px-20 lg:py-16'>
          <div className='pointer-events-none absolute inset-0 opacity-40'>
            {/* Background from React Bits */}
            <PixelBlast
              variant='square'
              pixelSize={5}
              color='#0078B4'
              patternScale={3}
              patternDensity={1.1}
              enableRipples
              rippleSpeed={0.2}
              rippleThickness={0.13}
              rippleIntensityScale={1}
              speed={0.5}
              transparent
              edgeFade={0.5}
              className='h-full w-full'
            />
          </div>
          <div className='pointer-events-none absolute inset-0' />

          <div className='relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center'>
            <div>
              <p className='font-plus-jakarta-sans text-sm tracking-tight text-black sm:text-base'>
                <span className='font-light'>{content.breadcrumb.orgName}</span>{' '}
                <span className='font-bold'>
                  / {content.breadcrumb.divisionName}
                </span>
              </p>

              <h1 className='mt-4 max-w-3xl font-jetbrains-mono text-4xl leading-tight font-bold tracking-tighter text-black sm:text-5xl lg:text-5xl'>
                {content.title}
              </h1>

              <div className='mt-6'>
                <SpeakerPreview
                  imageSrc={content.speaker.imageSrc}
                  name={content.speaker.name}
                  title={content.speaker.title}
                />
              </div>

              <p className='mt-6 max-w-3xl font-plus-jakarta-sans text-base leading-relaxed text-black sm:text-lg'>
                {content.summary}
              </p>

              <Button
                asChild
                className='mt-6 h-12 rounded-lg bg-[#2F6FED] px-6 font-plus-jakarta-sans text-base font-medium hover:bg-[#275cc7]'
              >
                <a href={content.cta.href}>
                  {content.cta.label}
                  <ArrowRight className='ml-1 h-4 w-4' />
                </a>
              </Button>
            </div>

            <div className='mx-auto h-full w-full max-w-[120px] max-lg:hidden lg:max-w-[340px]'>
              <NextImage
                src={content.heroImage.src}
                alt={content.heroImage.alt}
                width={640}
                height={450}
                style={{ objectFit: 'cover' }}
                className='h-full w-full rounded-2xl shadow-xl'
              />
            </div>
          </div>
        </section>

        <section className='bg-[#E9ECEF] px-4 py-10 sm:px-8 lg:px-20 lg:py-12'>
          <div className='mx-auto grid max-w-6xl gap-8 md:grid-cols-3 md:gap-12'>
            {content.metaItems.map((item) => (
              <div key={item.label} className='space-y-1 text-black'>
                <p className='font-plus-jakarta-sans text-base font-medium sm:text-lg'>
                  {item.label}
                </p>
                <p className='font-plus-jakarta-sans text-2xl font-bold tracking-tight sm:text-3xl'>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className='bg-[#F8F9FA] px-4 py-12 sm:px-8 lg:px-20 lg:py-16'>
          <div className='mx-auto grid max-w-6xl gap-10 md:grid-cols-[320px_1fr] md:items-center'>
            <div>
              <NextImage
                src={content.speaker.imageSrc}
                alt={content.speaker.name}
                width={310}
                height={361}
                className='h-auto w-full max-w-[310px] rounded-2xl object-cover'
                style={{ objectFit: 'cover' }}
              />
              <p className='mt-5 font-plus-jakarta-sans text-xl font-bold text-black sm:text-2xl'>
                {content.speaker.name}
              </p>
              <p className='mt-1 font-plus-jakarta-sans text-sm text-[#212121]'>
                {content.speaker.title}
              </p>
            </div>

            <div>
              <h2 className='font-jetbrains-mono text-2xl font-extrabold tracking-tight text-black sm:text-3xl'>
                Meet the Speaker
              </h2>
              <p className='mt-4 font-plus-jakarta-sans text-base leading-relaxed text-black sm:text-lg'>
                {content.speaker.description}
              </p>

              <div className='mt-5 flex flex-wrap gap-3'>
                {content.speaker.badges.map((badge) => (
                  <span
                    key={badge}
                    className='rounded-full bg-[#C0D5FF] px-4 py-2 font-plus-jakarta-sans text-xs font-bold text-[#00026C] sm:text-sm'
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className='mt-7 border-t border-[#E2E2E2] pt-6'>
                <div className='flex gap-6'>
                  {content.speaker.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className='font-plus-jakarta-sans text-2xl font-bold text-[#2F6FED] sm:text-3xl'>
                        {stat.value}
                      </p>
                      <p className='font-plus-jakarta-sans text-[11px] font-bold tracking-[0.12em] text-[#454654] uppercase'>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='bg-[#E9ECEF] px-4 py-12 sm:px-8 lg:px-20 lg:py-16'>
          <div className='mx-auto max-w-6xl'>
            <h2 className='text-center font-jetbrains-mono text-2xl font-bold tracking-tight text-black sm:text-3xl'>
              Key <span className='text-[#2F6FED]'>Topics</span>
            </h2>
            <div className='mt-8 grid gap-5 md:grid-cols-3'>
              {content.topics.map((topic) => (
                <TopicCard key={topic.title} topic={topic} />
              ))}
            </div>
          </div>
        </section>

        <SeminarRegistrationForm registration={content.registration} />
      </main>

      <Footer />
    </>
  );
}
