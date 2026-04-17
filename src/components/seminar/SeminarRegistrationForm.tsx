'use client';

import { useEffect, useMemo, useState } from 'react';

import Threads from '@/components/Threads';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Input } from '@/components/ui/input';
import { getCookie, setCookie } from '@/lib/cookies';

type SeminarFormField = {
  id: string;
  label: string;
  placeholder: string;
};

export type SeminarRegistrationConfig = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  fields: SeminarFormField[];
  submitLabel: string;
  apiEndpoint: string;
  successMessage?: string;
  rsvpClosesAt?: string;
  closedMessage?: string;
};

type SeminarRegistrationFormProps = {
  registration: SeminarRegistrationConfig;
};

const SEMINAR_ATTENDANCE_LINK = 'its.id/m/SeminarDosen1ETC2026';
const REGISTRATION_STORAGE_KEY_PREFIX = 'seminar.registration.submitted';
const REGISTRATION_COOKIE_KEY_PREFIX = 'seminar_registration_submitted';

function buildInitialValues(fields: SeminarFormField[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.id] = '';
    return acc;
  }, {});
}

export default function SeminarRegistrationForm({
  registration,
}: SeminarRegistrationFormProps) {
  const registrationStorageKey = useMemo(
    () => `${REGISTRATION_STORAGE_KEY_PREFIX}.${registration.id}`,
    [registration.id],
  );
  const registrationCookieKey = useMemo(
    () => `${REGISTRATION_COOKIE_KEY_PREFIX}_${registration.id}`,
    [registration.id],
  );

  const initialValues = useMemo(
    () => buildInitialValues(registration.fields),
    [registration.fields],
  );

  const [formValues, setFormValues] =
    useState<Record<string, string>>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedLocalStatus = localStorage.getItem(registrationStorageKey);
    const savedCookieStatus = getCookie(registrationCookieKey);
    const hasRegistered =
      savedLocalStatus === 'true' || savedCookieStatus === 'true';

    if (!hasRegistered) {
      return;
    }

    setIsSubmitted(true);
    setIsSuccessModalOpen(true);

    try {
      localStorage.setItem(registrationStorageKey, 'true');
    } catch (error) {
      void error;
    }

    setCookie(registrationCookieKey, 'true', {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'Lax',
    });
  }, [registrationCookieKey, registrationStorageKey]);

  const isRsvpClosed = useMemo(() => {
    if (!registration.rsvpClosesAt) {
      return false;
    }

    const closeTime = new Date(registration.rsvpClosesAt).getTime();
    if (Number.isNaN(closeTime)) {
      return false;
    }

    return Date.now() > closeTime;
  }, [registration.rsvpClosesAt]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (isRsvpClosed) {
      setSubmitError(registration.closedMessage || 'RSVP Closed, thank you');
      return;
    }

    const hasEmptyField = registration.fields.some(
      (field) => !formValues[field.id]?.trim(),
    );

    if (hasEmptyField) {
      setSubmitError('Semua field wajib diisi sebelum submit.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(registration.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formValues,
          submittedAt: new Date().toISOString(),
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message || 'Gagal mengirim pendaftaran. Silakan coba lagi.',
        );
      }

      try {
        localStorage.setItem(registrationStorageKey, 'true');
      } catch (error) {
        void error;
      }

      setCookie(registrationCookieKey, 'true', {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'Lax',
      });

      setIsSubmitted(true);
      setIsSuccessModalOpen(true);
      setFormValues(initialValues);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal mengirim pendaftaran. Silakan coba lagi.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id={registration.id}
      className='relative overflow-hidden bg-white px-4 pt-16 pb-20 sm:px-8 lg:px-20'
    >
      <div className='absolute inset-0'>
        <Threads
          className='h-full w-full opacity-70'
          color={[0, 0.47058823529411764, 0.7058823529411765]}
          amplitude={1}
          distance={0}
          enableMouseInteraction
        />
      </div>
      <div className='pointer-events-none absolute inset-x-0 bottom-8 h-20 bg-[radial-gradient(ellipse_at_center,rgba(31,111,237,0.16),transparent_70%)]' />
      <div className='pointer-events-none absolute inset-x-0 bottom-10 h-px bg-[repeating-linear-gradient(90deg,rgba(0,120,180,0.2),rgba(0,120,180,0.2)_24px,transparent_24px,transparent_56px)]' />

      <div className='relative z-10 mx-auto max-w-2xl rounded-[10px] border border-[#D3D3D3] bg-[rgba(248,249,250,0.2)] p-7 shadow-[4px_4px_32px_0_#CED4DA] backdrop-blur-[10px] md:p-10'>
        <p className='font-plus-jakarta-sans text-base font-extrabold text-[#0078B4] sm:text-lg'>
          {registration.eyebrow}
        </p>
        <h2 className='mt-2 font-libre-baskerville text-4xl leading-tight font-semibold text-black md:text-5xl'>
          {registration.title}
        </h2>
        <p className='mt-2 font-plus-jakarta-sans text-sm text-black md:text-base'>
          {registration.description}
        </p>

        {isSubmitted ? (
          <p className='mt-6 rounded-lg border border-[#C7E2CD] bg-[#E8F6EB] px-4 py-3 font-plus-jakarta-sans text-sm font-semibold text-[#216E39]'>
            {registration.successMessage ||
              'Pendaftaran diterima. Sampai jumpa di sesi seminar!'}{' '}
            Save this link to attend seminar:{' '}
            <a
              href='https://its.id/m/SeminarDosen1ETC2026'
              target='_blank'
              rel='noreferrer'
              className='underline underline-offset-2'
            >
              {SEMINAR_ATTENDANCE_LINK}
            </a>
          </p>
        ) : null}

        <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
          {isRsvpClosed ? (
            <p className='rounded-lg border border-[#D3D3D3] bg-white/70 px-4 py-3 font-plus-jakarta-sans text-sm font-semibold text-black'>
              {registration.closedMessage || 'RSVP Closed, thank you'}
            </p>
          ) : (
            registration.fields.map((field) => (
              <div key={field.id} className='space-y-2'>
                <label
                  htmlFor={field.id}
                  className='font-plus-jakarta-sans text-sm font-semibold text-black md:text-base'
                >
                  {field.label}
                </label>
                <Input
                  id={field.id}
                  name={field.id}
                  value={formValues[field.id] || ''}
                  onChange={(event) =>
                    handleInputChange(field.id, event.currentTarget.value)
                  }
                  placeholder={field.placeholder}
                  className='h-[43px] rounded-lg border-[#6B6B6B] bg-white px-5 font-plus-jakarta-sans text-sm text-[#575757] placeholder:text-[rgba(87,87,87,0.78)] focus-visible:ring-[#0078B4]'
                />
              </div>
            ))
          )}

          <Button
            type='submit'
            disabled={isSubmitting || isRsvpClosed || isSubmitted}
            className='mt-2 h-[50px] w-full rounded-lg bg-[#0078B4] font-plus-jakarta-sans text-base font-bold text-white hover:bg-[#02699f]'
          >
            {isRsvpClosed
              ? 'RSVP Closed'
              : isSubmitted
                ? 'Sudah Terdaftar'
                : isSubmitting
                  ? 'Mengirim...'
                  : registration.submitLabel}
          </Button>

          {submitError ? (
            <p className='font-plus-jakarta-sans text-sm text-red-700'>
              {submitError}
            </p>
          ) : null}
        </form>
      </div>

      <ConfirmModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        variant='success'
        size='md'
        title='Registration Successful'
        subtitle='Pendaftaran diterima. Sampai jumpa di sesi seminar!'
        actions={[
          {
            id: 'close',
            label: 'Tutup',
            variant: 'default',
            autoFocus: true,
          },
        ]}
        closeOnOverlayClick
        closeOnEsc
        primaryOnEnter
      >
        <p className='font-plus-jakarta-sans text-sm text-black'>
          Save this link to attend seminar:{' '}
          <a
            href='https://its.id/m/SeminarDosen1ETC2026'
            target='_blank'
            rel='noreferrer'
            className='font-semibold text-[#0078B4] underline underline-offset-2'
          >
            {SEMINAR_ATTENDANCE_LINK}
          </a>
        </p>
      </ConfirmModal>
    </section>
  );
}
