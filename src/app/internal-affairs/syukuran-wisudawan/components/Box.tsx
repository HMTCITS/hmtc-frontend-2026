import { cn } from '@/lib/utils';

interface BoxProps {
  id: number;
  wishes: string;
  author: string;
  onClick?: () => void;
  truncateMessage?: boolean;
  className?: string;
}

export default function Box({
  id,
  wishes,
  author,
  onClick,
  truncateMessage = true,
  className,
}: BoxProps) {
  // Mapping the index to Tailwind color combinations
  const colorSchemes: Record<number, string> = {
    0: 'bg-red-950 border-red-500',
    1: 'bg-green-950 border-green-500',
    2: 'bg-yellow-950 border-yellow-500',
    3: 'bg-blue-950 border-blue-500',
  };

  const selectedScheme = colorSchemes[id % 4];
  const [bgColor, borderColor] = selectedScheme.split(' ');

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        `w-full p-4 text-left ${bgColor}`,
        truncateMessage
          ? 'h-[220px] max-h-[220px] min-h-[220px]'
          : 'max-h-[70vh] min-h-[220px]',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
      aria-label='Buka detail doa dan harapan'
    >
      <div
        className={`flex h-full w-full flex-col items-start justify-center gap-5 border-2 p-4 font-plus-jakarta-sans ${borderColor}`}
      >
        <p
          className={cn(
            'text-white',
            truncateMessage
              ? '[display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:4]'
              : 'overflow-y-auto',
          )}
        >
          &quot;{wishes}&quot;
        </p>
        <p className='font-bold text-white'>{author}</p>
      </div>
    </button>
  );
}
