import React, { useState } from 'react';
import { Clover, Lock, Mail, User as UserIcon, Phone, ArrowRight, Sparkles, Gift } from 'lucide-react';
import { AuthService } from '../services/authService';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    referralCode: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const res = await AuthService.login(formData.email, formData.password);
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setError(res.message || 'Erro ao entrar.');
      }
    } else {
      // Register
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        setError('Preencha os campos obrigatórios.');
        return;
      }
      const res = await AuthService.register(formData.name, formData.email, formData.phone, formData.password, formData.referralCode);
      if (res.success) {
        // Auto login after register
        const user = await AuthService.getCurrentUser();
        if (user) onLogin(user);
      } else {
        setError(res.message || 'Erro ao criar conta.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-4 transform rotate-3">
            <Clover className="text-slate-900 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold brand-font tracking-tight text-white">
            Sorte<span className="gold-text">Max</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Sua sorte começa com inteligência.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950 rounded-xl p-1 mb-6 border border-slate-800">
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Entrar
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Seu Nome Completo"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Seu E-mail"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
              <input 
                type="tel" 
                placeholder="Seu WhatsApp (com DDD)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Sua Senha"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors outline-none"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="relative">
                <Gift className="absolute left-3 top-3.5 text-yellow-500 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Código de Indicação (Opcional)"
                    className="w-full bg-slate-950 border border-yellow-500/30 rounded-xl py-3 pl-10 pr-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors outline-none uppercase"
                    value={formData.referralCode}
                    onChange={e => setFormData({...formData, referralCode: e.target.value})}
                />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-xs text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold text-lg rounded-xl shadow-lg shadow-yellow-900/50 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            {isLogin ? 'Acessar App' : 'Cadastrar e Ganhar 5 Créditos'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-6 text-center">
           {!isLogin && (
             <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
               <Sparkles size={12} className="text-green-500" />
               Ganhe 5 créditos grátis. Use código para ganhar 10!
             </p>
           )}
           {isLogin && (
             <p className="text-xs text-slate-500 mt-4">
               Esqueceu a senha? Contate o suporte no WhatsApp.
             </p>
           )}
        </div>

      </div>
      
      <p className="text-[10px] text-slate-600 mt-8">SorteMax © 2024 - Todos os direitos reservados</p>
    </div>
  );
};