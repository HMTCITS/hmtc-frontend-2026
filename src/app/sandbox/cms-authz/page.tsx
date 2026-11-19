'use client';

/**
 * Dev-only playground for src/lib/directus/authz.ts (blocked in production by
 * src/proxy.ts, like every /sandbox page). Calls the real `authorize()` and
 * `allowedActions()`; nothing here talks to Directus or a session.
 */
import * as React from 'react';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SessionUser } from '@/lib/cms/dto';
import { CMS_ERROR_STATUS } from '@/lib/cms/errors';
import {
  MEMBERSHIP_ROLES,
  type MembershipRole,
  PAGE_ACTIONS,
  PAGE_STATUSES,
  type PageAction,
  type PageStatus,
} from '@/lib/cms/vocab';
import {
  allowedActions,
  authorize,
  type AuthzPage,
} from '@/lib/directus/authz';
import { cn } from '@/lib/utils';

const PAGE_DEPT = '00000000-0000-4000-8000-00000000000a';
const OTHER_DEPT = '00000000-0000-4000-8000-00000000000b';
const ME = '10000000-0000-4000-8000-000000000001';
const SOMEONE_ELSE = '10000000-0000-4000-8000-000000000002';
const ACTIONS = Object.keys(PAGE_ACTIONS) as PageAction[];

type RoleChoice = 'none' | 'admin' | MembershipRole;
type DeptChoice = 'same' | 'other';
type SubmitterChoice = 'someone_else' | 'me' | 'not_recorded';

type Scenario = {
  role: RoleChoice;
  dept: DeptChoice;
  status: PageStatus;
  isLive: boolean;
  submitter: SubmitterChoice;
};

const PRESETS: { label: string; scenario: Scenario }[] = [
  {
    label: 'Publisher publishes someone else’s submission',
    scenario: {
      role: 'publisher',
      dept: 'same',
      status: 'in_review',
      isLive: false,
      submitter: 'someone_else',
    },
  },
  {
    label: 'Publisher publishes own submission',
    scenario: {
      role: 'publisher',
      dept: 'same',
      status: 'in_review',
      isLive: false,
      submitter: 'me',
    },
  },
  {
    label: 'Admin publishes own submission',
    scenario: {
      role: 'admin',
      dept: 'same',
      status: 'in_review',
      isLive: false,
      submitter: 'me',
    },
  },
  {
    label: 'Submission not recorded',
    scenario: {
      role: 'publisher',
      dept: 'same',
      status: 'in_review',
      isLive: false,
      submitter: 'not_recorded',
    },
  },
  {
    label: 'Reviewer tries to publish',
    scenario: {
      role: 'reviewer',
      dept: 'same',
      status: 'in_review',
      isLive: false,
      submitter: 'someone_else',
    },
  },
  {
    label: 'Editor from another department',
    scenario: {
      role: 'editor',
      dept: 'other',
      status: 'draft',
      isLive: false,
      submitter: 'not_recorded',
    },
  },
  {
    label: 'Publisher publishes a draft',
    scenario: {
      role: 'publisher',
      dept: 'same',
      status: 'draft',
      isLive: false,
      submitter: 'not_recorded',
    },
  },
];

/** A preset stays highlighted until any control changes the scenario. */
function sameScenario(a: Scenario, b: Scenario) {
  return (Object.keys(a) as (keyof Scenario)[]).every((k) => a[k] === b[k]);
}

function buildUser({ role, dept }: Scenario): SessionUser {
  const memberships =
    role === 'none' || role === 'admin'
      ? []
      : [
          {
            departmentId: dept === 'same' ? PAGE_DEPT : OTHER_DEPT,
            departmentSlug: dept === 'same' ? 'page-department' : 'other',
            role,
          },
        ];
  return {
    id: ME,
    email: 'me@example.com',
    name: 'Me',
    isAdmin: role === 'admin',
    memberships,
  };
}

