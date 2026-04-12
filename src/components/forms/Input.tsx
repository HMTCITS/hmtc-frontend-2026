import { Eye, EyeClosed, Info, LucideIcon } from 'lucide-react';
import * as React from 'react';
import { get, RegisterOptions, useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';

export type InputProps = {
  label: string | null;
  id: string;
  placeholder?: string;
  helperText?: string;
  type?: React.HTMLInputTypeAttribute;
  readOnly?: boolean;
  // disabling error msg not error validation
  hideError?: boolean;
  validation?: RegisterOptions;
  leftIcon?: LucideIcon | string;
  inputWithLeftIconClassName?: string;
  rightNode?: React.ReactNode;
  addon?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
} & React.ComponentPropsWithoutRef<'input'>;

export default function Input({
  label,
  id,
  placeholder = '',
  helperText,
  type = 'text',
  disabled,
  readOnly = false,
  hideError = false,
  validation,
  leftIcon: LeftIcon,
  inputWithLeftIconClassName,
  addon,
  rightNode,
  containerClassName,
  labelClassName,
  inputClassName,
  ...rest
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, id);
  const withLabel = label !== null;

  const [showPassword, setShowPassword] = React.useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className={containerClassName}>
      {withLabel && (
        <label
          className={cn('text-typo-main font-bold', labelClassName)}
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'relative',
          withLabel && 'mt-1',
          addon && 'flex rounded-lg shadow-none',
          'text-mid md:text-mid',
        )}
      >
        {addon && (
          <div
            className={cn(
              'pointer-events-auto flex min-h-full items-center rounded-l-lg px-3.5',
              'bg-stone-100 text-stone-600',
              'border border-r-0 border-gray-300',
            )}
          >
            <p>{addon}</p>
          </div>
        )}
        {LeftIcon && (
          <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5'>
            {typeof LeftIcon === 'string' ? (
              <p className='text-typo-main'>{LeftIcon}</p>
            ) : (
              <LeftIcon size='1em' className='text-xl text-stone-500' />
            )}
          </div>
        )}
        <input
          {...register(id, validation)}
          {...rest}
          type={
            type === 'password' ? (showPassword ? 'text' : 'password') : type
          }
          name={id}
          id={id}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          className={cn(
            'flex w-full rounded-xl shadow-none',
            'min-h-[2.25rem] md:min-h-[2.5rem]',
            'text-typo-dark border border-gray-300 px-3.5 py-0 caret-stone-600',
            'ring-stone-400 focus:ring-2 focus:ring-offset-2 focus:outline-none',
            (readOnly || disabled) && [
              'cursor-not-allowed border-gray-300 bg-gray-100 focus:border-gray-300 focus:ring-0',
            ],
            error && '',
            LeftIcon && ['pl-10', inputWithLeftIconClassName],
            rightNode && 'pr-10',
            addon && 'rounded-l-none shadow-none',
            'autofill-bg-transparent', // Add this class
            inputClassName,
          )}
          aria-describedby={id}
        />

        {type === 'password' && (
          <button
            type='button'
            onClick={togglePassword}
            className={cn(
              'absolute top-1/2 right-0 mr-3 -translate-y-1/2',
              'flex h-6 w-6 items-center justify-center rounded-xl',
              'focus:ring focus:ring-stone-500 focus:outline-none',
              'text-lg text-stone-400 hover:text-stone-500',
            )}
          >
            {showPassword ? <EyeClosed /> : <Eye />}
          </button>
        )}
        {rightNode && (
          <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
            {rightNode}
          </div>
        )}
      </div>
      {helperText && (
        <p className='mt-1.5 text-xs text-stone-500'>{helperText}</p>
      )}
      {!hideError && error && (
        <div className='mt-[12px] flex h-[26px] items-center gap-[12px] self-stretch rounded-[12px] bg-red-500/[0.07] px-[8px] py-[2px]'>
          <Info className='h-[18px] w-[18px] text-text-error' />
          <p className='font-satoshi text-[14px] text-text-error'>
            {error.message?.toString()}
          </p>
        </div>
      )}
    </div>
  );
}
