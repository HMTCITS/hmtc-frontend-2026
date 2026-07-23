'use client';

import { useEffect, useRef } from 'react';

export default function RibbonWaveBackground({ className = '', ...props }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const params = {
      waves: 6,
      amplitude: 80,
      frequency: 0.003,
      laneGap: 80,
    };

    let phase = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(249, 250, 251, 1.0)';
      ctx.fillRect(0, 0, width, height);

      const vpX = width * 0;
      const vpY = height * 0.7;
      const startX = width * 0.9;
      const startY = width * 0.1;

      const colors = [
        'hsla(200, 100%, 70%, 0.8)',
        'hsla(210, 100%, 70%, 0.8)',
        'hsla(220, 100%, 70%, 0.8)',
        'hsla(400, 100%, 70%, 0.8)',
        'hsla(405, 100%, 70%, 0.8)',
        'hsla(410, 100%, 70%, 0.8)',
      ];

      for (let i = 0; i < params.waves; i++) {
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.strokeStyle = colors[i % colors.length];

        const totalHeight = params.waves * params.laneGap;
        const baseLaneOffset = i * params.laneGap - totalHeight / 2;

        const steps = 150;
        const startStep = -150;
        for (let s = startStep; s <= steps; s++) {
          const t = s / steps;
          const currX = startX + (vpX - startX) * t;
          const currY = startY + (vpY - startY) * t;
          const scale = 1 - t * 1.0;
          const waveDist = s * 15;
          const waveOffset = Math.sin(waveDist * params.frequency + phase);
          const offsetPerp =
            (baseLaneOffset + waveOffset * params.amplitude) * scale;

          const x = currX + offsetPerp * 0.707;
          const y = currY + offsetPerp * 0.707;

          if (s === startStep) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      phase += 0.005;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className={`${className}`.trim()} {...props} />
  );
}
