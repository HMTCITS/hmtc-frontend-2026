'use client';
import Image, { ImageProps, StaticImageData } from 'next/image';
import * as React from 'react';

import { ImageSizes as _ImageSizes } from '@/constants/components/image-sizes';
import { cn } from '@/lib/utils';

type NextImageProps = {
  /** Enable skeleton loading animation while image loads */
  useSkeleton?: boolean;
  /** Additional className for the image element */
  imgClassName?: string;
  /** If true, uses the src directly without '/images' prefix */
  serverStaticImg?: boolean;
  /** Custom className for the blur placeholder */
  blurClassName?: string;
  /** Alternative text for the image (required for accessibility) */
  alt: string;
  /** Fallback image source if the primary image fails to load */
  onErrorSrc?: string;
  /** Marks the image as a high priority resource for loading */
  priority?: boolean;
  /** Use vector format for SVG images (preserves quality) */
  isVector?: boolean;
  /** Custom placeholder color (Tailwind class without the bg- prefix) */
  placeholderColor?: string;
  /** Optional callback when image successfully loads */
  onLoadingComplete?: () => void;
  /** Enables Next.js image optimization (disabled for SVGs by default) */
  unoptimized?: boolean;
} & (
  | { fill?: false; width: string | number; height: string | number }
  | { fill: true; width?: never; height?: never }
) &
  Omit<ImageProps, 'src' | 'onLoadingComplete'> & {
    src: string | StaticImageData;
  };

/**
 * # NextImage Component
 *
 * Enhanced Next.js Image component with additional features like skeleton loading,
 * error handling, and optimized image delivery.
 *
 * ## Features
 * - Automatic skeleton loading animation
 * - Error fallback display
 * - Path normalization for images in /public/images/
 * - SVG optimization handling
 * - Support for both fixed size and fill layouts
 * - Customizable placeholder colors
 *
 * @example Basic usage with fixed dimensions
 * ```tsx
 * <NextImage
 *   src="/profile.jpg"
 *   width={256}
 *   height={256}
 *   alt="User profile"
 * />
 * ```
 *
 * @example With skeleton loading effect
 * ```tsx
 * <NextImage
 *   src="/hero-banner.jpg"
 *   width={1280}
 *   height={720}
 *   alt="Hero banner"
 *   useSkeleton
 *   priority
 * />
 * ```
 *
 * @example Using fill mode (parent must have position relative/absolute)
 * ```tsx
 * <div className="relative w-full h-64">
 *   <NextImage
 *     src="/background.jpg"
 *     fill
 *     alt="Background image"
 *     className="object-cover"
 *   />
 * </div>
 * ```
 *
 * @example Using predefined sizes
 * ```tsx
 * <NextImage
 *   src="/thumbnail.jpg"
 *   {...ImageSizes.Square.md}
 *   alt="Thumbnail"
 * />
 * ```
 *
 * ## Props
 *
 * @param {string|StaticImageData} src - Image source URL or imported image object.
 *   Paths without http/data: prefix will be prefixed with "/images/"
 *
 * @param {string} alt - Alternative text description of the image for accessibility.
 *   Required for all images.
 *
 * @param {number|string} width - Width of the image in pixels (not needed with fill).
 *   Can be a number or string value.
 *
 * @param {number|string} height - Height of the image in pixels (not needed with fill).
 *   Can be a number or string value.
 *
 * @param {boolean} fill - If true, image will expand to fill its parent container.
 *   Parent must have position: relative or position: absolute.
 *
 * @param {boolean} useSkeleton - Enables a skeleton loading animation while the image loads.
 *   Default: false
 *
 * @param {string} className - Additional CSS class for the figure wrapper element.
 *
 * @param {string} imgClassName - Additional CSS class applied directly to the img element.
 *
 * @param {boolean} serverStaticImg - If true, uses the src directly without '/images' prefix.
 *   Useful for images outside the standard images directory.
 *   Default: false
 *
 * @param {string} blurClassName - Custom CSS class for the blur placeholder during loading.
 *
 * @param {string} onErrorSrc - Fallback image URL to use if the primary image fails to load.
 *
 * @param {boolean} priority - If true, image is considered high priority and will be preloaded.
 *   Use for images visible within the viewport on page load.
 *   Default: false
 *
 * @param {boolean} isVector - Indicates if the image is a vector format (like SVG).
 *   Sets appropriate handling for vector images.
 *   Default: false
 *
 * @param {string} placeholderColor - Tailwind color for the loading placeholder (without the bg- prefix).
 *   Default: 'gray-200'
 *
 * @param {Function} onLoadingComplete - Callback function invoked when the image successfully loads.
 *
 * @param {boolean} unoptimized - Disables Next.js image optimization.
 *   Automatically true for SVG images unless explicitly set.
 *
 * ## ImageSizes Utility
 *
 * Pre-configured image dimension sets for common aspect ratios:
 *
 * - Square: Perfect 1:1 ratio images (profile pictures, thumbnails)
 *   - sm: 64×64px - Small icons, avatars
 *   - md: 128×128px - Medium thumbnails, profile pictures
 *   - lg: 256×256px - Large thumbnails, medium profile pictures
 *   - xl: 512×512px - Extra large thumbnails, large profile pictures
 *
 * - Widescreen: 16:9 ratio images (videos, presentations, banners)
 *   - sm: 256×144px - Small video thumbnails
 *   - md: 640×360px - Medium video previews, small banners
 *   - lg: 1280×720px - HD content, standard banners
 *   - xl: 1920×1080px - Full HD content, large banners
 *
 * - Standard: 4:3 ratio images (photos, traditional content)
 *   - sm: 256×192px - Small photo thumbnails
 *   - md: 640×480px - Standard photos, medium cards
 *   - lg: 1024×768px - Large photos, standard displays
 *   - xl: 1600×1200px - Extra large photos, large displays
 */
