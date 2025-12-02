import React from 'react';
import { ArrowLeft, Target, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { AppScreen } from '../types';

interface LandingPageProps {
  setScreen: (screen: AppScreen) => void;
  openWhatsApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setScreen, openWhatsApp }) => {
  return (
    <div className="animate-in slide-in-from-right duration-500 bg-slate-950 min-h-screen pb-10">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-slate-900 sticky top-0 z-10">
        <button onClick={() => setScreen(AppScreen.HOME)} className="text-slate-400 hover:text-white">
          <ArrowLeft />
        </button>
        <span className="font-bold text-lg brand-font">Sobre o SorteMax</span>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
           <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-4">
              <Target className="text-slate-900 w-8 h-8" />
           </div>
           <h2 className="text-3xl font-bold text-white brand-font">Pare de jogar no escuro.</h2>
           <p className="text-slate-300 leading-relaxed">
             Use matemática, probabilidade e análise real para montar jogos melhores na Mega-Sena e Mega da Virada.
           </p>
        </div>

        {/* How it works */}
        <div className="space-y-4">
          <h3 className="text-yellow-500 font-bold uppercase text-sm tracking-wider">Como funciona?</h3>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
            <p className="text-slate-300 text-sm">
              Nosso sistema processa milhares de dados históricos antes de te dar um número. Nós analisamos:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-slate-200">
                <ShieldCheck className="text-green-500 w-5 h-5 flex-shrink-0" />
                Todos os resultados já sorteados
              </li>
              <li className="flex gap-3 text-sm text-slate-200">
                <TrendingUp className="text-blue-500 w-5 h-5 flex-shrink-0" />
                Números "Quentes" (alta frequência)
              </li>
              <li className="flex gap-3 text-sm text-slate-200">
                <Zap className="text-yellow-500 w-5 h-5 flex-shrink-0" />
                Padrões de ganhadores reais
              </li>
            </ul>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-center">
            <div className="text-red-500 font-bold text-lg mb-1">Palpiteiro</div>
            <p className="text-xs text-slate-400">Escolhe datas de aniversário e números aleatórios.</p>
          </div>
          <div className="p-4 rounded-xl bg-green-900/20 border border-green-500/30 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-green-500 text-[9px] font-bold text-slate-900 px-2 py-0.5">VOCÊ</div>
            <div className="text-green-500 font-bold text-lg mb-1">Estrategista</div>
            <p className="text-xs text-slate-400">Usa estatística, equilíbrio e dados frios.</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-yellow-500/30 text-center relative">
           <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
             Investimento Inteligente
           </div>
           <h3 className="text-xl font-bold text-white mt-2 mb-4">Pacotes de Crédito</h3>
           <p className="text-slate-400 text-sm mb-6">
             Você começa com 3 créditos grátis. Depois, adquira pacotes direto comigo no WhatsApp.
           </p>
           
           <button 
             onClick={openWhatsApp}
             className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/50 flex items-center justify-center gap-2"
           >
             <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="WhatsApp" />
             COMPRAR CRÉDITOS AGORA
           </button>
           <p className="text-xs text-slate-500 mt-3">Transação segura e atendimento humano.</p>
        </div>

      </div>
    </div>
  );
};
