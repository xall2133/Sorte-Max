import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface BuyCreditsBannerProps {
  className?: string;
  onBuy: () => void;
}

export const BuyCreditsBanner: React.FC<BuyCreditsBannerProps> = ({ className = "", onBuy }) => {
  return (
    <div className={`w-full bg-gradient-to-r from-green-900/40 to-slate-900 border border-green-500/30 rounded-xl p-4 flex items-center justify-between ${className}`}>
        <div className="flex flex-col">
            <span className="text-green-400 font-bold text-sm uppercase tracking-wide flex items-center gap-1">
                <ShoppingCart size={14} /> Loja de Créditos
            </span>
            <span className="text-white text-xs mt-1">Acabaram as chances? Recarregue agora.</span>
        </div>
        <button 
            onClick={onBuy}
            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-lg shadow-green-900/50 transition-colors"
        >
            COMPRAR
        </button>
    </div>
  );
};