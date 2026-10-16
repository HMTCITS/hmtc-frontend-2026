'use client';

import { motion } from 'motion/react';
import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import Textarea from '@/components/forms/Textarea';
import GradientText from '@/components/reactbits/GradientText';
import Typography from '@/components/Typography';
import { Label } from '@/components/ui/label';
import {
  DIVISION_QUESTION_PLACEHOLDER,
  DIVISION_QUESTIONS,
  DIVISION_QUESTIONS_TITLE,
} from '@/contents/magangForm';

export interface DivisionQuestionStepProps {
  divisionId: string;
  divisionName: string;
  onChange: (
    divisionId: string,
    next: { q1?: string; q2?: string; q3?: string; q4?: string; q5?: string },
  ) => void;
}

export default function DivisionQuestionStep({
  divisionId,
  divisionName,
  onChange,
}: DivisionQuestionStepProps) {
  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext<any>();
  React.useEffect(() => {}, [divisionId]);
  const answers =
    useWatch({ control, name: `divisionAnswers.${divisionId}` }) || {};

  const handleAnswerChange = (questionNum: 1 | 2 | 3 | 4 | 5, val: string) => {
    const next = { ...(answers || {}), [`q${questionNum}`]: val } as any;
    setValue(`divisionAnswers.${divisionId}`, next, {
      shouldDirty: true,
      shouldValidate: false,
    });
    onChange(divisionId, next);
  };

  return (
    <div className='space-y-8'>
      <div>
        <Typography as='h2' weight='bold' className='mb-2 text-2xl text-white'>
          {DIVISION_QUESTIONS_TITLE}
        </Typography>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          <GradientText
            className='mb-6 inline-block rounded-none bg-transparent font-satoshi text-xl font-bold tracking-tight backdrop-blur-none'
            colors={
              divisionId === 'bod'
                ? ['#FDE68A', '#F59E0B', '#FDE68A']
                : ['#66a3ff', '#0040FF', '#66a3ff']
            }
            animationSpeed={3}
            showBorder={false}
          >
            <span className='font-satoshi text-xl font-bold text-transparent'>
              {divisionName}
            </span>
          </GradientText>
        </motion.div>

        <div className='space-y-6 pb-4'>
          {(() => {
            const qs = (
              DIVISION_QUESTIONS as Record<string, readonly string[]>
            )[divisionId];
            const labels: string[] =
              qs && qs.length > 0
                ? ([...qs].slice(0, 5) as string[])
                : Array.from(
                    { length: 5 },
                    (_, i) => `Pertanyaan ${i + 1}: Tunjukkan Keahlian Anda`,
                  );

            return labels.map((qText, idx) => {
              const num = (idx + 1) as 1 | 2 | 3 | 4 | 5;
              const isBOD = divisionId === 'bod';
              const _fieldError = (errors as any)?.divisionAnswers?.[
                divisionId
              ]?.[`q${num}`]?.message as string | undefined;
              return (
                <motion.div
                  key={num}
                  className='group'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx + 1) * 0.08 }}
                >
                  <Label className='mb-2 block text-justify font-satoshi font-medium text-white/90'>
                    {qText}
                  </Label>
                  <Textarea
                    id={`divisionAnswers.${divisionId}.q${num}`}
                    value={(answers as any)[`q${num}`] || ''}
                    skipRegister
                    onValueChange={(v) => handleAnswerChange(num, v)}
                    placeholder={DIVISION_QUESTION_PLACEHOLDER}
                    rows={4}
                    textareaClassName={`w-full resize-none ${
                      isBOD
                        ? 'group-hover:border-amber-400/60 focus:border-amber-400 focus:ring-amber-300/30'
                        : 'group-hover:border-[#0040FF]/50 focus:border-[#0040FF] focus:ring-[#0040FF]/30'
                    }`}
                  />
                </motion.div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
