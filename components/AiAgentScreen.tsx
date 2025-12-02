
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Bot, Send, Sparkles, Lock, Zap } from 'lucide-react';
import { AppScreen } from '../types';
import { askOracle } from '../services/geminiService';

interface AiAgentScreenProps {
  setScreen: (screen: AppScreen) => void;
  isPremium: boolean;
  credits: number;
  deductCredit: (amount: number) => Promise<boolean>;
  openPremium: () => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const AiAgentScreen: React.FC<AiAgentScreenProps> = ({ 
  setScreen, 
  isPremium, 
  credits, 
  deductCredit,
  openPremium 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Olá, sou o Oráculo SorteMax. ✨ Os números e as estrelas falam comigo. O que você deseja saber hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check costs: 1 Credit per message for Free users
    if (!isPremium) {
      if (credits < 1) {
        // Trigger modal/alert
        if(confirm("Seus créditos acabaram. Deseja liberar acesso ilimitado com o Premium?")) {
            openPremium();
        }
        return;
      }
      
      // Await deduction
      const success = await deductCredit(1);
      if (!success) return; 
    }

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    let response = await askOracle(userMsg, messages);
    
    // Add Upsell Message for Free Users
    if (!isPremium) {
        response += "\n\n🔒 _Dica do Oráculo: Quer conversar ilimitado sem gastar créditos? Seja Premium por apenas R$ 19,90/mês!_";
    }

    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 pb-20 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20 bg-slate-900/80 backdrop-blur flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen(AppScreen.HOME)} className="text-slate-400 hover:text-white">
            <ArrowLeft />
          </button>
          <div>
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
              <Bot size={20} /> Oráculo IA
            </h2>
            <p className="text-[10px] text-slate-500">Inteligência Artificial Mística</p>
          </div>
        </div>
        {!isPremium && (
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-purple-500/30 shadow-lg">
            <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                <Zap size={10} className="text-yellow-500" /> Custo: 1 Crédito
            </span>
          </div>
        )}
        {isPremium && (
            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
                <span className="text-[10px] text-yellow-400 font-bold uppercase">Ilimitado</span>
            </div>
        )}
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-4 rounded-2xl shadow-lg text-sm leading-relaxed relative whitespace-pre-line ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 text-purple-100 rounded-tl-none'
              }`}
            >
              {msg.role === 'model' && <Sparkles size={12} className="absolute -top-2 -left-2 text-purple-400" />}
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-900 border border-purple-500/10 p-4 rounded-2xl rounded-tl-none flex gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-white/5">
        {!isPremium && credits < 1 ? (
           <button 
             onClick={openPremium}
             className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl font-bold text-slate-900 flex items-center justify-center gap-2 shadow-lg animate-pulse"
           >
             <Lock size={18} />
             Liberar Ilimitado (R$ 19,90)
           </button>
        ) : (
          <div className="flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isPremium ? "Pergunte ao Oráculo..." : "Pergunte (1 Crédito)..."}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || (!input.trim())}
              className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        )}
        <p className="text-[10px] text-center text-slate-600 mt-2">
            A IA pode cometer erros. Confira sempre os resultados oficiais.
        </p>
      </div>
    </div>
  );
};
