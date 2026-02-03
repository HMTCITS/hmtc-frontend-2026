'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';

import AboutSkeleton from '@/app/landing/components/about/AboutSkeleton';
import Cover from '@/app/landing/components/cover/Cover';
import GallerySkeleton from '@/app/landing/components/gallery/GallerySkeleton';
import HeaderAnnouncement from '@/app/landing/components/HeaderAnnouncement';
import HMTCBlogSkeleton from '@/app/landing/components/hmtcblog/HMTCBlogSkeleton';
import LifeAtHMTCSkeleton from '@/app/landing/components/lifeHmtc/LifeAtHMTCSkeleton';
import PeopleSkeleton from '@/app/landing/components/people/PeopleHMTCSkeleton';
import ShowCase from '@/app/landing/components/showcase/ShowCase';
import ShowCaseSkeleton from '@/app/landing/components/showcase/ShowCaseSkeleton';
import NavbarDefault from '@/layouts/Navbar';

// Dynamic Imports Helper Function
const createDynamicImport = (importer: () => Promise<any>) => {
  return dynamic(importer, { ssr: true });
}

const About = createDynamicImport(() => import('./components/about/About'));
const PeopleHMTC = createDynamicImport(() => import('./components/people/PeopleHMTC'));
const LifeAtHMTC = createDynamicImport(() => import('./components/lifeHmtc/LifeAtHMTC'));
const GalleryHMTC = createDynamicImport(() => import('./components/gallery/GalleryHMTC'));
const HMTCBlog = createDynamicImport(() => import('./components/hmtcblog/HMTCBlog'));


// Sections
interface SectionData {
  id?: string;
  Component: React.ElementType;
  Fallback: React.ElementType;
}

const HOME_SECTIONS: SectionData[] = [
  { id: 'about', Component: About, Fallback: AboutSkeleton },
  { id: 'showcase', Component: ShowCase, Fallback: ShowCaseSkeleton },
  { id: 'people', Component: PeopleHMTC, Fallback: PeopleSkeleton },
  { id: 'life', Component: LifeAtHMTC, Fallback: LifeAtHMTCSkeleton },
  { id: 'gallery', Component: GalleryHMTC, Fallback: GallerySkeleton },
  { id: 'blog', Component: HMTCBlog, Fallback: HMTCBlogSkeleton },
]

const SectionsWrapper = ({ Component }: SectionData) => {
  return <Component />;
}

export default function LandingPage() {
  return (
    <main className='relative scroll-smooth'>
      <HeaderAnnouncement />
      <div className=''>
        <Cover />
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
