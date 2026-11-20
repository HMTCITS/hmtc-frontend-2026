'use client';

import { useState } from 'react';

import Typography from '@/components/Typography';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  agendaBlock,
  createBlock,
  eventDetailsBlock,
  galleryBlock,
} from '@/lib/directus/blocks';
import { cn } from '@/lib/utils';

import {
  AgendaBlockForm,
  EventDetailsBlockForm,
  GalleryBlockForm,
} from '../_components/blocks';

/**
 * Dev surface for the three block editors (task A10). The real editor page
 * replaces this with the block canvas; the forms themselves are the deliverable
 * and are exercised here so they can be reviewed interactively.
 */
function ValidityPill({
  valid,
  issueCount,
}: {
  valid: boolean;
  issueCount: number;
}) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5',
        valid
          ? 'bg-accent text-accent-foreground'
          : 'bg-destructive/10 text-destructive',
      )}
    >
      <Typography as='span' font='satoshi' weight='medium' variant='c2'>
        {valid ? 'Valid' : `Belum valid (${issueCount})`}
      </Typography>
    </span>
  );
}

function IssuesSummary({
  issues,
}: {
  issues: readonly { path: (string | number | symbol)[]; message: string }[];
}) {
  if (issues.length === 0) return null;

  return (
    <p className='mt-2 text-xs text-destructive'>
      {issues
        .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('; ')}
    </p>
  );
}

export default function BlocksPreviewPage() {
  const [eventDetails, setEventDetails] = useState(() =>
    createBlock('eventDetails'),
  );
  const [agenda, setAgenda] = useState(() => createBlock('agenda'));
  const [gallery, setGallery] = useState(() => createBlock('gallery'));

  const eventDetailsCheck = eventDetailsBlock.safeParse(eventDetails);
  const agendaCheck = agendaBlock.safeParse(agenda);
  const galleryCheck = galleryBlock.safeParse(gallery);

  return (
    <div className='space-y-8'>
      <header className='space-y-2'>
        <Typography
          as='h1'
          font='satoshi'
          weight='semibold'
          variant='j2'
          className='text-foreground'
        >
          Form blok
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='b4'
          className='text-muted-foreground'
        >
          Editor terkontrol untuk tiga blok pertama. Validasi memakai schema di
          src/lib/directus/blocks.ts — indikator di tiap kartu menunjukkan
          apakah blok lolos validasi draft.
        </Typography>
      </header>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0'>
          <CardTitle>
            <Typography as='span' font='satoshi' weight='medium' variant='h4'>
              Event Details
            </Typography>
          </CardTitle>
          <ValidityPill
            valid={eventDetailsCheck.success}
            issueCount={
              eventDetailsCheck.success
                ? 0
                : eventDetailsCheck.error.issues.length
            }
          />
        </CardHeader>
        <CardContent>
          <EventDetailsBlockForm
            value={eventDetails}
            onChange={setEventDetails}
          />
          <IssuesSummary
            issues={
              eventDetailsCheck.success ? [] : eventDetailsCheck.error.issues
            }
          />
          <details className='mt-4'>
            <summary className='cursor-pointer text-xs text-muted-foreground'>
              Lihat JSON
            </summary>
            <pre className='mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground'>
              {JSON.stringify(eventDetails, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0'>
          <CardTitle>
            <Typography as='span' font='satoshi' weight='medium' variant='h4'>
              Agenda
            </Typography>
          </CardTitle>
          <ValidityPill
            valid={agendaCheck.success}
            issueCount={
              agendaCheck.success ? 0 : agendaCheck.error.issues.length
            }
          />
        </CardHeader>
        <CardContent>
          <AgendaBlockForm value={agenda} onChange={setAgenda} />
          <IssuesSummary
            issues={agendaCheck.success ? [] : agendaCheck.error.issues}
          />
          <details className='mt-4'>
            <summary className='cursor-pointer text-xs text-muted-foreground'>
              Lihat JSON
            </summary>
            <pre className='mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground'>
              {JSON.stringify(agenda, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0'>
          <CardTitle>
            <Typography as='span' font='satoshi' weight='medium' variant='h4'>
              Gallery
            </Typography>
          </CardTitle>
          <ValidityPill
            valid={galleryCheck.success}
            issueCount={
              galleryCheck.success ? 0 : galleryCheck.error.issues.length
            }
          />
        </CardHeader>
        <CardContent>
          <GalleryBlockForm value={gallery} onChange={setGallery} />
          <IssuesSummary
            issues={galleryCheck.success ? [] : galleryCheck.error.issues}
          />
          <details className='mt-4'>
            <summary className='cursor-pointer text-xs text-muted-foreground'>
              Lihat JSON
            </summary>
            <pre className='mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground'>
              {JSON.stringify(gallery, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
