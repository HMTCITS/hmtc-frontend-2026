import Link from 'next/link';

export const metadata = { title: 'Sandbox Index' };

export default function SandboxIndexPage() {
  const pages: { href: string; label: string; desc?: string }[] = [
    { href: '/sandbox/buttons', label: 'Buttons' },
    { href: '/sandbox/cards', label: 'Cards' },
    { href: '/sandbox/carousels', label: 'Carousels' },
    { href: '/sandbox/dialogs', label: 'Dialogs (Base + Confirm)' },
    { href: '/sandbox/confirm-modal', label: 'Advanced Confirm Modal' },
    { href: '/sandbox/forms', label: 'Form Inputs' },
    { href: '/sandbox/links', label: 'Links' },
    { href: '/sandbox/typography', label: 'Typography' },
    { href: '/sandbox/lazy-section', label: 'Lazy Section' },
    { href: '/sandbox/next-image', label: 'Next Image' },
    { href: '/sandbox/pagination', label: 'Pagination' },
    { href: '/sandbox/skeleton', label: 'Skeleton' },
    { href: '/sandbox/toaster', label: 'Toaster / Sonner' },
    { href: '/sandbox/table', label: 'Data Table' },
    {
      href: '/sandbox/page-builder',
      label: 'Page Builder',
      desc: 'CMS dashboard prototype + approved building blocks',
    },
  ];
  return (
    <main className='mx-auto max-w-5xl space-y-8 p-8'>
      <h1 className='font-adelphe text-4xl font-bold'>Sandbox Index</h1>
      <p className='text-muted-foreground'>
        Kumpulan halaman contoh untuk seluruh komponen.
      </p>
      <ul className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
        {pages.map((p) => (
          <li key={p.href} className='rounded border p-4 hover:bg-accent'>
            <Link href={p.href} className='block font-medium underline'>
              {p.label}
            </Link>
            {p.desc && (
              <p className='text-xs text-muted-foreground'>{p.desc}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
