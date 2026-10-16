'use client';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { CircleX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { Fragment, useState } from 'react';

import { validateNrp } from '@/app/gallery/hooks/useValidateNrp';
import Typography from '@/components/Typography';

interface RestrictedModalProps {
  /** On landing: clicking the button opens the modal. In‐gallery: you control initialOpen. */
  isLandingPage?: boolean;
  /** Show the modal immediately on mount (for gallery page). */
  initialOpen?: boolean;
  /** Callback once user is successfully validated (only used in‐gallery). */
  onAuthorized?: (nrp: string) => void;
}

export default function RestrictedModal({
  isLandingPage = false,
  initialOpen = false,
  onAuthorized,
}: RestrictedModalProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [nrp, setNrp] = useState('');
  const [step, setStep] = useState<'input' | 'denied'>('input');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    const ok = await validateNrp(nrp);
    setIsLoading(false);

    if (ok) {
      if (isLandingPage) {
        // landing → push along the ?nrp param
        router.push(`/gallery?nrp=${encodeURIComponent(nrp)}`);
      } else {
        // in-gallery: hide modal and notify parent
        setIsOpen(false);
        onAuthorized?.(nrp);
      }
    } else {
      setStep('denied');
    }
  };

  const handleTryAgain = () => {
    setStep('input');
    setNrp('');
  };

  return (
    <>
      {isLandingPage && (
        <Typography
          variant='b2'
          className='w-full max-w-7xl cursor-pointer text-right font-satoshi font-medium text-black underline underline-offset-4'
          onClick={() => {
            setStep('input');
            setIsOpen(true);
          }}
        >
          Explore Gallery HMTC &rarr;
        </Typography>
      )}

      <Transition show={isOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-[999999]'
          onClose={() => setIsOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <DialogBackdrop className='fixed inset-0 bg-black opacity-90' />
          </TransitionChild>

          <div className='fixed inset-0 flex items-center justify-center p-4'>
            <TransitionChild
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <DialogPanel
                className='relative w-full max-w-[800px] bg-white px-12 py-10'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && step === 'denied') {
                    e.preventDefault();
                    handleTryAgain();
                  }
                }}
              >
                <button
                  aria-label='Close Modal'
                  onClick={() => setIsOpen(false)}
                  className='absolute top-4 right-4 cursor-pointer'
                >
                  <CircleX color='#00AAE7' size={28} />
                </button>

                <DialogTitle>
                  <Typography
                    variant='s0'
                    className='text-center text-[#00AAE7] max-md:text-2xl'
                    font='satoshi'
                    weight='light'
                  >
                    ACCESS RESTRICTED
                  </Typography>
                </DialogTitle>

                <div className='mt-4 flex flex-col items-center'>
                  {step === 'input' ? (
                    <>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmit();
                        }}
                        className='flex flex-col items-center'
                      >
                        <Typography
                          variant='j1'
                          className='mt-2.5 text-center text-black max-md:text-2xl'
                          font='adelphe'
                          weight='bold'
                        >
                          Please enter your NRP to access this page.
                        </Typography>

                        <input
                          type='text'
                          placeholder='Enter your NRP'
                          value={nrp}
                          onChange={(e) => setNrp(e.target.value)}
                          className='mt-6 w-full max-w-[590px] border-2 border-[#00AAE7] p-2 placeholder:text-center placeholder:font-normal placeholder:italic'
                        />

                        <button
                          aria-label='Submit form modal'
                          type='submit'
                          disabled={isLoading}
                          className='mt-6 w-fit cursor-pointer border-b border-black pb-0.5 text-xl font-medium disabled:opacity-50'
                        >
                          {isLoading ? 'Loading...' : 'Submit'}
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Typography
                        variant='j1'
                        className='mt-2.5 text-center text-black max-md:text-2xl'
                        font='adelphe'
                        weight='bold'
                      >
                        Access Denied
                      </Typography>
                      <Typography
                        variant='s0'
                        className='mt-2.5 max-w-[530px] text-center text-[#F93232] italic max-md:text-lg'
                        font='satoshi'
                        weight='regular'
                      >
                        The NRP you provided does not grant access. Please check
                        and try again.
                      </Typography>
                      <button
                        aria-label='Try again form modal'
                        onClick={handleTryAgain}
                        className='mt-6 w-fit cursor-pointer border-b border-black pb-0.5 text-xl font-medium'
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
