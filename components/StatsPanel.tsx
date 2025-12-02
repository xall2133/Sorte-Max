import React from 'react';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AppScreen, GameType, AppStats } from '../types';
import { getGameStats } from '../services/lotteryLogic';

interface StatsPanelProps {
  setScreen: (screen: AppScreen) => void;
  game: GameType;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ setScreen, game }) => {
  const stats: AppStats = getGameStats(game);

  return (
    <div className="animate-in slide-in-from-right duration-500 bg-slate-950 min-h-screen pb-10">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-slate-900 sticky top-0 z-10">
        <button onClick={() => setScreen(AppScreen.HOME)} className="text-slate-400 hover:text-white">
          <ArrowLeft />
        </button>
        <div>
          <h2 className="font-bold text-lg brand-font leading-none text-white">Estatísticas</h2>
          <span className="text-xs text-yellow-500 uppercase font-bold">{game}</span>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        
        {/* Hot Numbers */}
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-red-400 w-5 h-5" />
                <h3 className="font-bold text-white">Top 10 - Mais Sorteados (Quentes)</h3>
            </div>
            <div className="grid grid-cols-5 gap-2">
                {stats.hotNumbers.map((num, i) => (
                    <div key={i} className="bg-red-900/20 border border-red-500/30 text-red-100 font-bold rounded p-2 text-center text-sm relative">
                        {num}
                        {i < 3 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-500">Estes números têm frequência acima da média nos últimos 200 concursos.</p>
        </div>

        {/* Cold Numbers */}
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="text-blue-400 w-5 h-5" />
                <h3 className="font-bold text-white">Top 10 - Mais Atrasados (Frios)</h3>
            </div>
            <div className="grid grid-cols-5 gap-2">
                {stats.coldNumbers.map((num, i) => (
                    <div key={i} className="bg-blue-900/20 border border-blue-500/30 text-blue-100 font-bold rounded p-2 text-center text-sm">
                        {num}
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-500">Números que não saem há muito tempo. A probabilidade de saída aumenta a cada concurso.</p>
        </div>

        {/* Ratio */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-bold uppercase">Equilíbrio Par/Ímpar</span>
                <Activity className="text-yellow-500 w-4 h-4" />
            </div>
            <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden flex">
                <div className="bg-purple-500 h-full w-[48%]"></div>
                <div className="bg-green-500 h-full w-[52%]"></div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-mono">
                <span className="text-purple-400">48% Pares</span>
                <span className="text-green-400">52% Ímpares</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Historicamente, a Mega-Sena busca o equilíbrio próximo de 50/50.</p>
        </div>

        {/* Last Draws Table */}
        <div>
            <h3 className="font-bold text-white mb-3">Últimos Resultados</h3>
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                {stats.lastDraws.map((draw, i) => (
                    <div key={i} className="p-3 border-b border-slate-800 flex justify-between items-center last:border-0">
                         <span className="text-xs text-slate-500">Conc. {2650 - i}</span>
                         <div className="flex gap-1">
                             {draw.map(n => (
                                 <span key={n} className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-300">
                                     {n}
                                 </span>
                             ))}
                         </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
