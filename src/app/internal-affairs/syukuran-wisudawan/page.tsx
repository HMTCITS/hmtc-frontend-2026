import LoadingScreen from '@/app/landing/components/LoadingScreen';
import Footer from '@/layouts/Footer';
import NavbarLanding from '@/layouts/NavbarLanding';

import GalleryPage from './container/GalleryPage';
import HarapanPage from './container/HarapanPage';
import ProkerPage from './container/ProkerPage';

export default function Page() {
  return (
    <main className='relative flex flex-col items-start justify-start scroll-smooth'>
      <LoadingScreen />
      <NavbarLanding />
      <ProkerPage />
      <GalleryPage />
      <HarapanPage />
      <Footer />
    </main>
  );
}
