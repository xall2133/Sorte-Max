
import React, { useState } from 'react';
import { ArrowLeft, Users, Clock, Ticket, Trophy, Plus, Lock, Share2, Crown, Zap } from 'lucide-react';
import { AppScreen, Bolao, GameType, User } from '../types';
import { BolaoService } from '../services/bolaoService';

interface BolaoScreenProps {
  setScreen: (screen: AppScreen) => void;
  user: User;
  isPremium: boolean;
  onOpenPremium: () => void;
}

export const BolaoScreen: React.FC<BolaoScreenProps> = ({ setScreen, user, isPremium, onOpenPremium }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'create'>('feed');
  const boloes = BolaoService.getActiveBoloes();

  const handleJoin = (bolao: Bolao) => {
    if (!isPremium) {
        onOpenPremium();
        return;
    }
    const message = `Olá! Quero participar do bolão *${bolao.title}* (ID: ${bolao.id}). Minha conta é ${user.email}.`;
    const url = `https://wa.me/5571982194803?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShare = (bolao: Bolao) => {
      const text = `Venha participar do Bolão "${bolao.title}" no SorteMax! Use meu código ${user.referralCode} e ganhe créditos.`;
      if (navigator.share) {
          navigator.share({ title: 'Clube do Bolão SorteMax', text, url: window.location.href });
      } else {
          navigator.clipboard.writeText(text);
          alert('Link copiado!');
      }
  };

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-[#050510] text-white pb-24 font-sans selection:bg-fuchsia-500 selection:text-white">
      
      {/* Neon Header */}
      <div className="p-4 border-b border-fuchsia-500/30 bg-[#0a0a16]/90 backdrop-blur sticky top-0 z-20 shadow-lg shadow-fuchsia-900/20">
        <div className="flex items-center gap-4">
            <button onClick={() => setScreen(AppScreen.HOME)} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft />
            </button>
            <div className="flex-1">
                <h2 className="text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent brand-font uppercase tracking-wider flex items-center gap-2">
                    <Ticket className="text-fuchsia-500" /> Clube do Bolão
                </h2>
                <p className="text-[10px] text-slate-400">A sorte compartilhada fica maior</p>
            </div>
            {isPremium && <Crown size={20} className="text-yellow-400 animate-pulse" />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-4 gap-4">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${activeTab === 'feed' ? 'bg-fuchsia-900/20 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Mural de Bolões
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${activeTab === 'create' ? 'bg-cyan-900/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Criar Bolão
          </button>
      </div>

      <div className="px-4 space-y-6">
        
        {/* FEED TAB */}
        {activeTab === 'feed' && (
            <div className="space-y-4">
                {boloes.map(bolao => {
                    const progress = (bolao.soldShares / bolao.totalShares) * 100;
                    return (
                        <div key={bolao.id} className="relative group bg-slate-900/80 border border-slate-800 hover:border-fuchsia-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                            {/* Neon Glow Line */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fuchsia-500 to-cyan-500"></div>
                            
                            {bolao.isOfficial && (
                                <div className="absolute top-0 right-0 bg-fuchsia-600 text-[9px] font-bold px-3 py-1 rounded-bl-xl text-white shadow-lg">
                                    OFICIAL
                                </div>
                            )}

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-fuchsia-300 transition-colors">{bolao.title}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${bolao.game === GameType.MEGA_VIRADA ? 'border-yellow-500/50 text-yellow-500' : 'border-slate-600 text-slate-400'}`}>
                                            {bolao.game}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-500 uppercase">Estimativa</div>
                                        <div className="font-bold text-green-400">{bolao.potEstimate}</div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="bg-slate-950/50 p-2 rounded border border-slate-800 text-center">
                                        <Users size={14} className="mx-auto mb-1 text-cyan-400" />
                                        <div className="text-xs text-slate-300">{bolao.soldShares}/{bolao.totalShares}</div>
                                        <div className="text-[9px] text-slate-600">Cotas</div>
                                    </div>
                                    <div className="bg-slate-950/50 p-2 rounded border border-slate-800 text-center">
                                        <Ticket size={14} className="mx-auto mb-1 text-fuchsia-400" />
                                        <div className="text-xs text-slate-300">R$ {bolao.pricePerShare}</div>
                                        <div className="text-[9px] text-slate-600">Por Cota</div>
                                    </div>
                                    <div className="bg-slate-950/50 p-2 rounded border border-slate-800 text-center">
                                        <Clock size={14} className="mx-auto mb-1 text-yellow-400" />
                                        <div className="text-xs text-slate-300">2d 4h</div>
                                        <div className="text-[9px] text-slate-600">Fim</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                        <span>Progresso</span>
                                        <span className="text-cyan-400">{progress.toFixed(0)}% Vendido</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 shadow-[0_0_10px_#d946ef]"></div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleShare(bolao)}
                                        className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleJoin(bolao)}
                                        className="flex-1 bg-gradient-to-r from-fuchsia-700 to-purple-800 hover:from-fuchsia-600 hover:to-purple-700 text-white font-bold rounded-xl py-3 shadow-lg shadow-fuchsia-900/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        {isPremium ? (
                                            <>Entrar no Bolão <Ticket size={16} /></>
                                        ) : (
                                            <>
                                                <Lock size={16} /> Liberar Acesso
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* CREATE TAB */}
        {activeTab === 'create' && (
            <div className="animate-in slide-in-from-right">
                {!isPremium ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Lock className="text-slate-500 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Recurso Premium</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Apenas membros do Clube Premium podem criar seus próprios bolões personalizados e convidar amigos.
                        </p>
                        <button 
                            onClick={onOpenPremium}
                            className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl font-bold text-slate-900 shadow-lg shadow-yellow-900/20 mt-4"
                        >
                            SEJA PREMIUM AGORA
                        </button>
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-cyan-500/20 rounded-2xl p-6 space-y-6">
                        <div className="text-center mb-4">
                             <div className="inline-block p-3 bg-cyan-900/20 rounded-full mb-2 border border-cyan-500/30">
                                <Plus size={24} className="text-cyan-400" />
                             </div>
                             <h3 className="text-lg font-bold text-white">Criar Novo Bolão</h3>
                             <p className="text-xs text-slate-500">Defina as regras e convide participantes</p>
                        </div>
                        
                        {/* Mock Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-cyan-400 font-bold uppercase ml-1">Nome do Bolão</label>
                                <input type="text" placeholder="Ex: Bolão da Firma" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase ml-1">Jogo</label>
                                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none">
                                        <option>Mega-Sena</option>
                                        <option>Lotofácil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase ml-1">Cotas</label>
                                    <input type="number" placeholder="10" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                                </div>
                            </div>
                            
                            <button className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/30">
                                CRIAR E GERAR LINK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center px-6">
        <p className="text-[10px] text-slate-600">
            O SorteMax apenas organiza os números e participantes. A realização das apostas na lotérica oficial é de responsabilidade do organizador do bolão.
        </p>
      </div>
    </div>
  );
};
