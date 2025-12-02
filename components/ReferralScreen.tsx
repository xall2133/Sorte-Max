import React from 'react';
import { ArrowLeft, Gift, Copy, Share2, Users } from 'lucide-react';
import { AppScreen, User } from '../types';

interface ReferralScreenProps {
  setScreen: (screen: AppScreen) => void;
  user: User;
}

export const ReferralScreen: React.FC<ReferralScreenProps> = ({ setScreen, user }) => {
  
  const handleCopy = () => {
    navigator.clipboard.writeText(user.referralCode);
    alert('Código copiado!');
  };

  const handleShare = () => {
    const text = `Use meu código ${user.referralCode} no app SorteMax e ganhe 10 créditos grátis para gerar jogos da Mega-Sena! Baixe agora.`;
    if (navigator.share) {
        navigator.share({
            title: 'SorteMax - Ganhe Créditos',
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text);
        alert('Texto copiado para compartilhar!');
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 min-h-screen bg-slate-950 pb-20">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-slate-900 sticky top-0 z-10">
        <button onClick={() => setScreen(AppScreen.HOME)} className="text-slate-400 hover:text-white">
          <ArrowLeft />
        </button>
        <span className="font-bold text-lg brand-font text-white flex items-center gap-2">
            <Gift className="text-yellow-500" /> Indique e Ganhe
        </span>
      </div>

      <div className="p-6 space-y-8 max-w-md mx-auto text-center">
        
        <div className="space-y-2">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-4">
                <Gift className="text-slate-900 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white">Ganhe Créditos Grátis</h2>
            <p className="text-slate-400 text-sm">
                Indique amigos e ganhe 5 créditos para cada cadastro realizado com seu código.
            </p>
        </div>

        <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-300"></div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Seu Código de Indicação</p>
            <div className="text-4xl font-mono font-bold text-yellow-400 tracking-wider mb-4 select-all">
                {user.referralCode}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleCopy}
                    className="bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <Copy size={16} /> Copiar
                </button>
                <button 
                    onClick={handleShare}
                    className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <Share2 size={16} /> Enviar
                </button>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-xs mb-1">Você ganha</div>
                <div className="text-xl font-bold text-green-400">+5 Créditos</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-xs mb-1">Amigo ganha</div>
                <div className="text-xl font-bold text-yellow-400">+5 Créditos</div>
            </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-slate-700 p-2 rounded-full">
                    <Users size={20} className="text-slate-300" />
                </div>
                <div className="text-left">
                    <div className="text-sm font-bold text-white">Suas Indicações</div>
                    <div className="text-xs text-slate-500">Total de amigos convidados</div>
                </div>
            </div>
            <div className="text-2xl font-bold text-white">{user.referralCount || 0}</div>
        </div>

      </div>
    </div>
  );
};