import * as React from 'react';

import { cn } from '@/lib/utils';

const TYPOGRAPHY_VARIANT_CLASSES = {
  k0: 'text-4xl font-bold leading-none md:text-[80px]',
  k1: 'text-[2rem] font-extrabold leading-tight md:text-[3.25rem]',
  k2: 'text-4xl font-bold md:text-[3.25rem]',
  j0: 'font-bold md:text-5xl',
  j1: 'text-4xl font-bold',
  j2: 'text-3xl font-bold',
  i1: 'font-bold md:text-2xl',
  i2: 'text-xl font-bold',
  h1: 'font-semibold md:text-2xl',
  h2: 'text-lg font-semibold md:text-xl',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold',
  h5: 'text-sm font-semibold',
  s0: 'font-medium md:text-xl',
  s1: 'font-medium md:text-lg',
  s2: 'font-medium md:text-base',
  s3: 'text-sm font-medium',
  s4: 'text-xs font-medium',
  b1: 'font-normal md:text-lg',
  b2: 'text-base font-normal',
  b3: 'text-base font-light',
  b4: 'text-sm font-normal',
  b5: 'text-sm font-light',
  c0: 'text-xs font-normal',
  c1: 'text-xs font-light',
  c2: 'text-[11px] leading-[14px]',
} as const;

export type TypographyVariant = keyof typeof TYPOGRAPHY_VARIANT_CLASSES;

/**
 * Maps font family keys to Tailwind CSS classes.
 */
const FONT_FAMILY_CLASSES = {
  poppins: 'font-poppins',
  satoshi: 'font-satoshi',
  adelphe: 'font-adelphe',
  libre: 'font-libre',
  jetbrainsMono: 'font-jetbrains-mono',
  inter: 'font-inter',
  helveticaNeue: 'font-helveticaNeue',
  playfair: 'font-playfairDisplay',
} as const;

export type FontFamily = keyof typeof FONT_FAMILY_CLASSES;

/**
 * Maps font weight keys to Tailwind CSS classes.
 */
const FONT_WEIGHT_CLASSES = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
} as const;

export type FontWeight = keyof typeof FONT_WEIGHT_CLASSES;

/**
 * Props for the Typography component.
 *
 * @template T - The HTML element type.
 */
export type TypographyProps<T extends React.ElementType> = {
  /**
   * The HTML tag or component to render.
   * @default 'p'
   */
  as?: T;
  /**
   * The content to display.
   */
  children: React.ReactNode;
  /**
   * Font weight. Acceptable values: 'thin', 'extralight', 'light', 'regular',
   * 'medium', 'semibold', 'bold', 'extrabold', 'black'.
   * @default 'regular'
   */
  weight?: FontWeight;
  /**
   * Font family. Acceptable values: 'poppins', 'satoshi', 'adelphe', 'libre',
   * 'jetbrainsMono', 'inter', 'playfair'.
   * @default 'poppins'
   */
  font?: FontFamily;
  /**
   * Typography variant determines the text size and style.
   * Acceptable values are defined in {@link TYPOGRAPHY_VARIANT_CLASSES}.
   * @default 'b2'
   */
  variant?: TypographyVariant;
  /**
   * Additional CSS classes.
   */
  className?: string;
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  'as' | 'children' | 'weight' | 'font' | 'variant' | 'className'
>;

/**
 * # Typography Component
 *
 * Component for consistent text styling across the application.
 *
 * @example
 * <Typography as="h1" weight="bold" font="poppins" variant="k1" className="mb-4">
 *   Hello World!
 * </Typography>
 *
 * ## Variant Quick Reference Table
 *
 * | Category | Variant | Base Size         | MD Size            | Weight    | Use Case                  |
 * |----------|---------|-------------------|-------------------|-----------|---------------------------|
 * | **K**    | k0      | 36px (text-4xl)   | 80px              | Bold      | Hero titles               |
 * |          | k1      | 32px (2rem)       | 52px (3.25rem)    | ExtraBold | Main headings             |
 * |          | k2      | 36px (text-4xl)   | 52px (3.25rem)    | Bold      | Section headings          |
 * | **J**    | j0      | 16px (text-base)  | 48px (text-5xl)   | Bold      | Responsive headings       |
 * |          | j1      | 36px (text-4xl)   | -                 | Bold      | Fixed large headings      |
 * |          | j2      | 30px (text-3xl)   | -                 | Bold      | Medium-large headings     |
 * | **I**    | i1      | 16px (text-base)  | 24px (text-2xl)   | Bold      | Emphasized text           |
 * |          | i2      | 20px (text-xl)    | -                 | Bold      | Sub-headings              |
 * | **H**    | h1      | 16px (text-base)  | 24px (text-2xl)   | SemiBold  | Section sub-headings      |
 * |          | h2      | 18px (text-lg)    | 20px (text-xl)    | SemiBold  | Card titles               |
 * |          | h3      | 18px (text-lg)    | -                 | SemiBold  | Strong paragraph headers  |
 * |          | h4      | 16px (text-base)  | -                 | SemiBold  | Small headers             |
 * |          | h5      | 14px (text-sm)    | -                 | SemiBold  | Caption headers           |
 * | **S**    | s0      | 16px (text-base)  | 20px (text-xl)    | Medium    | Featured paragraphs       |
 * |          | s1      | 16px (text-base)  | 18px (text-lg)    | Medium    | Emphasized body text      |
 * |          | s2      | 16px (text-base)  | 16px (text-base)  | Medium    | Standard medium text      |
 * |          | s3      | 14px (text-sm)    | -                 | Medium    | Small emphasized text     |
 * |          | s4      | 12px (text-xs)    | -                 | Medium    | Small labels              |
 * | **B**    | b1      | 16px (text-base)  | 18px (text-lg)    | Normal    | Main body text           |
 * |          | b2      | 16px (text-base)  | -                 | Normal    | Standard paragraphs       |
 * |          | b3      | 16px (text-base)  | -                 | Light     | Body text light           |
 * |          | b4      | 14px (text-sm)    | -                 | Normal    | Small body text           |
 * |          | b5      | 14px (text-sm)    | -                 | Light     | Small light text          |
 * | **C**    | c0      | 12px (text-xs)    | -                 | Normal    | Caption text              |
 * |          | c1      | 12px (text-xs)    | -                 | Light     | Caption text light        |
 * |          | c2      | 11px              | -                 | Normal    | Fine print                |
 *
 * ## Font Weight Reference
 * - Light: 300
 * - Normal: 400
 * - Medium: 500
 * - SemiBold: 600
 * - Bold: 700
 * - ExtraBold: 800
 *
 * ## Categories Explained
 * - K: Largest headings (hero, main page titles)
 * - J: Large headings (page sections)
 * - I: Medium headings (subsections)
 * - H: Small headings (components, cards)
 * - S: Medium weight text (emphasized paragraphs)
 * - B: Normal body text (paragraphs)
 * - C: Caption text (smallest text elements)
 */
export default function Typography<T extends React.ElementType = 'p'>({
  as,
  children,
  weight = 'regular',
  font = 'poppins',
  variant = 'b2',
  className,
  ...rest
}: TypographyProps<T>) {
  const Component = as || 'p';

  const classes = cn(
    TYPOGRAPHY_VARIANT_CLASSES[variant],
    FONT_FAMILY_CLASSES[font],
    FONT_WEIGHT_CLASSES[weight],
    className,
  );

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
