'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import StarRating from '@/components/forms/StarRating';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DIVISIONS,
  ENDING_NOTE,
  EVALUASI_BIRO,
  EVALUASI_GENERAL,
  INTRO,
  UMPAN_BALIK,
} from '@/contents/evaluasiCMI';
import { useSubmitEvaluasiCMI } from '@/hooks/api/useSubmitEvaluasiCMI';
import { evaluasiCMISchema } from '@/lib/validation/evaluasiCMI.schema';

/**
 * Multipart form step component for Evaluasi CMI
 * Steps:
 * 1. intro (nama, division)
 * 2. evaluasi general bagian 1
 * 3. evaluasi general bagian 2
 * 4. pilih biro yang ingin di eval (bisa di skip/opsional)
 * 5-N. evaluasi biro terpilih (dynamic based on selection di step 4)
 * N+1. umpan balik
 * N+2. ending note
 */

// type FormData = z.infer<typeof evaluasiCMISchema>;

// LocalStorage keys
const STORAGE_KEY = 'evaluasi-cmi-form-data';
const STORAGE_STEP_KEY = 'evaluasi-cmi-current-step';
const STORAGE_BIRO_KEY = 'evaluasi-cmi-selected-biro';

/**
 * Helper function to format question text:
 * Text before ":" will be font-medium, text after ":" will be font-normal
 */
const formatQuestionText = (question: string) => {
  const colonIndex = question.indexOf(':');

  if (colonIndex === -1) {
    // No colon found, return as is
    return <span className='font-satoshi font-normal'>{question}</span>;
  }

  const label = question.substring(0, colonIndex);
  const description = question.substring(colonIndex);

  return (
    <span className='font-satoshi'>
      <span className='font-bold'>{label}</span>
      <span className='font-normal'>{description}</span>
    </span>
  );
};

