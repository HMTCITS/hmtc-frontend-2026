import Typography from '@/components/Typography';
import type { PageStatus } from '@/lib/cms/vocab';
import { cn } from '@/lib/utils';

/**
 * Status pill for the CMS page table. L4 tokens only (DESIGN.md §8) — never
 * the L1 brand palette.
 */
const STATUS_STYLES: Record<PageStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  in_review: 'bg-accent text-accent-foreground',
  changes_requested: 'bg-destructive/10 text-destructive',
  published: 'bg-primary text-primary-foreground',
  archived: 'bg-secondary text-secondary-foreground',
};

const STATUS_LABEL: Record<PageStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  changes_requested: 'Perlu revisi',
  published: 'Published',
  archived: 'Archived',
};

export function PageStatusBadge({ status }: { status: PageStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5',
        STATUS_STYLES[status],
      )}
    >
      <Typography as='span' font='satoshi' weight='medium' variant='c2'>
        {STATUS_LABEL[status]}
      </Typography>
    </span>
  );
}
