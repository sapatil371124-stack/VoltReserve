import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export const Opening3DIntro = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter'); // 'enter', 'pulse', 'exit', 'done'

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (onFinish) onFinish();
      return;
    }

    // Sequence timing: 500ms enter -> 600ms pulse/latch -> 400ms smooth curtain exit
    const t1 = setTimeout(() => setPhase('pulse'), 450);
    const t2 = setTimeout(() => setPhase('exit'), 1050);
    const t3 = setTimeout(() => {
      setPhase('done');
      if (onFinish) onFinish();
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setPhase('done');
    if (onFinish) onFinish();
  };

  if (phase === 'done') return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#F5F0E8] transition-opacity duration-500 cursor-pointer select-none ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ perspective: '1200px' }}
      title="Click anywhere to skip intro"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#D59A6A]/15 via-[#9A5B35]/20 to-[#844A29]/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* 3D Floating Stage */}
      <div
        className="relative z-10 flex flex-col items-center text-center p-8 transition-transform duration-700 ease-out"
        style={{
          transform: phase === 'enter'
            ? 'rotateX(15deg) translateZ(-50px) scale(0.92)'
            : phase === 'pulse'
            ? 'rotateX(0deg) translateZ(0px) scale(1)'
            : 'rotateX(-10deg) translateZ(50px) scale(1.05)'
        }}
      >
        {/* Emblem with 3D metallic glow */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-[#EFE7DC] border-2 border-[#E8DFD5] shadow-warm-xl flex items-center justify-center relative overflow-hidden transition-all duration-500">
            {/* Shimmer beam */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#9A5B35]/25 to-transparent -translate-x-full transition-transform duration-1000 ease-in-out"
              style={{
                transform: phase === 'pulse' || phase === 'exit' ? 'translateX(100%)' : 'translateX(-100%)'
              }}
            />
            <Zap className={`w-10 h-10 transition-transform duration-500 ${phase === 'pulse' ? 'text-[#9A5B35] scale-110' : 'text-[#844A29] scale-100'}`} />
          </div>

          {/* Electric pulse ring */}
          {phase === 'pulse' && (
            <div className="absolute -inset-2 rounded-3xl border-2 border-[#9A5B35]/40 animate-ping pointer-events-none" />
          )}
        </div>

        {/* Brand Name */}
        <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-[#9A5B35] mb-1">
          VoltReserve
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D211A] tracking-tight">
          Next-Gen EV Reservation
        </h2>
        <p className="text-xs text-[#7D6B5E] mt-1.5 font-medium max-w-xs">
          Initializing live dispenser network...
        </p>

        {/* Subtle skip prompt */}
        <span className="mt-6 text-[10px] text-[#A69588] tracking-wider uppercase font-semibold">
          Click anywhere to skip
        </span>
      </div>
    </div>
  );
};
