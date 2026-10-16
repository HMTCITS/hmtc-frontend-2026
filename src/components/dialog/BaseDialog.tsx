import { Dialog, DialogBackdrop, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { CircleAlert, CircleCheck, CircleX, TriangleAlert } from 'lucide-react';
import * as React from 'react';

import Button from '@/components/buttons/Button';

type BaseDialogProps = {
  /** Maintained by useDialogStore */
  open: boolean;
  /** Maintained by useDialogStore */
  onSubmit: () => void;
  /** Maintained by useDialogStore */
  onClose: () => void;
  /** Customizable Dialog Options */
  options: DialogOptions;
};

export type DialogOptions = {
  catchOnCancel?: boolean;
  title: React.ReactNode;
  description: React.ReactNode;
  variant: 'success' | 'warning' | 'danger';
  submitText: React.ReactNode;
  cancelText?: string;
};

/**
 * Base Dialog for useDialog hook implementation.
 *
 * **Should be called with the hook, not by the component itself**
 *
 *
 * @see useDialogStore
 * @example ```tsx
 * const dialog = useDialog();
 *
 * dialog(options);
 * ```
 */
export default function BaseDialog({
  open,
  onSubmit,
  onClose,
  options: { title, description, variant, submitText, cancelText = 'Cancel' },
}: BaseDialogProps) {
  const current = colorVariant[variant];

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog
        as='div'
        static
        className='fixed inset-0 z-40 overflow-y-auto'
        open={open}
        onClose={() => onClose()}
      >
        <div className='flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <DialogBackdrop className='bg-opacity-75 fixed inset-0 bg-gray-900 transition-opacity' />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className='hidden sm:inline-block sm:h-screen sm:align-middle'
            aria-hidden='true'
          >
            &#8203;
          </span>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            enterTo='opacity-100 translate-y-0 sm:scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 translate-y-0 sm:scale-100'
            leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          >
            <div className='z-auto inline-block w-full transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-lg sm:p-6 sm:align-middle'>
              <div className='absolute top-0 right-0 hidden pt-4 pr-4 sm:block'>
                <Button
                  aria-label='Close Modal'
                  icon={CircleX}
                  size='small'
                  variant='secondary'
                  onClick={onClose}
                />
              </div>
              <div className='sm:flex sm:items-start'>
                <div
                  className={clsx(
                    'flex flex-shrink-0 items-center justify-center rounded-full',
                    'mx-auto h-12 w-12 sm:mx-0 sm:h-10 sm:w-10',
                    current.bg.light,
                  )}
                >
                  <current.icon
                    className={clsx('h-6 w-6', current.text.primary)}
                    aria-hidden='true'
                  />
                </div>
                <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg leading-6 font-semibold'
                  >
                    {title}
                  </Dialog.Title>
                  <div className='mt-2'>
                    <p className='text-sm'>{description}</p>
                  </div>
                </div>
              </div>
              <div className='mt-5 flex w-full flex-col gap-3 sm:mt-4 sm:flex sm:flex-row-reverse'>
                <Button
                  aria-label='Submit Modal'
                  onClick={onSubmit}
                  variant='primary'
                >
                  {submitText}
                </Button>
                <Button
                  aria-label='Cansel Button'
                  type='button'
                  onClick={onClose}
                  variant='secondary'
                >
                  {cancelText}
                </Button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

const colorVariant = {
  success: {
    bg: {
      light: 'bg-green-100',
    },
    text: {
      primary: 'text-green-500',
    },
    icon: CircleCheck,
  },
  warning: {
    bg: {
      light: 'bg-yellow-100',
    },
    text: {
      primary: 'text-yellow-500',
    },
    icon: CircleAlert,
  },
  danger: {
    bg: {
      light: 'bg-red-100',
    },
    text: {
      primary: 'text-red-500',
    },
    icon: TriangleAlert,
  },
};
