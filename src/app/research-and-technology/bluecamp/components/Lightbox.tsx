import { X } from 'lucide-react';
import Image from 'next/image';

import type { GalleryItem } from './Gallery';

type LightboxProps = {
  item: GalleryItem;
  onClose: () => void;
};

export default function Lightbox({ item, onClose }: LightboxProps) {
  const categoryLabel =
    item.cat === 'pelaksanaan'
      ? 'Pelaksanaan Kegiatan'
      : item.cat === 'materi'
        ? 'Materi'
        : 'Dinamika Peserta';

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-[#061a34]/85 p-10 backdrop-blur-md'
      onClick={onClose}
    >
      <div
        className='w-full max-w-[760px]'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='relative grid aspect-[4/3] place-items-center overflow-hidden rounded-md bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.5)_0_2px,transparent_2px_24px),linear-gradient(150deg,#eaf1fa,#cadbf1)]'>
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className='text-6xl text-[#0A4A98]/50'>◈</div>
          )}
        </div>

        <div className='mt-5 flex items-center justify-between gap-4 text-white'>
          <h3 className='text-lg font-bold'>{item.title}</h3>
          <span className='text-xs font-bold tracking-widest text-[#FFB23A] uppercase'>
            {categoryLabel}
          </span>
        </div>
      </div>

      <button
        onClick={onClose}
        className='text-md absolute top-6 right-8 flex cursor-pointer items-center gap-2 font-bold tracking-widest text-white'
      >
        <X size={20} />
        Tutup
      </button>
    </div>
  );
}
