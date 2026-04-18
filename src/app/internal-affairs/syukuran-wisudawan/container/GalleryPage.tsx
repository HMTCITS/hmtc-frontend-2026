"use client";
import Image from "next/image";

import Carousel from "@/app/internal-affairs/syukuran-wisudawan/components/Carousel";

export default function GalleryPage() {
  return (
    <div className="self-stretch relative bg-[#EFDFC4] inline-flex flex-col justify-center items-center gap-7 overflow-hidden z-10">
      <div className="absolute top-0 left-0 hidden md:block">
        <Image
          src="/images/internal-affairs/syukuran-wisuda/left curtain.png"
          alt=""
          width={256}
          height={459}
          priority
          draggable="false"
          className="select-none"
        />
      </div>
      <div className="absolute top-0 right-0 hidden md:block">
        <Image
          src="/images/internal-affairs/syukuran-wisuda/right curtain.png"
          alt=""
          width={256}
          height={459}
          priority
          draggable="false"
          className="select-none"
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-[100%] -z-10 select-none">
        <Image
          src="/images/internal-affairs/syukuran-wisuda/gallery-bg.png"
          alt=""
          fill
          className="object-cover object-center select-none"
          priority
          draggable="false"
        />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[20%] -z-10 select-none">
        <Image
          src="/images/internal-affairs/syukuran-wisuda/gallery-bg-bottom.png"
          alt=""
          fill
          className="object-cover object-bottom select-none"
          draggable="false"
        />
      </div>
      <div className="absolute bottom-0 left-0 hidden md:block">
        <Image
          src="/images/internal-affairs/syukuran-wisuda/book.png"
          alt=""
          width={200}
          height={200}
          priority
          draggable="false"
          className="select-none"
        />
      </div>
      <div className="absolute bottom-0 right-0 hidden md:block">
        <Image
          src="/images/internal-affairs/syukuran-wisuda/clock.png"
          alt=""
          width={200}
          height={200}
          priority
          draggable="false"
          className="select-none"
        />
      </div>
      <div className="flex flex-col justify-center text-center md:p-32 gap-7 mb-16">
        <h1 className="text-[#FDC100] text-[clamp(3.5rem,25vw,128px)] font-normal [text-shadow:0_4px_8px_rgba(254,194,0,0.50)] [-webkit-text-stroke:1px_#7B4100] font-harry-potter">Precious Moments</h1>
        <Carousel />
      </div>
    </div>
  );
}