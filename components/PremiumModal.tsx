
import React from 'react';
import { X, Lock, CheckCircle, Zap, Bot, Infinity, Crown } from 'lucide-react';
import { PaymentPlan } from '../types';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToCheckout: (plan: PaymentPlan) => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onGoToCheckout }) => {
  if (!isOpen) return null;

  const handleSubscribe = () => {
    // Redireciona para o fluxo de checkout interno
    onGoToCheckout({ 
        id: 'premium', 
        title: 'Plano Premium Ilimitado', 
        credits: -1, 
        price: 49.90 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-yellow-500/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-20"></div>
          <Zap className="w-12 h-12 text-white mx-auto mb-2 drop-shadow-lg" />
          <h2 className="text-2xl font-bold text-white drop-shadow-md brand-font uppercase tracking-wide">
            Seja Premium
          </h2>
          <p className="text-yellow-50 font-medium">Desbloqueie sorte ilimitada</p>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
             <FeatureItem text="Gerações Ilimitadas (Fim dos créditos)" />
             <FeatureItem text="Oráculo IA: Consultas Ilimitadas" icon={<Bot size={16} />} />
             <FeatureItem text="Análise IA Mística Completa" />
             <FeatureItem text="Estratégias da Mega da Virada" />
             <FeatureItem text="Prioridade no Suporte" />
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400 text-sm mb-1">Assinatura Mensal (30 Dias)</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-yellow-400">R$ 49,90</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Cancele quando quiser</p>
          </div>

          <button
            onClick={handleSubscribe}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-900/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            <Lock size={20} className="group-hover:hidden" />
            <Infinity size={20} className="hidden group-hover:block animate-pulse" />
            ASSINAR AGORA
          </button>
          
          <p className="text-xs text-center text-slate-500">
            Liberação automática após confirmação do PIX.
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text, icon }: { text: string, icon?: React.ReactNode }) => (
  <div className="flex items-center gap-3 text-slate-200">
    <div className="text-green-500 w-5 h-5 flex-shrink-0 flex items-center justify-center">
        {icon || <CheckCircle size={20} />}
    </div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);
