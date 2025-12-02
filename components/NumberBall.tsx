import React from 'react';

interface NumberBallProps {
  num: number;
  delay?: number;
}

export const NumberBall: React.FC<NumberBallProps> = ({ num, delay = 0 }) => {
  return (
    <div 
      className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-lg transform transition-all duration-500 hover:scale-110 animate-in fade-in zoom-in"
      style={{
        background: 'radial-gradient(circle at 30% 30%, #ffffff, #e2e8f0, #94a3b8)',
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/80 to-transparent opacity-50"></div>
      <span className="text-slate-900 font-bold text-xl sm:text-2xl font-mono z-10">
        {num.toString().padStart(2, '0')}
      </span>
    </div>
  );
};