export default function NextImage({
  useSkeleton = false,
  serverStaticImg = false,
  src,
  width,
  height,
  alt,
  className,
  imgClassName,
  blurClassName,
  onErrorSrc,
  priority = false,
  isVector = false,
  placeholderColor = 'gray-200',
  onLoadingComplete,
  unoptimized: userUnoptimized,
  fill,
  ...rest
}: NextImageProps) {
  // Tentukan status loading untuk skeleton effect
  const [status, setStatus] = React.useState<'loading' | 'complete' | 'error'>(
    useSkeleton ? 'loading' : 'complete',
  );

  // Cek apakah lebar sudah didefinisikan lewat className
  const widthIsSet = className?.includes('w-') ?? false;

  // Ekstrak source URL dari string atau StaticImageData
  const srcString = typeof src === 'string' ? src : src.src;

  // Cek apakah gambar adalah SVG
  const isSvg = React.useMemo(
    () => srcString?.toLowerCase().endsWith('.svg'),
    [srcString],
  );

  // Tentukan apakah optimasi Next.js harus dimatikan (untuk SVG atau jika diminta)
  const unoptimized = userUnoptimized ?? (isVector || isSvg);

  // Format URL gambar sesuai pengaturan
  const imageSrc = React.useMemo(() => {
    if (typeof src !== 'string') {
      return src;
    }
    if (
      src.startsWith('data:') ||
      src.startsWith('http') ||
      src.startsWith('/icons') ||
      serverStaticImg
    ) {
      return src;
    }
    return `/images${src.startsWith('/') ? src : `/${src}`}`;
  }, [src, serverStaticImg]);

  // Tentukan apakah mode fill aktif
  const isFillLayout = fill === true;

  // Handler saat gambar berhasil dimuat
  const handleImageLoad = () => {
    setStatus('complete');
    onLoadingComplete?.();
  };

  // Handler saat terjadi error saat memuat gambar
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    setStatus('error');
    if (onErrorSrc) {
      const imgElement = e.currentTarget as HTMLImageElement;
      imgElement.src = onErrorSrc;
    }
  };

  // Bangun properti untuk <Image>
  const imageProps: ImageProps = {
    src: imageSrc,
    alt: alt || 'Image',
    priority,
    onLoad: handleImageLoad,
    onError: handleImageError,
    unoptimized,
    loading: priority ? 'eager' : 'lazy',
    className: cn(
      'h-full w-full',
      status === 'loading' &&
        cn('animate-pulse', `bg-${placeholderColor}`, blurClassName),
      isVector && 'drop-shadow-none',
      imgClassName,
    ),
    ...rest,
  };

  if (!isFillLayout) {
    imageProps.width = width;
    imageProps.height = height;
  } else {
    imageProps.fill = true;
    if (!imageProps.sizes) {
      imageProps.sizes = '100vw';
    }
  }

  return (
    <figure
      style={
        !widthIsSet && !isFillLayout && typeof width === 'number'
          ? { width: `${width}px` }
          : undefined
      }
      className={cn('relative overflow-hidden', className)}
    >
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image {...imageProps} />
      {status === 'error' && !onErrorSrc && (
        <div
          className='absolute inset-0 flex items-center justify-center rounded border border-gray-200 bg-gray-100'
          style={
            !isFillLayout &&
            typeof width === 'number' &&
            typeof height === 'number'
              ? { width: `${width}px`, height: `${height}px` }
              : undefined
          }
        >
          <Image
            src='/icons/ban.svg'
            fill
            alt=''
            className='object-contain'
            unoptimized
          />
        </div>
      )}
    </figure>
  );
}

/**
 * Deprecated: Import size presets from '@/components/image-sizes' directly in Server Components.
 * Re-export kept for backwards compatibility but will be undefined in RSC (client boundary).
 */
export const ImageSizes = _ImageSizes;
