'use client';
import Footer from '@/layouts/Footer';

import About from './components/About';
// import Timeline from './components/Timeline';
import Feedback from './components/Feedback';
import Gallery from './components/Gallery';
// import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';

export default function Page() {
  return (
    <main className='bg-white font-archivo text-[#14181f]'>
      <Navbar />
      <Hero />
      <About />
      <Gallery />
      {/* <Timeline /> */}
      <Feedback />
      <Footer />
    </main>
  );
}
