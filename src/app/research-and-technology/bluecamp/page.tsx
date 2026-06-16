'use client';
import '@/app/research-and-technology/bluecamp/style.css';

import About from './components/About';
// import Gallery from './components/Gallery';
// import Timeline from './components/Timeline';
// import Feedback from './components/Feedback';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';

export default function Page() {
  return (
    <div className="bg-white text-[#14181f] font-archivo">
      <Navbar />
      <Hero />
      <About />
      {/* <Gallery />
      <Timeline />
      <Feedback /> */}
      <Footer />
    </div>
  );
}