function buildPage({ status, isLive, submitter }: Scenario): AuthzPage {
  return {
    departmentId: PAGE_DEPT,
    status,
    isLive,
    lastSubmission:
      submitter === 'not_recorded'
        ? null
        : {
            actorId: submitter === 'me' ? ME : SOMEONE_ELSE,
            at: '2026-11-13T00:00:00+07:00',
          },
  };
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function Choice<T extends string>({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function CmsAuthzSandbox() {
  const [s, setS] = React.useState<Scenario>(PRESETS[0].scenario);
  const set = <K extends keyof Scenario>(key: K, value: Scenario[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const user = buildUser(s);
  const page = buildPage(s);
  const allowed = allowedActions(user, page);

  return (
    <main className='mx-auto max-w-5xl space-y-8 p-8'>
      <header className='space-y-2'>
        <Typography as='h1' font='satoshi' weight='bold' variant='j2'>
          CMS authorization playground
        </Typography>
        <Typography
          font='satoshi'
          variant='b4'
          className='text-muted-foreground'
        >
          Runs the real <code>authorize()</code> and{' '}
          <code>allowedActions()</code> from{' '}
          <code>src/lib/directus/authz.ts</code>. No Directus, no session: pick
          a user and a page state and see what the API would answer.
        </Typography>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Presets</CardTitle>
          <CardDescription>
            The cases from the issue and review.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          {PRESETS.map((p) => {
            const active = sameScenario(s, p.scenario);
            return (
              <Button
                key={p.label}
                variant={active ? 'default' : 'outline'}
                size='sm'
                aria-pressed={active}
                onClick={() => setS(p.scenario)}
              >
                {p.label}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scenario</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Field id='role' label='User role'>
            <Choice
              id='role'
              value={s.role}
              onChange={(v) => set('role', v)}
              options={[
                { value: 'none', label: 'no membership' },
                ...MEMBERSHIP_ROLES.map((r) => ({ value: r, label: r })),
                { value: 'admin', label: 'Directus admin' },
              ]}
            />
          </Field>
          <Field id='dept' label='Membership department'>
            <Choice
              id='dept'
              value={s.dept}
              onChange={(v) => set('dept', v)}
              options={[
                { value: 'same', label: 'same as the page' },
                { value: 'other', label: 'another department' },
              ]}
            />
          </Field>
          <Field id='status' label='Page status'>
            <Choice
              id='status'
              value={s.status}
              onChange={(v) => set('status', v)}
              options={PAGE_STATUSES.map((st) => ({ value: st, label: st }))}
            />
          </Field>
          <Field id='submitter' label='Latest submission by'>
            <Choice
              id='submitter'
              value={s.submitter}
              onChange={(v) => set('submitter', v)}
              options={[
                { value: 'someone_else', label: 'someone else' },
                { value: 'me', label: 'me' },
                { value: 'not_recorded', label: 'not recorded' },
              ]}
            />
          </Field>
          <div className='flex items-center gap-3 pt-6'>
            <Switch
              id='live'
              checked={s.isLive}
              onCheckedChange={(v) => set('isLive', v)}
            />
            <Label htmlFor='live'>Page has a live revision</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>authorize() per action</CardTitle>
          <CardDescription>
            What a Route Handler would respond with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>authorize()</TableHead>
                <TableHead>HTTP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTIONS.map((action) => {
                const denial = authorize(user, action, page);
                return (
                  <TableRow key={action}>
                    <TableCell className='font-mono'>{action}</TableCell>
                    <TableCell
                      className={cn(
                        'font-mono',
                        denial === null
                          ? 'text-text-success'
                          : 'text-destructive',
                      )}
                    >
                      {denial ?? 'null (allowed)'}
                    </TableCell>
                    <TableCell className='font-mono'>
                      {denial === null ? '—' : CMS_ERROR_STATUS[denial]}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buttons the dashboard would show</CardTitle>
          <CardDescription>
            <code>allowedActions()</code>, used for{' '}
            <code>PageDetail.allowedActions</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          {allowed.length === 0 ? (
            <Typography
              font='satoshi'
              variant='b4'
              className='text-muted-foreground'
            >
              No actions available.
            </Typography>
          ) : (
            allowed.map((a) => (
              <Button key={a} size='sm' tabIndex={-1}>
                {a}
              </Button>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
