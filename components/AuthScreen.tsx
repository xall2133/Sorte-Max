
import React, { useState } from 'react';
import { Clover, User as UserIcon, ArrowRight, Sparkles, Gift, Loader2, ShieldCheck } from 'lucide-react';
import { AuthService } from '../services/authService';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, digite seu nome para continuar.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await AuthService.accessWithName(name, referralCode);
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setError(res.message || 'Erro ao conectar. Tente novamente.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Luzes de Fundo (Aura) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent blur-3xl"></div>
      </div>

      <div className="w-full max-w-md text-center space-y-10 relative z-10 animate-in fade-in zoom-in duration-1000">
        
        {/* Logo Elevada */}
        <div className="space-y-6">
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.4)] transform hover:rotate-12 transition-all duration-500 border border-white/20">
              <Clover className="text-slate-950 w-14 h-14 drop-shadow-lg" />
            </div>
          </div>
          
          <div>
            <h1 className="text-5xl font-black brand-font tracking-tighter text-white">
              Sorte<span className="gold-text">Max</span>
            </h1>
            <p className="text-slate-400 text-sm mt-3 font-medium tracking-wide uppercase opacity-70">
              Seu portal para a fortuna
            </p>
          </div>
        </div>

        {/* Card de Login Minimalista */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
          
          <form onSubmit={handleAccess} className="space-y-8">
            <div className="space-y-3 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Como deseja ser identificado?</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors">
                  <UserIcon size={20} />
                </div>
                <input 
                  type="text" 
                  placeholder="Seu nome ou apelido"
                  disabled={isLoading}
                  className="w-full bg-slate-950/80 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-lg font-bold focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all outline-none placeholder:text-slate-700 shadow-inner"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3 text-left">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <Gift size={12} className="text-yellow-500" /> Ganhar bônus? (Opcional)
              </label>
              <input 
                type="text" 
                placeholder="CÓDIGO DE INDICAÇÃO"
                disabled={isLoading}
                className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:border-yellow-500/30 outline-none uppercase tracking-widest placeholder:text-slate-800 transition-all"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-bounce flex items-center justify-center gap-2">
                <XCircle size={14} /> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 bg-[length:200%_auto] hover:bg-right text-slate-950 font-black text-xl rounded-2xl shadow-[0_20px_40px_rgba(234,179,8,0.2)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 disabled:grayscale"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>CONECTANDO...</span>
                </div>
              ) : (
                <>
                  ACESSAR SORTE MAX
                  <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Selos de Segurança */}
        <div className="pt-4 flex flex-col items-center gap-6">
           <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                <ShieldCheck size={20} className="text-green-500" />
                <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Dados Seguros</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                <Sparkles size={20} className="text-yellow-500" />
                <span className="text-[8px] font-bold text-white uppercase tracking-tighter">IA Preditiva</span>
              </div>
           </div>
           
           <p className="text-[9px] text-slate-600 uppercase font-bold tracking-[0.4em] animate-pulse">
             Desenvolvido para Vencedores
           </p>
        </div>

      </div>
    </div>
  );
};

const XCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);
