import Footer from '@/layouts/Footer';
import NavbarLanding from '@/layouts/NavbarLanding';

import GalleryPage from "./container/GalleryPage";
import HarapanPage from "./container/HarapanPage";
import ProkerPage from "./container/ProkerPage";

export default function Page() {
  return (
    <div className="flex flex-col justify-start items-start">
      <NavbarLanding />
      <ProkerPage />
      <GalleryPage />
      <HarapanPage />
      <Footer />
    </div>
  );
}
