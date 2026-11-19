import { Info } from 'lucide-react';
import * as React from 'react';
import { get, RegisterOptions, useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';

export type TextareaProps = {
  label?: string | null;
  id: string;
  placeholder?: string;
  helperText?: string;
  readOnly?: boolean;
  hideError?: boolean;
  validation?: RegisterOptions;
  rows?: number;
  onValueChange?: (value: string) => void;
  skipRegister?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;
} & React.ComponentPropsWithoutRef<'textarea'>;

export default function Textarea({
  label = null,
  id,
  placeholder = '',
  helperText,
  readOnly = false,
  hideError = false,
  validation,
  rows = 4,
  containerClassName,
  labelClassName,
  textareaClassName,
  onValueChange,
  skipRegister = false,
  ...rest
}: TextareaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, id);
  const withLabel = label !== null;

  React.useEffect(() => {
    if (typeof window !== 'undefined' && error) {
      void error;
    }
  }, [id, error]);
  return (
    <div className={containerClassName}>
      {withLabel && (
        <label className={cn('font-bold', labelClassName)} htmlFor={id}>
          {label}
        </label>
      )}

      <div className={cn('relative', withLabel && 'mt-1')}>
        {(() => {
          const { onChange: restOnChange, ...restProps } = rest as any;
          if (skipRegister) {
            const handleChange = (
              e: React.ChangeEvent<HTMLTextAreaElement>,
            ) => {
              try {
                restOnChange?.(e);
              } catch (err) {
                void err;
              }
              try {
                onValueChange?.(e.target.value);
              } catch (err) {
                void err;
              }
            };
            return (
              <textarea
                {...restProps}
                onChange={handleChange}
                id={id}
                name={id}
                placeholder={placeholder}
                readOnly={readOnly}
                rows={rows}
                className={cn(
                  'flex w-full rounded-xl bg-white/5 px-4 py-3 text-white transition-all duration-300 placeholder:text-white/60',
                  'min-h-[3.5rem] md:min-h-[4rem]',
                  'border border-white/20',
                  readOnly && 'cursor-not-allowed bg-gray-100',
                  textareaClassName,
                )}
                aria-describedby={id}
              />
            );
          }

          const reg = register(id, validation) as any;
          const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            try {
              reg.onChange?.(e);
            } catch (err) {
              void err;
            }
            try {
              restOnChange?.(e);
            } catch (err) {
              void err;
            }
            try {
              onValueChange?.(e.target.value);
            } catch (err) {
              void err;
            }
          };
          return (
            <textarea
              {...restProps}
              {...reg}
              onChange={handleChange}
              id={id}
              name={id}
              placeholder={placeholder}
              readOnly={readOnly}
              rows={rows}
              className={cn(
                'flex w-full rounded-xl bg-white/5 px-4 py-3 text-white transition-all duration-300 placeholder:text-white/60',
                'min-h-[3.5rem] md:min-h-[4rem]',
                'border border-white/20',
                readOnly && 'cursor-not-allowed bg-gray-100',
                textareaClassName,
              )}
              aria-describedby={id}
            />
          );
        })()}
      </div>

      {helperText && (
        <p className='mt-1.5 text-xs text-stone-500'>{helperText}</p>
      )}
      {!hideError && error && (
        <div className='mt-[12px] flex h-[26px] items-center gap-[12px] self-stretch rounded-[12px] bg-red-500/[0.07] px-[8px] py-[2px]'>
          <Info className='h-[18px] w-[18px] text-text-error' />
          <p className='text-[14px] text-text-error'>
            {(() => {
              const msg = (error &&
                (error.message || (error._errors && error._errors[0]))) as
                | string
                | undefined;
              if (typeof msg === 'string' && msg.length) {
                return msg;
              }
              if (typeof error === 'string') {
                if (
                  error === 'Invalid input' &&
                  id?.startsWith?.('divisionAnswers.')
                )
                  return 'Belum diisi';
                return error;
              }
              return String(msg ?? '');
            })()}
          </p>
        </div>
      )}
    </div>
  );
}
