
import React from 'react';
import { ArrowLeft, Coins, Check, Crown, Zap, ShieldCheck } from 'lucide-react';
import { AppScreen, PaymentPlan } from '../types';

interface StoreScreenProps {
  setScreen: (screen: AppScreen) => void;
  onSelectPlan: (plan: PaymentPlan) => void;
}

const PLANS: PaymentPlan[] = [
    { id: 'mini', title: 'Pacote Mini', credits: 20, price: 9.90 },
    { id: 'medium', title: 'Pacote Médio', credits: 60, price: 19.90, popular: true },
    { id: 'turbo', title: 'Pacote Turbo', credits: 150, price: 39.90 },
];

export const StoreScreen: React.FC<StoreScreenProps> = ({ setScreen, onSelectPlan }) => {
  
  // Agora chama o modal de pagamento do app em vez do WhatsApp
  const handleBuy = (plan: PaymentPlan) => {
    onSelectPlan(plan);
  };

  const handleBuyPremium = () => {
    onSelectPlan({ id: 'premium', title: 'Plano Premium Ilimitado', credits: -1, price: 49.90 });
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 min-h-screen bg-slate-950 pb-20">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-slate-900 sticky top-0 z-10">
        <button onClick={() => setScreen(AppScreen.HOME)} className="text-slate-400 hover:text-white">
          <ArrowLeft />
        </button>
        <span className="font-bold text-lg brand-font text-white flex items-center gap-2">
            <Coins className="text-yellow-500" /> Loja de Créditos
        </span>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        
        {/* Premium Banner */}
        <div 
            onClick={handleBuyPremium}
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-2xl p-6 shadow-xl relative overflow-hidden cursor-pointer transform transition hover:scale-[1.02]"
        >
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <Crown size={80} className="text-white" />
            </div>
            <div className="relative z-10">
                <div className="bg-black/20 text-black text-[10px] font-bold px-2 py-0.5 rounded inline-block mb-2 uppercase">Melhor Custo-Benefício</div>
                <h3 className="text-2xl font-bold text-white brand-font">Seja Premium</h3>
                <p className="text-yellow-100 text-sm mb-4">Geração Ilimitada e IA Liberada.</p>
                <div className="flex items-end gap-1 mb-2">
                    <span className="text-3xl font-bold text-white">R$ 49,90</span>
                    <span className="text-xs text-yellow-100 mb-1">/mês</span>
                </div>
                <button className="bg-white text-yellow-700 text-sm font-bold py-2 px-4 rounded-lg w-full shadow-sm flex items-center justify-center gap-2">
                    <Crown size={16} /> ASSINAR AGORA
                </button>
            </div>
        </div>

        <div className="text-center text-slate-400 text-xs uppercase font-bold tracking-wider pt-2">
            Ou compre créditos avulsos
        </div>

        {/* Credit Plans */}
        <div className="grid gap-4">
            {PLANS.map(plan => (
                <div 
                    key={plan.id}
                    onClick={() => handleBuy(plan)}
                    className={`bg-slate-900 border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors relative overflow-hidden ${plan.popular ? 'border-green-500 shadow-lg shadow-green-900/20' : 'border-slate-700'}`}
                >
                    {plan.popular && (
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">MAIS VENDIDO</div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${plan.popular ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                            <Zap size={24} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold">{plan.title}</h4>
                            <p className="text-slate-400 text-sm">{plan.credits} Créditos</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <span className="block text-lg font-bold text-white">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                         <button className="text-[10px] text-green-400 hover:underline flex items-center justify-end gap-1">
                            Comprar <ShieldCheck size={10} />
                         </button>
                    </div>
                </div>
            ))}
        </div>

        <div className="text-center text-[10px] text-slate-500 px-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-slate-400 mb-1">Pagamento Automático</h4>
            <p>1. Escolha o pacote.</p>
            <p>2. Pague via PIX no checkout seguro.</p>
            <p>3. Receba os créditos instantaneamente.</p>
        </div>

      </div>
    </div>
  );
};
