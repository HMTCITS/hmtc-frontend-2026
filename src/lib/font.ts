import {
  Archivo,
  JetBrains_Mono,
  Libre_Baskerville,
  Plus_Jakarta_Sans,
} from 'next/font/google';
import localFont from 'next/font/local';

/**
 * Font configuration for the Adelphe Family.
 * Ensure these files are located at: src/lib/fonts/adelphe/
 */
export const adelphe = localFont({
  src: [
    {
      path: './fonts/adelphe/Adelphe-FlorealBold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/adelphe/Adelphe-FlorealBoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/adelphe/Adelphe-FlorealItalic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/adelphe/Adelphe-FlorealRegular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/adelphe/Adelphe-FlorealSemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/adelphe/Adelphe-FlorealSemiBoldItalic.woff2',
      weight: '600',
      style: 'italic',
    },
  ],
  variable: '--font-adelphe',
});

/**
 * Font configuration for the Helvetica Neue Family.
 * Verify that the folder name "helevtica-neue" is intentional.
 */
export const helveticaNeue = localFont({
  src: [
    {
      path: './fonts/helevtica-neue/HelveticaNeueBlack.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueBlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueBold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueBoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueHeavy.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueHeavyItalic.woff2',
      weight: '800',
      style: 'italic',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueItalic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueLight.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueLightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueMedium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueMediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueRoman.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueThin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueThinItalic.woff2',
      weight: '100',
      style: 'italic',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueUltraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/helevtica-neue/HelveticaNeueUltraLightItalic.woff2',
      weight: '200',
      style: 'italic',
    },
  ],
  variable: '--font-helveticaNeue',
});

/**
 * Font configuration for the Libre Caslon Family.
 * Files should be located in: src/lib/fonts/libre-caslon/
 */
export const libreCaslon = localFont({
  src: [
    {
      path: './fonts/libre-caslon/LibreCaslonText-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/libre-caslon/LibreCaslonText-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/libre-caslon/LibreCaslonText-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-libreCaslon',
});

/**
 * Font configuration for the Satoshi Family.
 * Files should be located in: src/lib/fonts/satoshi/
 */
export const satoshi = localFont({
  src: [
    {
      path: './fonts/satoshi/Satoshi-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/satoshi/Satoshi-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
    {
      path: './fonts/satoshi/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/satoshi/Satoshi-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/satoshi/Satoshi-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/satoshi/Satoshi-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/satoshi/Satoshi-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/satoshi/Satoshi-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/satoshi/Satoshi-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './fonts/satoshi/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    // {
    //   path: './fonts/satoshi/Satoshi-Variable.woff2',
    //   weight: 'variable',
    //   style: 'normal',
    // },
    // {
    //   path: './fonts/satoshi/Satoshi-VariableItalic.woff2',
    //   weight: 'variable',
    //   style: 'italic',
    // },
  ],
  variable: '--font-satoshi',
});

/**
 * Font configuration for the Inter Family.
 * Files should be located in: src/lib/fonts/Inter/
 */
export const inter = localFont({
  src: [
    // Variable fonts
    // {
    //   path: './fonts/Inter/Inter-VariableFont_opsz,wght.woff2',
    //   weight: 'variable',
    //   style: 'normal',
    // },
    // {
    //   path: './fonts/Inter/Inter-Italic-VariableFont_opsz,wght.woff2',
    //   weight: 'variable',
    //   style: 'italic',
    // },
    // 18pt variants
    {
      path: './fonts/Inter/Inter_18pt-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_18pt-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_18pt-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_18pt-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_18pt-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_18pt-ExtraBoldItalic.woff2',
      weight: '800',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_18pt-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_18pt-ExtraLightItalic.woff2',
      weight: '200',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_18pt-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_18pt-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_18pt-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_18pt-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_18pt-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_18pt-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_18pt-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_18pt-SemiBoldItalic.woff2',
      weight: '600',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_18pt-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_18pt-ThinItalic.woff2',
      weight: '100',
      style: 'italic',
    },
    // 24pt variants
    {
      path: './fonts/Inter/Inter_24pt-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_24pt-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_24pt-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_24pt-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_24pt-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_24pt-ExtraBoldItalic.woff2',
      weight: '800',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_24pt-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_24pt-ExtraLightItalic.woff2',
      weight: '200',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_24pt-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_24pt-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_24pt-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_24pt-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_24pt-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_24pt-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_24pt-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_24pt-SemiBoldItalic.woff2',
      weight: '600',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_24pt-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_24pt-ThinItalic.woff2',
      weight: '100',
      style: 'italic',
    },
    // 28pt variants
    {
      path: './fonts/Inter/Inter_28pt-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_28pt-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_28pt-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_28pt-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_28pt-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_28pt-ExtraBoldItalic.woff2',
      weight: '800',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_28pt-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_28pt-ExtraLightItalic.woff2',
      weight: '200',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_28pt-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_28pt-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_28pt-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_28pt-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_28pt-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_28pt-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_28pt-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_28pt-SemiBoldItalic.woff2',
      weight: '600',
      style: 'italic',
    },
    {
      path: './fonts/Inter/Inter_28pt-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/Inter/Inter_28pt-ThinItalic.woff2',
      weight: '100',
      style: 'italic',
    },
  ],
  variable: '--font-inter',
});

/**
 * Font configuration for the Playfair Display Family.
 * Files should be located in: src/lib/fonts/playfair-display/
 */
export const playfairDisplay = localFont({
  src: [
    {
      path: './fonts/playfair-display/PlayfairDisplay-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-ExtraBoldItalic.woff2',
      weight: '800',
      style: 'italic',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/playfair-display/PlayfairDisplay-SemiBoldItalic.woff2',
      weight: '600',
      style: 'italic',
    },
  ],
  variable: '--font-PlayfairDisplay',
});

/**
 * Font configuration for the Poppins Family.
 * Files should be located in: src/lib/fonts/poppins/
 */
export const poppins = localFont({
  src: [
    {
      path: './fonts/poppins/Poppins-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
    {
      path: './fonts/poppins/Poppins-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/poppins/Poppins-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-ExtraBoldItalic.woff2',
      weight: '800',
      style: 'italic',
    },
    {
      path: './fonts/poppins/Poppins-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-ExtraLightItalic.woff2',
      weight: '200',
      style: 'italic',
    },
    {
      path: './fonts/poppins/Poppins-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/poppins/Poppins-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/poppins/Poppins-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './fonts/poppins/Poppins-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-SemiBoldItalic.woff2',
      weight: '600',
      style: 'italic',
    },
    {
      path: './fonts/poppins/Poppins-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-ThinItalic.woff2',
      weight: '100',
      style: 'italic',
    },
  ],
  variable: '--font-poppins',
});

/**
 * Google font configuration for Libre Baskerville.
 * Loaded using next/font/google (recommended by Next.js).
 */
export const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-libre-baskerville',
});

/**
 * Google font configuration for Plus Jakarta Sans.
 * Loaded using next/font/google (recommended by Next.js).
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

/**
 * Google font configuration for JetBrains Mono.
 * Loaded using next/font/google (recommended by Next.js).
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

/**
 * Font configuration for the Harry Potter font.
 * Files should be located in: src/lib/fonts/harry-potter/
 */
export const harryPotter = localFont({
  src: [
    {
      path: './fonts/harry-potter/HARRYP__.ttf',
    },
  ],
  display: 'swap',
  variable: '--font-harry-potter',
});

export const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: '--font-archivo',
});