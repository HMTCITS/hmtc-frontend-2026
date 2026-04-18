import Footer from '@/layouts/Footer';
import Navbar from "@/layouts/Navbar";

import GalleryPage from "./container/GalleryPage";
import HarapanPage from "./container/HarapanPage";
import ProkerPage from "./container/ProkerPage";

export default function Page() {
  return (
    <div className="flex flex-col justify-start items-start">
      <Navbar />
      <ProkerPage />
      <GalleryPage />
      <HarapanPage />
      <Footer />
    </div>
  );
}
