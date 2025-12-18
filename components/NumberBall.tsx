
import React from 'react';

interface NumberBallProps {
  num: number;
  delay?: number;
}

export const NumberBall: React.FC<NumberBallProps> = ({ num, delay = 0 }) => {
  return (
    <div 
      className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] transform transition-all duration-500 hover:scale-110 animate-in fade-in zoom-in border border-white/20"
      style={{
        background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-60"></div>
      <div className="absolute top-1 left-3 w-4 h-2 bg-white/40 rounded-full rotate-[-20deg] blur-[1px]"></div>
      <span className="text-slate-900 font-black text-xl sm:text-2xl font-mono z-10 drop-shadow-sm">
        {num.toString().padStart(2, '0')}
      </span>
    </div>
  );
};
