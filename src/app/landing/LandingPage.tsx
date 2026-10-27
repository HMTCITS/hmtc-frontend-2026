'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';

import Cover from '@/app/landing/components/cover/Cover';
import HeaderAnnouncement from '@/app/landing/components/HeaderAnnouncement';
import LoadingScreen from '@/app/landing/components/LoadingScreen';
import ShowCase from '@/app/landing/components/showcase/ShowCase';
import LazySection from '@/components/LazySection';
import NavbarDefault from '@/layouts/Navbar';

// Dynamic Imports Helper Function
const createDynamicImport = (importer: () => Promise<any>) => {
  return dynamic(importer, { ssr: true });
};

const About = createDynamicImport(() => import('./components/about/About'));
const RevealKabinet = createDynamicImport(
  () => import('./components/RevealKabinet/RevealKabinet'),
);
const GalleryCarousel = createDynamicImport(
  () => import('./components/galleryCarousel/GalleryCarousel'),
);

// Sections
interface SectionData {
  id?: string;
  Component: React.ElementType;
  /** Mount only when the section nears the viewport. */
  lazy?: boolean;
}

const HOME_SECTIONS: SectionData[] = [
  { id: 'about', Component: About },
  { id: 'showcase', Component: ShowCase },
  { id: 'kabinet', Component: RevealKabinet, lazy: true },
  { id: 'gallery', Component: GalleryCarousel, lazy: true },
];

const SectionsWrapper = ({ Component, lazy }: SectionData) => {
  if (lazy) {
    return (
      <LazySection
        fallback={
          <div className='min-h-screen bg-[#121212]' aria-hidden='true' />
        }
        threshold={0}
        rootMargin='400px 0px'
      >
        <Component />
      </LazySection>
    );
  }
  return <Component />;
};

export default function LandingPage() {
  const [heroReady, setHeroReady] = React.useState(false);

  return (
    <main className='relative scroll-smooth'>
      <LoadingScreen onComplete={() => setHeroReady(true)} />
      <HeaderAnnouncement active={true} />
      <div className=''>
        <Cover heroReady={heroReady} />
        <NavbarDefault />
      </div>

      {HOME_SECTIONS.map((section) => (
        <SectionsWrapper key={section.id} {...section} />
      ))}
    </main>
  );
}
