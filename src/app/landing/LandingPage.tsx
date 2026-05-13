'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';

import AboutSkeleton from '@/app/landing/components/about/AboutSkeleton';
import Cover from '@/app/landing/components/cover/Cover';
// import GallerySkeleton from '@/app/landing/components/gallery/GallerySkeleton';
import HeaderAnnouncement from '@/app/landing/components/HeaderAnnouncement';
import LoadingScreen from '@/app/landing/components/LoadingScreen';
import PeopleSkeleton from '@/app/landing/components/people/PeopleHMTCSkeleton';
import ShowCase from '@/app/landing/components/showcase/ShowCase';
import ShowCaseSkeleton from '@/app/landing/components/showcase/ShowCaseSkeleton';
import NavbarDefault from '@/layouts/Navbar';

// Dynamic Imports Helper Function
const createDynamicImport = (importer: () => Promise<any>) => {
  return dynamic(importer, { ssr: true });
}

const About = createDynamicImport(() => import('./components/about/About'));
// const PeopleHMTC = createDynamicImport(() => import('./components/people/PeopleHMTC'));
const RevealKabinet = createDynamicImport(() => import('./components/RevealKabinet/RevealKabinet'));
// const GalleryHMTC = createDynamicImport(() => import('./components/gallery/GalleryHMTC'));


// Sections
interface SectionData {
  id?: string;
  Component: React.ElementType;
  Fallback: React.ElementType;
}

const HOME_SECTIONS: SectionData[] = [
  { id: 'about', Component: About, Fallback: AboutSkeleton },
  { id: 'showcase', Component: ShowCase, Fallback: ShowCaseSkeleton },
  // { id: 'people', Component: PeopleHMTC, Fallback: PeopleSkeleton },
  { id: 'kabinet', Component: RevealKabinet, Fallback: PeopleSkeleton }
  // { id: 'gallery', Component: GalleryHMTC, Fallback: GallerySkeleton },
]

const SectionsWrapper = ({ Component }: SectionData) => {
  return <Component />;
}

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
        <SectionsWrapper
          key={section.id}
          {...section}
        />
      ))}
    </main>
  );
}