export default function EvaluasiCMIFormStep() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBiroList, setSelectedBiroList] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // API mutation hook
  const submitMutation = useSubmitEvaluasiCMI({
    onSuccess: (data) => {
      toast.success(data.message || 'Evaluasi berhasil dikirim!');

      // Clear localStorage after successful submission
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_STEP_KEY);
      localStorage.removeItem(STORAGE_BIRO_KEY);

      // Move to ending page
      setCurrentStep(currentStep + 1);
      setValidationErrors({});
    },
    onError: (error) => {
      toast.error(
        error.message || 'Gagal mengirim evaluasi. Silakan coba lagi.',
      );
    },
  });

  const form = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      intro: {
        nama: '',
        division: '',
      },
      evaluasiGeneral: {
        bagian1: {},
        bagian2: {},
      },
      selectedBiro: [],
      evaluasiBiro: {
        cd: undefined,
        sms: undefined,
        medpro: undefined,
        itdev: undefined,
      },
      umpanBalik: {},
    },
  });

  const {
    register,
    // handleSubmit,
    setValue,
    watch,
    // formState: { errors },
  } = form;

  const formData = watch();

  // Restore form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem(STORAGE_KEY);
    const savedStep = localStorage.getItem(STORAGE_STEP_KEY);
    const savedBiro = localStorage.getItem(STORAGE_BIRO_KEY);

    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        // Restore form values
        Object.keys(parsedData).forEach((key) => {
          setValue(key as any, parsedData[key]);
        });
      } catch {
        toast.error('Gagal memulihkan data form');
      }
    }

    if (savedStep) {
      try {
        const step = parseInt(savedStep, 10);
        if (!isNaN(step)) {
          setCurrentStep(step);
        }
      } catch {
        toast.error('Gagal memulihkan posisi step');
      }
    }

    if (savedBiro) {
      try {
        const biroList = JSON.parse(savedBiro);
        if (Array.isArray(biroList)) {
          setSelectedBiroList(biroList);
        }
      } catch {
        toast.error('Gagal memulihkan pilihan biro');
      }
    }
  }, [setValue]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_STEP_KEY, currentStep.toString());
  }, [currentStep]);

  // Save selected biro list to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_BIRO_KEY, JSON.stringify(selectedBiroList));
  }, [selectedBiroList]);

  // Map biro names to IDs
  const biroNameMap: Record<string, string> = {
    'Creative Design (CD)': 'cd',
    'Social Media Strategist (SMS)': 'sms',
    'Media Production (MedPro)': 'medpro',
    'IT Development (ITDev)': 'itdev',
  };

  // Generate dynamic steps
  const getSteps = () => {
    const steps = [
      { id: 'intro', title: 'Intro' },
      { id: 'bagian1', title: 'Bagian I' },
      { id: 'bagian2', title: 'Bagian II' },
      { id: 'biro-selection', title: 'Pilih Biro' },
    ];

    // Add selected biro steps
    selectedBiroList.forEach((biroName) => {
      const biroId = biroNameMap[biroName];
      const biroSection = EVALUASI_BIRO.find((b) => b.id === biroId);
      if (biroSection) {
        steps.push({ id: biroId, title: biroSection.title });
      }
    });

    steps.push({ id: 'umpan-balik', title: 'Umpan Balik' });
    steps.push({ id: 'ending', title: 'Selesai' });

    return steps;
  };

  const steps = getSteps();
  const totalSteps = steps.length;

  // Validate current step before moving to next
  const validateCurrentStep = (): boolean => {
    setValidationErrors({});
    const stepId = steps[currentStep]?.id;

    // Step 1: Intro - Required
    if (stepId === 'intro') {
      const errors: Record<string, string> = {};
      if (!formData.intro?.nama || formData.intro.nama.trim() === '') {
        errors.nama = 'Nama wajib diisi';
      }
      if (!formData.intro?.division || formData.intro.division === '') {
        errors.division = 'Departemen wajib dipilih';
      }
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return false;
      }
    }

    // Step 2-3: Evaluasi General - Required (all star ratings must be filled)
    if (stepId === 'bagian1' || stepId === 'bagian2') {
      const section = EVALUASI_GENERAL.find((s) => s.id === stepId);
      if (section) {
        const errors: Record<string, string> = {};
        section.questions.forEach((_, index) => {
          const rating =
            formData.evaluasiGeneral?.[stepId]?.[`question_${index}`];
          if (!rating || rating === 0) {
            errors[`question_${index}`] = 'Rating wajib diisi';
          }
        });
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return false;
        }
      }
    }

    // Step 4: Biro Selection - Optional (can skip)
    // No validation needed

    // Step 5-N: Evaluasi Biro - Required if selected
    const biroSection = EVALUASI_BIRO.find((b) => b.id === stepId);
    if (biroSection && Array.isArray(biroSection.questions)) {
      const errors: Record<string, string> = {};
      biroSection.questions.forEach((_, index) => {
        const rating = formData.evaluasiBiro?.[stepId]?.[`question_${index}`];
        if (!rating || rating === 0) {
          errors[`question_${index}`] = 'Rating wajib diisi';
        }
      });
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return false;
      }
    }

    // Step N+1: Umpan Balik - Required (except last question which is optional)
    if (stepId === 'umpan-balik') {
      const errors: Record<string, string> = {};
      UMPAN_BALIK.questions.forEach((_, index) => {
        const isLastQuestion = index === UMPAN_BALIK.questions.length - 1;
        if (!isLastQuestion) {
          const answer = formData.umpanBalik?.[`question_${index}`];
          if (!answer || answer.trim() === '') {
            errors[`question_${index}`] = 'Pertanyaan ini wajib diisi';
          }
        }
      });
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    // Validate current step before moving
    if (!validateCurrentStep()) {
      return; // Stop if validation fails
    }

    // If this is the last step before ending (umpan-balik), do final submission
    if (currentStep === totalSteps - 2) {
      const data = formData;
      try {
        // Update selectedBiro based on selected biro list
        data.selectedBiro = selectedBiroList;

        // Validate entire form with Zod schema
        evaluasiCMISchema.parse(data);

        // Submit to API
        submitMutation.mutate(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string> = {};
          error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            errors[path] = issue.message;
          });
          setValidationErrors(errors);
          toast.error('Validasi form gagal. Periksa kembali data Anda.');
        }
      }
    } else {
      // Normal next step
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
        setValidationErrors({}); // Clear errors when moving to next step
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({}); // Clear errors when going back
    }
  };

  const handleBiroToggle = (biroName: string) => {
    setSelectedBiroList((prev) => {
      if (prev.includes(biroName)) {
        return prev.filter((b) => b !== biroName);
      } else {
        return [...prev, biroName];
      }
    });
  };

  // Render step content
  const renderStepContent = () => {
    const stepId = steps[currentStep]?.id;

    // Step 1: Intro
    if (stepId === 'intro') {
      return (
        <div className='space-y-6'>
          <div className='space-y-4'>
            <Typography
              as='h1'
              variant='j1'
              font='adelphe'
              className='text-center font-semibold text-white'
            >
              Formulir Evaluasi Kinerja Departemen CMI
            </Typography>
            <Typography
              as='p'
              variant='s2'
              className='text-center text-[#B0B0B0]'
            >
              {INTRO.title}
            </Typography>
          </div>

          <div className='space-y-4'>
            {/* Nama */}
            <div className='space-y-2'>
              <Label htmlFor='nama' className='font-satoshi text-white'>
                Nama <span className='text-red-400'>*</span>
              </Label>
              <Input
                id='nama'
                placeholder='Masukkan nama anda'
                className='rounded-full border-gray-600 bg-transparent px-6 font-satoshi text-white placeholder:font-satoshi placeholder:text-gray-500'
                {...register('intro.nama')}
              />
              {validationErrors.nama && (
                <p className='font-satoshi text-sm text-red-400'>
                  {validationErrors.nama}
                </p>
              )}
            </div>

            {/* Departemen */}
            <div className='space-y-2'>
              <Label htmlFor='division' className='font-satoshi text-white'>
                Departemen <span className='text-red-400'>*</span>
              </Label>
              <Select
                value={formData.intro?.division}
                onValueChange={(value) =>
                  setValue('intro.division', value as any)
                }
              >
                <SelectTrigger className='rounded-full border-gray-600 bg-transparent px-6 font-satoshi text-white'>
                  <SelectValue placeholder='Pilih departemen anda' />
                </SelectTrigger>
                <SelectContent className='rounded-2xl font-satoshi'>
                  {DIVISIONS.map((div) => (
                    <SelectItem key={div.id} value={div.id} className='px-6'>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.division && (
                <p className='text-sm text-red-400'>
                  {validationErrors.division}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Step 2-3: Evaluasi General
    if (stepId === 'bagian1' || stepId === 'bagian2') {
      const section = EVALUASI_GENERAL.find((s) => s.id === stepId);
      if (!section) return null;

      return (
        <div className='space-y-6'>
          <div className='space-y-4'>
            <Typography
              as='h1'
              variant='j1'
              font='adelphe'
              className='text-center font-semibold text-white'
            >
              Formulir Evaluasi Kinerja Departemen CMI
            </Typography>
            <Typography
              variant='s1'
              className='text-center font-adelphe font-bold text-[#F9A602]'
            >
              {section.title}
            </Typography>
          </div>

          <div className='space-y-8'>
            {section.questions.map((question, index) => (
              <div key={index} className='flex flex-col gap-6'>
                <Label className='text-white'>
                  {formatQuestionText(question)}
                </Label>
                <div className='flex items-center justify-between'>
                  <span className='font-satoshi text-sm text-gray-400'>
                    Sangat Kurang
                  </span>
                  <StarRating
                    totalStars={5}
                    initialRating={
                      formData.evaluasiGeneral?.[stepId]?.[
                        `question_${index}`
                      ] || 0
                    }
                    onRatingChange={(rating) =>
                      setValue(
                        `evaluasiGeneral.${stepId}.question_${index}` as any,
                        rating,
                      )
                    }
                  />
                  <span className='font-satoshi text-sm text-gray-400'>
                    Sangat Baik
                  </span>
                </div>
                {validationErrors[`question_${index}`] && (
                  <p className='text-sm text-red-400'>
                    {validationErrors[`question_${index}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Step 4: Biro Selection
    if (stepId === 'biro-selection') {
      const biroIntro = EVALUASI_BIRO.find((item) => item.id === 'intro');
      if (!biroIntro) return null;

      return (
        <div className='space-y-6'>
          <div className='space-y-4'>
            <Typography
              as='h1'
              variant='j1'
              font='adelphe'
              className='text-center font-semibold text-white'
            >
              Formulir Evaluasi Kinerja Departemen CMI
            </Typography>
            <Typography
              variant='s1'
              className='text-center font-adelphe font-bold text-[#F9A602]'
            >
              {biroIntro.title}
            </Typography>
            <Typography
              as='p'
              variant='s2'
              className='text-center text-[#B0B0B0]'
            >
              {typeof biroIntro.questions === 'string'
                ? biroIntro.questions
                : ''}
            </Typography>
          </div>

          <div className='space-y-3'>
            {biroIntro.choices?.map((biroName) => (
              <div
                key={biroName}
                className='flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-600 p-4 font-satoshi transition-colors hover:bg-gray-800/50'
                onClick={() => handleBiroToggle(biroName)}
              >
                <input
                  type='checkbox'
                  checked={selectedBiroList.includes(biroName)}
                  onChange={() => handleBiroToggle(biroName)}
                  className='h-4 w-4 rounded border-gray-600 bg-transparent'
                />
                <Label className='flex-1 cursor-pointer text-white'>
                  {biroName}
                </Label>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Step 5-N: Evaluasi Biro (dynamic)
    const biroSection = EVALUASI_BIRO.find((b) => b.id === stepId);
    if (biroSection && Array.isArray(biroSection.questions)) {
      return (
        <div className='space-y-6'>
          <div className='space-y-4'>
            <Typography
              as='h1'
              variant='j1'
              font='adelphe'
              className='text-center font-semibold text-white'
            >
              Formulir Evaluasi Kinerja Departemen CMI
            </Typography>
            <Typography
              variant='s1'
              className='text-center font-adelphe font-bold text-[#F9A602]'
            >
              {biroSection.title}
            </Typography>
          </div>

          <div className='space-y-8'>
            {biroSection.questions.map((question, index) => (
              <div key={index} className='flex flex-col gap-6'>
                <Label className='text-white'>
                  {formatQuestionText(question)}
                </Label>
                <div className='flex items-center justify-between'>
                  <span className='font-satoshi text-sm text-gray-400'>
                    Sangat Kurang
                  </span>
                  <StarRating
                    totalStars={5}
                    initialRating={
                      formData.evaluasiBiro?.[stepId]?.[`question_${index}`] ||
                      0
                    }
                    onRatingChange={(rating) =>
                      setValue(
                        `evaluasiBiro.${stepId}.question_${index}` as any,
                        rating,
                      )
                    }
                  />
                  <span className='font-satoshi text-sm text-gray-400'>
                    Sangat Baik
                  </span>
                </div>
                {validationErrors[`question_${index}`] && (
                  <p className='text-sm text-red-400'>
                    {validationErrors[`question_${index}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Step N+1: Umpan Balik
    if (stepId === 'umpan-balik') {
      return (
        <div className='space-y-6'>
          <div className='space-y-4'>
            <Typography
              as='h1'
              variant='j1'
              font='adelphe'
              className='text-center font-semibold text-white'
            >
              Formulir Evaluasi Kinerja Departemen CMI
            </Typography>
            <Typography
              variant='s1'
              className='text-center font-adelphe font-bold text-[#F9A602]'
            >
              {UMPAN_BALIK.title}
            </Typography>
          </div>

          <div className='space-y-8'>
            {UMPAN_BALIK.questions.map((question, index) => {
              const isOptional = index === UMPAN_BALIK.questions.length - 1;
              return (
                <div key={index} className='space-y-2'>
                  <Label className='text-white'>
                    {formatQuestionText(question)}
                    {isOptional && (
                      <span className='ml-1 text-gray-400'>(Opsional)</span>
                    )}
                  </Label>
                  <Textarea
                    placeholder='Tulis jawaban Anda di sini...'
                    className='min-h-[100px] border-gray-600 bg-transparent font-satoshi text-white placeholder:font-satoshi placeholder:text-gray-500'
                    {...register(`umpanBalik.question_${index}`)}
                  />
                  {validationErrors[`question_${index}`] && (
                    <p className='font-satoshi text-sm font-medium text-red-400'>
                      {validationErrors[`question_${index}`]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Step N+2: Ending Note
    if (stepId === 'ending') {
      return (
        <div className='space-y-6 text-center'>
          <div className='flex flex-col items-center justify-center space-y-4'>
            <Typography
              as='h1'
              variant='j1'
              font='adelphe'
              className='text-center font-semibold text-white'
            >
              Formulir Evaluasi Kinerja Departemen CMI
            </Typography>
            <Typography
              variant='s0'
              className='text-center font-adelphe font-bold text-[#F9A602]'
            >
              {ENDING_NOTE.title}
            </Typography>
            <p className='font-satoshi text-lg text-gray-300'>
              {typeof ENDING_NOTE.questions === 'string'
                ? ENDING_NOTE.questions
                : ''}
            </p>
            <NextImage
              src='/illustrations/finished.png'
              alt='Form Completed'
              width={400}
              height={400}
            />
            <Button
              asChild
              variant='default'
              className='w-full rounded-lg bg-blue-600 px-8 py-3 font-satoshi text-white hover:bg-blue-700'
            >
              <Link href='/'>Back to Home Page</Link>
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-black p-4'>
      {/* Gradient Background from Figma */}
      <div className='pointer-events-none absolute inset-0'>
        <div
          className='absolute'
          style={{
            width: '1677.31px',
            height: '999.37px',
            left: '24.79px',
            top: '-214.77px',
            transform: 'rotate(-7deg)',
            transformOrigin: 'top left',
            background: '#012236',
            boxShadow: '455.11px 455.11px 455.11px rgba(0, 0, 0, 0.3)',
            borderRadius: '9999px',
            filter: 'blur(227.56px)',
          }}
        />
        <div
          className='absolute'
          style={{
            width: '816.10px',
            height: '1153.19px',
            left: '-225.06px',
            top: '-448.58px',
            transform: 'rotate(12deg)',
            transformOrigin: 'top left',
            background: '#011724',
            boxShadow: '455.11px 455.11px 455.11px rgba(0, 0, 0, 0.3)',
            borderRadius: '9999px',
            filter: 'blur(227.56px)',
          }}
        />
        <div
          className='absolute'
          style={{
            width: '740.69px',
            height: '146.77px',
            left: '-145.63px',
            top: '1009.68px',
            transform: 'rotate(-31deg)',
            transformOrigin: 'top left',
            background: '#003556',
            boxShadow: '341.33px 341.33px 341.33px rgba(0, 0, 0, 0.3)',
            borderRadius: '9999px',
            filter: 'blur(170.67px)',
          }}
        />
        <div
          className='absolute'
          style={{
            width: '342.41px',
            height: '675.84px',
            left: '697.45px',
            top: '622.38px',
            transform: 'rotate(49deg)',
            transformOrigin: 'top left',
            background: '#012236',
            boxShadow: '227.56px 227.56px 227.56px rgba(0, 0, 0, 0.3)',
            borderRadius: '9999px',
            filter: 'blur(113.78px)',
          }}
        />
        <div
          className='absolute'
          style={{
            width: '771.01px',
            height: '602.94px',
            left: '459.55px',
            top: '599.55px',
            transform: 'rotate(-15deg)',
            transformOrigin: 'top left',
            background: '#011724',
            boxShadow: '341.33px 341.33px 341.33px rgba(0, 0, 0, 0.3)',
            borderRadius: '9999px',
            filter: 'blur(170.67px)',
          }}
        />
        <div
          className='absolute'
          style={{
            width: '801px',
            height: '801px',
            left: '1161.67px',
            top: '373.23px',
            background: '#000D15',
            boxShadow: '455.11px 455.11px 455.11px rgba(0, 0, 0, 0.3)',
            borderRadius: '9999px',
            filter: 'blur(227.56px)',
          }}
        />
      </div>

      {/* Form Container */}
      <div className='relative z-10 w-full max-w-2xl'>
        <div className='rounded-lg border border-gray-700 bg-gradient-to-br from-gray-900/60 to-gray-800/40 px-12 py-8 backdrop-blur-sm'>
          {/* Form Content */}
          <div>
            {/* Validation Error Summary */}
            {Object.keys(validationErrors).length > 0 && (
              <div className='mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4'>
                <p className='font-satoshi text-sm font-medium text-red-400'>
                  Mohon lengkapi semua field yang wajib diisi
                </p>
              </div>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            {steps[currentStep]?.id !== 'ending' && (
              <div className='mt-8 flex gap-3'>
                {currentStep > 0 && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleBack}
                    disabled={submitMutation.isPending}
                    className='flex-1 border-gray-600 bg-transparent font-satoshi text-white hover:bg-gray-800'
                  >
                    Back
                  </Button>
                )}
                {currentStep < totalSteps - 1 &&
                steps[currentStep]?.id !== 'ending' ? (
                  <Button
                    type='button'
                    onClick={handleNext}
                    disabled={submitMutation.isPending}
                    className='flex-1 bg-blue-600 font-satoshi text-white hover:bg-blue-700 disabled:opacity-50'
                  >
                    {submitMutation.isPending
                      ? 'Mengirim...'
                      : currentStep === totalSteps - 2
                        ? 'Submit'
                        : 'Next'}
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
