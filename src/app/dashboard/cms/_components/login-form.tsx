'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { safeNext } from '@/lib/cms/redirect';
import { cmsFetch } from '@/lib/cms-client';

/** Same rules as the `login` body in the API contract, with Indonesian copy. */
const loginFormSchema = z.object({
  email: z.email('Masukkan alamat email yang valid.'),
  password: z
    .string()
    .min(1, 'Password wajib diisi.')
    .max(256, 'Password terlalu panjang.'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const FALLBACK_ERROR = 'Gagal masuk. Coba lagi.';

/**
 * Calls `POST /api/cms/auth/login`. The API's message (wrong password, no CMS
 * access, too many attempts) is shown as is; it is already user-facing copy.
 */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await cmsFetch('login', { body: values });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : FALLBACK_ERROR);
      return;
    }
    router.replace(safeNext(next));
    router.refresh();
  });

  return (
    <form noValidate onSubmit={onSubmit} className='space-y-4'>
      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor='cms-login-email'>Email</FieldLabel>
        <Input
          id='cms-login-email'
          type='email'
          autoComplete='username'
          aria-invalid={errors.email ? true : undefined}
          {...register('email')}
        />
        <FieldError errors={errors.email ? [errors.email] : undefined} />
      </Field>

      <Field data-invalid={errors.password ? true : undefined}>
        <FieldLabel htmlFor='cms-login-password'>Password</FieldLabel>
        <Input
          id='cms-login-password'
          type='password'
          autoComplete='current-password'
          aria-invalid={errors.password ? true : undefined}
          {...register('password')}
        />
        <FieldError errors={errors.password ? [errors.password] : undefined} />
      </Field>

      {serverError ? (
        <div
          role='alert'
          className='rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2'
        >
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='text-destructive'
          >
            {serverError}
          </Typography>
        </div>
      ) : null}

      <Button type='submit' className='w-full' disabled={isSubmitting}>
        {isSubmitting ? 'Masuk…' : 'Masuk'}
      </Button>
    </form>
  );
}
