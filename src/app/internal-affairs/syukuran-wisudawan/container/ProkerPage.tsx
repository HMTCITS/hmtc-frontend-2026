"use client";
import Image from "next/image";

export default function ProkerPage() {
  return (
    <div>
      <div className="relative bg-[#EFDFC4] flex flex-col items-center justify-center gap-[28px] pb-0 pt-[100px] px-6 md:px-16 lg:px-[254px] self-stretch z-10">
        <Image
          src="/images/internal-affairs/syukuran-wisuda/proker-bg.png"
          alt=""
          fill
          priority
          className="object-cover object-bottom -z-10 select-none"
          draggable="false"
        />
        <div className="flex flex-col gap-[28px] items-center text-center">
          <div className="p-1 bg-black/50 flex justify-start items-center gap-3">
            <p className="justify-start text-yellow-500 text-xl font-light font-plus-jakarta-sans">HMTC Niat Baik</p>
            <p className="justify-start text-yellow-500 text-xl font-bold font-plus-jakarta-sans">/</p>
            <p className="justify-start text-yellow-500 text-xl font-bold font-plus-jakarta-sans">Internal Affairs</p>
          </div>
          <h1 className="font-harry-potter text-[clamp(3.5rem,25vw,128px)] font-normal leading-normal tracking-[-6.4px] text-[#FDC100] [text-shadow:0_4px_8px_rgba(254,194,0,0.50)] [-webkit-text-stroke:1px_#7B4100]">Syukuran Wisudawan ke-133</h1>
          <div className="p-1 bg-black/60 flex justify-center items-center gap-2.5">
            <p className="text-center text-yellow-500 text-xl font-normal font-plus-jakarta-sans">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
          <div className="p-1 bg-black/60 flex flex-wrap justify-center items-center gap-2">
            <p className="justify-start text-yellow-500 text-xl font-semibold font-plus-jakarta-sans">#SyukuranWisuda133</p>
            <p className="justify-start text-yellow-500 text-xl font-semibold font-plus-jakarta-sans">#IANiatBaik</p>
            <p className="justify-start text-yellow-500 text-xl font-semibold font-plus-jakarta-sans">#HMTCNiatBaik26</p>
            <p className="justify-start text-yellow-500 text-xl font-semibold font-plus-jakarta-sans">#ITSSurabaya</p>
          </div>
          <button className="px-4 py-3 bg-red-950 rounded-lg outline-1 outline-offset-[-1px] outline-amber-800 inline-flex justify-center items-center gap-2 overflow-hidden  text-center text-white text-base font-semibold font-plus-jakarta-sans capitalize leading-4 tracking-tight cursor-pointer">Lihat Gallery</button>
          <div className="w-full max-w-[984px] aspect-video relative flex items-center justify-center mx-auto z-10">
            <Image
              src="/images/internal-affairs/syukuran-wisuda/VideoFrame.png"
              alt=""
              fill
              priority
              className="object-cover object-bottom -z-10 select-none"
              draggable="false"
            />
            <video
              className="w-[80%] h-[80%] bg-zinc-300 shadow-lg"
              controls
            >
              {/* <source src="..." type="video/mp4" /> */}
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}