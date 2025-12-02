import React from 'react';

interface AdPlaceholderProps {
    label?: string;
    className?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ label = "Publicidade", className = "" }) => {
  return (
    <div className={`w-full bg-slate-800/50 border border-slate-700/50 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-slate-600 ${className}`}>
        <span className="text-xs font-bold tracking-widest uppercase mb-1">{label}</span>
        <div className="text-[10px] text-center max-w-[200px]">
            Espaço reservado para banners de parceiros ou Google AdMob.
        </div>
    </div>
  );
};
