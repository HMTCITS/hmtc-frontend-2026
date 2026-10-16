import React from 'react';

import Typography from '@/components/Typography';

interface TextComponentProps {
  text1: string;
  text2: string | string[];
}

const VisiMisi: React.FC<TextComponentProps> = ({ text1, text2 }) => {
  return (
    <div className='mx-auto flex w-full flex-col items-start gap-4 md:gap-5'>
      <Typography
        as='h2'
        variant='i1'
        className='font-adelphe text-5xl leading-[110%] font-bold text-white md:text-5xl md:leading-14 lg:mb-4'
      >
        {text1}
      </Typography>
      {typeof text2 === 'string' ? (
        <Typography
          as='p'
          variant='s2'
          className='w-full font-satoshi leading-normal font-normal text-white opacity-68 md:text-lg md:leading-[140%]'
        >
          {text2}
        </Typography>
      ) : (
        <ol className='space-y-3 md:space-y-5'>
          {text2.map((text, index) => (
            <Typography
              as='li'
              variant='s2'
              key={index}
              className='w-full font-satoshi leading-normal font-normal text-white opacity-68 md:text-lg md:leading-[140%]'
            >
              {text}
            </Typography>
          ))}
        </ol>
      )}
    </div>
  );
};

export default VisiMisi;
