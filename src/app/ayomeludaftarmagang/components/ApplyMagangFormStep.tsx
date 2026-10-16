'use client';

import { FileArchive, Info } from 'lucide-react';
import { motion } from 'motion/react';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import Input from '@/components/forms/Input';
import GradientText from '@/components/reactbits/GradientText';
import { DocumentUpload } from '@/components/repository/DocumentUpload';
import Typography from '@/components/Typography';
import { Label } from '@/components/ui/label';
import {
  DIVISIONS as DIVISION_LIST,
  GENERAL_QUESTIONS,
} from '@/contents/magangForm';
import {
  BaseFormValues,
  clearZipFile,
  DivisionAnswers,
  loadZipFile,
  saveBase,
  saveDivisionAnswers,
  saveZipFile,
} from '@/lib/persist';

export type ApplyMagangFormStepProps = {
  onSubmitSuccess: () => void;
  onSubmitError: (message: string) => void;
  submitFn: (payload: {
    nama: string;
    nrp: string;
    kelompokKP: string;
    mindmap: File;
  }) => Promise<unknown>;
  formId?: string;
  onDivisionsChange?: (divisionIds: string[]) => void;
  selectedDivisions?: string[];
  resetSignal?: number;
  onBaseFormChange?: (snapshot: {
    nama: string;
    nrp: string;
    kelompokKP: string;
    q1: string;
    q2: string;
    q3: string;
    file_zip: File | null;
  }) => void;
};
export default function ApplyMagangFormStep(_props: ApplyMagangFormStepProps) {
  const {
    register,
    setValue,
    setError,
    watch,
    clearErrors,
    formState: { errors },
  } = useFormContext<any>();
  React.useEffect(() => {}, []);
  const [zipFile, setZipFile] = React.useState<File | null>(null);
  const selectedDivisions: string[] = watch('selectedDivisions') || [];
  const MAX_ZIP_BYTES = 10 * 1024 * 1024;

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const f = await loadZipFile();
        if (active && f) {
          setZipFile(f);
          setValue('zipFile', f as any, {
            shouldDirty: false,
            shouldValidate: false,
          });
        }
      } catch (err) {
        void err;
      }
    })();
    return () => {
      active = false;
    };
  }, [setValue]);

  const handleZipChange = async (file: File | null) => {
    setZipFile(file);
    if (file) {
      if (file.size > MAX_ZIP_BYTES) {
        setError('zipFile', {
          type: 'validate',
          message: 'Ukuran file melebihi 10MB',
        });
        return;
      }
      try {
        await saveZipFile(file);
      } catch (err) {
        void err;
      }
    } else {
      try {
        await clearZipFile();
      } catch (err) {
        void err;
      }
    }
    setValue('zipFile', file as any, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const handleDivisionToggle = (divisionId: string) => {
    const prev = selectedDivisions;
    const next = prev.includes(divisionId)
      ? prev.filter((d) => d !== divisionId)
      : prev.length < 3
        ? [...prev, divisionId]
        : prev;
    setValue('selectedDivisions', next, {
      shouldDirty: true,
      shouldValidate: false,
    });
    if (prev.includes(divisionId) && !next.includes(divisionId)) {
      try {
        const all = (watch('divisionAnswers') || {}) as DivisionAnswers;
        const nextAnswers: DivisionAnswers = { ...all };
        if (nextAnswers[divisionId]) {
          delete nextAnswers[divisionId];
        }
        setValue('divisionAnswers', nextAnswers, {
          shouldDirty: true,
          shouldValidate: false,
        });
        try {
          saveDivisionAnswers(nextAnswers);
        } catch (err) {
          void err;
        }
        try {
          clearErrors([
            `divisionAnswers.${divisionId}`,
            `divisionAnswers.${divisionId}.q1`,
            `divisionAnswers.${divisionId}.q2`,
            `divisionAnswers.${divisionId}.q3`,
            `divisionAnswers.${divisionId}.q4`,
            `divisionAnswers.${divisionId}.q5`,
          ]);
        } catch (err) {
          void err;
        }
      } catch (err) {
        void err;
      }
    }
  };

  const watched = watch(['nama', 'nrp', 'kelompokKP', 'q1', 'q2', 'q3']);
  const [wNama, wNrp, wKelompokKP, wQ1, wQ2, wQ3] = (watched ||
    []) as Array<string>;
  React.useEffect(() => {
    const base: BaseFormValues = {
      nama: wNama ?? '',
      nrp: wNrp ?? '',
      kelompokKP: wKelompokKP ?? '',
      q1: wQ1 ?? '',
      q2: wQ2 ?? '',
      q3: wQ3 ?? '',
    };
    saveBase(base);
  }, [wNama, wNrp, wKelompokKP, wQ1, wQ2, wQ3]);

  return (
    <div className='space-y-8'>
      <div>
        <Typography as='h2' weight='bold' className='mb-6 text-2xl text-white'>
          Ceritakan Tentang Diri Anda
        </Typography>

        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Input
            id='nama'
            label='Nama Lengkap'
            placeholder='ex. Jason Susanto'
            validation={{
              required: 'Nama wajib diisi',
              minLength: { value: 2, message: 'Nama minimal 2 karakter' },
            }}
            required
            labelClassName='text-white/90 font-satoshi'
            inputClassName='border-white/20 bg-white/5 text-white placeholder:text-white/60 placeholder:font-satoshi focus:border-[#0040FF] focus:ring-2 focus:ring-[#0040FF]/30'
            containerClassName='group'
          />

          <Input
            id='nrp'
            label='NRP'
            placeholder='ex. 50xxxxxxxx'
            validation={{
              required: 'NRP wajib diisi',
              pattern: {
                value: /\d{10}/,
                message: 'NRP harus 10 digit angka',
              },
            }}
            required
            pattern='\d{10}'
            inputMode='numeric'
            labelClassName='text-white/90 font-satoshi'
            inputClassName='border-white/20 bg-white/5 text-white placeholder:text-white/60 placeholder:font-satoshi focus:border-[#0040FF] focus:ring-2 focus:ring-[#0040FF]/30'
            containerClassName='group'
          />

          <Input
            id='kelompokKP'
            label='Nomor Kelompok KP'
            placeholder='ex. 01'
            validation={{
              required: 'Nomor Kelompok KP wajib diisi',
              pattern: {
                value: /^\d{1,2}$/,
                message: 'Nomor Kelompok KP harus 2 digit angka',
              },
            }}
            required
            pattern='\d{2}'
            labelClassName='text-white/90 font-satoshi'
            inputClassName='border-white/20 bg-white/5 text-white placeholder:text-white/60 placeholder:font-satoshi focus:border-[#0040FF] focus:ring-2 focus:ring-[#0040FF]/30'
            containerClassName='group md:col-span-2'
          />
        </div>

        <div className='mb-8'>
          <div className='group relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 shadow-md transition-all duration-300 hover:border-white/20 hover:shadow-lg'>
            <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/6 to-accent/6' />
            <div className='relative z-10 p-4 sm:p-5 md:p-6'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='min-h-[180px]'>
                  <div className='mb-3 flex items-center gap-2'>
                    <span className='rounded-lg bg-white/15 p-2 backdrop-blur-sm'>
                      <FileArchive className='h-5 w-5 text-blue-400' />
                    </span>
                    <Label className='m-0 font-satoshi text-white/90'>
                      Bundle Dokumen (ZIP)
                    </Label>
                  </div>
                  <DocumentUpload
                    onFileSelect={(f) => handleZipChange(f)}
                    onFileRemove={() => handleZipChange(null)}
                    selectedFile={zipFile}
                    tone='glass'
                    className='mt-2 [&_*]:transition-colors'
                    accept='.zip'
                    hint='ZIP (Max 10MB)'
                    error={
                      (errors as any)?.zipFile?.message as string | undefined
                    }
                  />
                  <p className='mt-2 font-satoshi text-xs text-white/60'>
                    Format .zip (maks. 10 MB).
                  </p>
                  {(errors as any)?.zipFile?.message && (
                    <p className='mt-2 font-satoshi text-xs text-red-400'>
                      {(errors as any).zipFile.message as string}
                    </p>
                  )}
                </div>
                <div className='mt-4 rounded-xl border border-white/10 bg-white/5 p-4 md:mt-0'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Info className='h-4 w-4 text-blue-400' />
                    <p className='font-satoshi text-sm font-semibold text-white'>
                      Panduan penyusunan berkas
                    </p>
                  </div>
                  <div className='space-y-4 font-satoshi text-sm text-white/85'>
                    <div>
                      <p className='font-satoshi font-medium text-white'>
                        Isi paket ZIP
                      </p>
                      <ul className='ml-5 list-disc space-y-0.5'>
                        <li>Wajib: CV ATS (PDF)</li>
                        <li>Wajib: Mindmap (PDF)</li>
                        <li>Opsional: Portofolio (PDF, khusus CMI)</li>
                      </ul>
                    </div>
                    <div className='border-t border-white/10 pt-3'>
                      <p className='font-satoshi font-medium text-white'>
                        Penamaan arsip ZIP
                      </p>
                      <p className='mt-1'>
                        <code className='rounded bg-white/10 px-1.5 py-0.5 font-mono'>
                          NRP_NamaLengkap.zip
                        </code>
                      </p>
                      <p className='mt-1 opacity-80'>
                        Contoh:{' '}
                        <span className='font-satoshi font-medium'>
                          50242112_BudiSantoso.zip
                        </span>
                      </p>
                    </div>
                    <div className='border-t border-white/10 pt-3'>
                      <p className='font-satoshi font-medium text-white'>
                        Penamaan berkas di dalam ZIP
                      </p>
                      <ul className='ml-5 list-disc space-y-0.5'>
                        <li>
                          CV:{' '}
                          <code className='rounded bg-white/10 px-1 py-0.5 font-mono'>
                            CV_NamaLengkap.pdf
                          </code>
                        </li>
                        <li>
                          Mindmap:{' '}
                          <code className='rounded bg-white/10 px-1 py-0.5 font-mono'>
                            Mindmap_NamaLengkap.pdf
                          </code>
                        </li>
                        <li>
                          Portofolio (opsional):{' '}
                          <code className='rounded bg-white/10 px-1 py-0.5 font-mono'>
                            Portofolio_NamaLengkap.pdf
                          </code>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Typography as='h2' weight='bold' className='mb-6 text-2xl text-white'>
          Tunjukkan Potensi Anda
        </Typography>
        <div className='space-y-6'>
          {[1, 2, 3].map((num) => (
            <motion.div
              key={num}
              className='group'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: num * 0.1 }}
            >
              <label className='mb-2 block text-justify font-satoshi font-medium text-white/90 transition-colors'>
                {GENERAL_QUESTIONS[num - 1] || `Pertanyaan ${num}`}
              </label>
              <textarea
                {...register(`q${num}` as 'q1' | 'q2' | 'q3', {
                  required: `Jawaban pertanyaan ${num} harus diisi`,
                })}
                required
                placeholder={`Jawab pertanyaan ${num} di sini...`}
                rows={4}
                className='w-full resize-none rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-satoshi text-white transition-all duration-300 group-hover:border-[#0040FF]/50 placeholder:font-satoshi placeholder:text-white/60 focus:border-[#0040FF] focus:ring-2 focus:ring-[#0040FF]/30'
              />
              {(errors as any)?.[`q${num}`]?.message && (
                <p className='mt-1 font-satoshi text-xs text-red-400'>
                  {(errors as any)[`q${num}`].message as string}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className='pb-4'>
        <Typography as='h2' weight='bold' className='mb-2 text-2xl text-white'>
          Pilih Divisi Impian Anda
        </Typography>
        <Typography as='p' className='mb-6 text-sm font-medium text-white/70'>
          Pilih divisi yang paling sesuai dengan passion Anda (1-3 divisi) (
          {selectedDivisions.length}/3)
        </Typography>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {DIVISION_LIST.map((division, idx) => (
            <motion.button
              type='button'
              key={division.id}
              onClick={() => handleDivisionToggle(division.id)}
              className={`group relative flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all duration-300 hover:scale-105 focus:outline-none active:scale-95 ${(() => {
                const isSelected = selectedDivisions.includes(division.id);
                const isBOD = division.id === 'bod';
                if (isSelected) {
                  return isBOD
                    ? 'border-amber-400 bg-amber-400/10 ring-1 shadow-lg ring-amber-300/40'
                    : 'border-[#0040FF] bg-[#0040FF]/10 shadow-lg focus:ring-2 focus:ring-[#0040FF]/30';
                }
                return isBOD
                  ? 'border-amber-300/40 bg-white/5 hover:border-amber-400/60'
                  : 'border-white/15 bg-white/5 hover:border-[#0040FF]/50 focus:ring-2 focus:ring-[#0040FF]/30';
              })()}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className='flex w-full items-center justify-between'>
                <div className='flex min-w-0 items-center gap-4'>
                  <div className='min-w-0'>
                    <GradientText
                      className='inline-block rounded-none bg-transparent font-satoshi text-base leading-tight font-bold tracking-tight backdrop-blur-none'
                      colors={
                        division.id === 'bod'
                          ? ['#FDE68A', '#F59E0B', '#FDE68A']
                          : ['#66a3ff', '#0040FF', '#66a3ff']
                      }
                      animationSpeed={3}
                      showBorder={false}
                    >
                      <span className='font-satoshi text-base font-bold text-transparent'>
                        {division.name}
                      </span>
                    </GradientText>
                    <p className='mt-1 truncate font-satoshi text-xs text-white/60'>
                      {(division as any).description ?? ''}
                    </p>
                  </div>
                </div>

                {(() => {
                  const rank = selectedDivisions.indexOf(division.id);
                  if (rank >= 0) {
                    return (
                      <motion.div
                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${division.id === 'bod' ? 'bg-amber-500' : 'bg-[#0040FF]'}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        aria-hidden='true'
                      >
                        <span className='font-satoshi text-sm font-bold text-white'>
                          {rank + 1}
                        </span>
                      </motion.div>
                    );
                  }
                  return null;
                })()}
              </div>
            </motion.button>
          ))}
        </div>
        {(errors as any)?.selectedDivisions?.message && (
          <p className='mt-2 font-satoshi text-xs text-red-400'>
            {(errors as any).selectedDivisions.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
