
import React, { useState, useEffect } from 'react';
import { 
  Dices, 
  Settings, 
  History, 
  Sparkles, 
  TrendingUp,
  BrainCircuit,
  Clover,
  ArrowRight,
  ShieldCheck,
  Info,
  LogOut,
  User as UserIcon,
  Crown,
  Bot,
  Gift,
  Ticket
} from 'lucide-react';

import { GameType, AppScreen, GeneratedSet, UserPreferences, StrategyType, User, PaymentPlan } from './types';
import { GAMES, generateByStrategy } from './services/lotteryLogic';
import { AuthService } from './services/authService';
import { NumberBall } from './components/NumberBall';
import { PremiumModal } from './components/PremiumModal';
import { BuyCreditsBanner } from './components/BuyCreditsBanner';
import { AdminPanel } from './components/AdminPanel';
import { LandingPage } from './components/LandingPage';
import { StatsPanel } from './components/StatsPanel';
import { AuthScreen } from './components/AuthScreen';
import { AiAgentScreen } from './components/AiAgentScreen';
import { StoreScreen } from './components/StoreScreen';
import { ReferralScreen } from './components/ReferralScreen';
import { BolaoScreen } from './components/BolaoScreen';
import { PaymentModal } from './components/PaymentModal';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<AppScreen>(AppScreen.AUTH);
  const [isSessionLoading, setIsSessionLoading] = useState(true); 
  
  const [selectedGame, setSelectedGame] = useState<GameType>(GameType.MEGA_VIRADA);
  const [credits, setCredits] = useState<number>(0);
  const [history, setHistory] = useState<GeneratedSet[]>([]);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);
  
  const [currentResult, setCurrentResult] = useState<GeneratedSet | null>(null);
  
  const [prefs, setPrefs] = useState<UserPreferences>({
      strategy: StrategyType.SMART,
      numberCount: 6,
      excludedNumbers: [],
      fixedNumbers: []
  });

  // Init Session
  useEffect(() => {
    let mounted = true;
    
    const initSession = async () => {
        try {
            // Safety timeout: if auth takes too long, just show auth screen
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));
            const authPromise = AuthService.getCurrentUser();
            
            const user = await Promise.race([authPromise, timeoutPromise]) as User | null | undefined;

            if (mounted) {
                if (user && 'id' in user) {
                    handleLoginSuccess(user as User);
                } else {
                    // Timeout or null
                    setScreen(AppScreen.AUTH);
                }
            }
        } catch (error) {
            console.error("Erro fatal na inicialização:", error);
            if (mounted) {
                localStorage.removeItem('sortemax_current_session_v4');
                setScreen(AppScreen.AUTH);
            }
        } finally {
            if (mounted) setIsSessionLoading(false);
        }
    };
    initSession();

    try {
        const savedHistory = JSON.parse(localStorage.getItem('sortemax_history') || '[]');
        setHistory(savedHistory);
    } catch (e) {
        setHistory([]);
    }
    
    return () => { mounted = false; };
  }, []);

  // Sync credits when screen changes
  useEffect(() => {
    const refreshUser = async () => {
        if (currentUser) {
            try {
                const syncedUser = await AuthService.getCurrentUser();
                if (syncedUser) {
                    setCredits(syncedUser.credits);
                    setCurrentUser(syncedUser);
                }
            } catch (e) {
                console.error("Erro ao sincronizar créditos", e);
            }
        }
    };
    refreshUser();
  }, [screen, paymentPlan]); 

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCredits(user.credits);
    setScreen(AppScreen.HOME);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setScreen(AppScreen.AUTH);
  };

  const handleOpenStore = () => {
    setScreen(AppScreen.STORE);
  };

  const initiateCheckout = (plan: PaymentPlan) => {
    setIsPremiumModalOpen(false); 
    setPaymentPlan(plan);
  };

  const handlePaymentSuccess = async () => {
      if (currentUser) {
          const updatedUser = await AuthService.getCurrentUser();
          if (updatedUser) {
              setCurrentUser(updatedUser);
              setCredits(updatedUser.credits);
          }
      }
      alert("Pagamento confirmado! Seus créditos foram adicionados.");
  };

  const isPremium = () => {
      if (!currentUser?.premiumExpiresAt) return false;
      return currentUser.premiumExpiresAt > Date.now();
  };

  const decrementCredits = async (amount: number = 1): Promise<boolean> => {
    if (isPremium()) return true;

    if (credits < amount) {
      setIsPremiumModalOpen(true);
      return false;
    }
    
    // Optimistic UI update
    const newVal = credits - amount;
    setCredits(newVal);
    
    if (currentUser) {
        await AuthService.updateUserCredits(currentUser.id, newVal);
    }
    return true;
  };

  const handleGenerate = async (strategy: StrategyType) => {
    const canProceed = await decrementCredits(1);
    if (!canProceed) return;

    setIsLoading(true);
    setCurrentResult(null);

    // Audio effect
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'); 
    audio.volume = 0.2;
    audio.play().catch(() => {});

    setTimeout(() => {
        const count = strategy === StrategyType.SMART ? GAMES[selectedGame].defaultCount : (prefs.numberCount || 6);
        
        // Call logic service
        const result = generateByStrategy(
            selectedGame, 
            strategy, 
            count,
            prefs.fixedNumbers,
            prefs.excludedNumbers
        );

        const newSet: GeneratedSet = {
            id: Date.now().toString(),
            numbers: result.numbers,
            explanation: result.reason,
            strategy: strategy,
            timestamp: Date.now(),
            game: selectedGame
        };

        setCurrentResult(newSet);
        const newHistory = [newSet, ...history].slice(0, 50);
        setHistory(newHistory);
        localStorage.setItem('sortemax_history', JSON.stringify(newHistory));
        setIsLoading(false);
        if (screen !== AppScreen.GENERATOR) setScreen(AppScreen.GENERATOR);
    }, 1500); 
  };

  // --- Views ---

  const renderHeader = () => (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-4 py-3 shadow-2xl">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setScreen(AppScreen.HOME)}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Clover className="text-slate-900 w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold brand-font tracking-tight">
            Sorte<span className="gold-text">Max</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
             {currentUser?.isAdmin && (
                 <button onClick={() => setScreen(AppScreen.ADMIN)} className="text-yellow-500 animate-pulse bg-yellow-900/20 p-1.5 rounded-lg border border-yellow-500/50">
                     <Crown size={20} />
                 </button>
             )}
            
            <button 
                onClick={() => setScreen(AppScreen.REFERRAL)}
                className="p-2 text-yellow-500 hover:bg-yellow-900/20 rounded-full"
            >
                <Gift size={20} />
            </button>

            <div 
            onClick={handleOpenStore}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer hover:bg-slate-700 transition active:scale-95 ${isPremium() ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-slate-800 border-yellow-500/30'}`}
            >
            {isPremium() ? (
                <>
                    <Crown size={12} className="text-yellow-400" />
                    <span className="text-[10px] text-yellow-400 uppercase tracking-wide font-bold">Premium</span>
                </>
            ) : (
                <>
                    <span className="text-[10px] text-slate-300 uppercase tracking-wide font-bold">Créditos</span>
                    <span className={`font-bold text-sm ${credits === 0 ? 'text-red-500' : 'text-green-400'}`}>
                        {credits}
                    </span>
                </>
            )}
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-white">
                <LogOut size={20} />
            </button>
        </div>
      </div>
    </header>
  );

  const renderHome = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Welcome Message */}
      <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2 text-slate-300">
             <UserIcon size={14} /> 
             <span className="text-xs">Olá, <b>{currentUser?.name.split(' ')[0]}</b></span>
          </div>
          <button onClick={() => setScreen(AppScreen.EXPLAINER)} className="text-slate-400 hover:text-yellow-500 flex items-center gap-1 text-[10px]">
             <Info size={12} /> Como funciona
          </button>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900 to-slate-900 p-6 shadow-2xl border border-green-600/30">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
             <span className="inline-block px-3 py-1 bg-yellow-500 text-slate-900 text-[10px] font-bold rounded-full mb-2 uppercase tracking-wide">
                Inteligência Artificial
             </span>
          </div>
          <h2 className="text-2xl font-bold brand-font mb-1">Mega da Virada</h2>
          <p className="text-green-100 text-xs mb-4 opacity-80">Probabilidade matemática aplicada para aumentar suas chances.</p>
          <button 
             onClick={() => { setSelectedGame(GameType.MEGA_VIRADA); handleGenerate(StrategyType.SMART); }}
             className="w-full bg-white text-green-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={18} className="text-yellow-600" />
            GERAR JOGO INTELIGENTE
          </button>
        </div>
      </div>

      {/* Game Selector Scroller */}
      <div className="space-y-2">
        <div className="flex justify-between items-end px-1">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Escolha seu Jogo</h3>
             <button onClick={() => setScreen(AppScreen.STATS)} className="text-xs text-yellow-500 hover:underline flex items-center gap-1">
                 <TrendingUp size={12} /> Ver Estatísticas
             </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar touch-pan-x">
          {Object.values(GAMES).map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`flex-shrink-0 min-w-[130px] p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                selectedGame === game.id 
                  ? `bg-slate-800 ${game.color} border-2 shadow-lg`
                  : 'bg-slate-800/50 border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mb-3 ${game.color.replace('border', 'bg')}`}></div>
              <div className="font-bold text-sm text-left">{game.name}</div>
              <div className="text-[10px] text-slate-500 text-left mt-1">1 a {game.max}</div>
              {selectedGame === game.id && (
                  <div className="absolute top-2 right-2 text-green-500"><ShieldCheck size={14} /></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* AI AGENT BUTTON */}
      <button 
          onClick={() => setScreen(AppScreen.AI_AGENT)}
          className="w-full bg-gradient-to-r from-purple-900 to-slate-900 border border-purple-500/50 p-4 rounded-2xl flex items-center justify-between group hover:border-purple-400 transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400">
                <Bot size={22} />
            </div>
            <div className="text-left">
               <h3 className="font-bold text-white flex items-center gap-2">
                  Oráculo SorteMax <span className="text-[10px] bg-purple-500 text-white px-1.5 rounded">NOVO</span>
               </h3>
               <p className="text-xs text-slate-400">Converse com a IA Mística.</p>
            </div>
          </div>
          <ArrowRight className="text-purple-500 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setScreen(AppScreen.PERSONALIZED)}
          className="col-span-2 glass-panel p-5 rounded-2xl flex items-center justify-between group hover:bg-slate-800 transition-colors border-l-4 border-blue-500"
        >
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <Settings className="text-blue-400 w-5 h-5" />
              <h3 className="font-bold text-md text-white">Criar Jogo Personalizado</h3>
            </div>
            <p className="text-xs text-slate-400">Escolha estratégia, qtd. números e fixos.</p>
          </div>
          <ArrowRight className="text-slate-500 group-hover:text-white transition-colors" />
        </button>

        <button 
          onClick={() => { setSelectedGame(GameType.MEGA_VIRADA); handleGenerate(StrategyType.HOT); }}
          className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-colors border border-slate-800"
        >
          <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center text-red-500 mb-1">
              <TrendingUp size={20} />
          </div>
          <span className="font-bold text-xs text-center text-slate-200">Números Quentes</span>
        </button>

        <button 
           onClick={() => { setSelectedGame(GameType.MEGA_VIRADA); handleGenerate(StrategyType.COLD); }}
           className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-colors border border-slate-800"
        >
          <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-500 mb-1">
              <TrendingUp size={20} className="rotate-180" />
          </div>
          <span className="font-bold text-xs text-center text-slate-200">Números Atrasados</span>
        </button>
      </div>

      {!isPremium() && <BuyCreditsBanner onBuy={handleOpenStore} />}

      {/* Recent History Teaser */}
      {history.length > 0 && (
         <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
           <div className="flex justify-between items-center mb-3">
             <h3 className="text-sm font-bold text-slate-400">Última Geração</h3>
             <button onClick={() => setScreen(AppScreen.HISTORY)} className="text-xs text-yellow-500">Histórico Completo</button>
           </div>
           <div className="flex justify-center gap-2 mb-2">
              {history[0].numbers.map((n, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700 shadow-inner">
                  {n}
                </div>
              ))}
           </div>
           <p className="text-[10px] text-center text-slate-500 italic">{history[0].explanation}</p>
         </div>
      )}
    </div>
  );

  const renderGenerator = () => (
    <div className="flex flex-col h-full animate-in zoom-in-95 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold brand-font text-white">{GAMES[selectedGame].name}</h2>
        <div className="flex items-center justify-center gap-2 text-yellow-500 text-xs font-bold uppercase mt-1">
             <BrainCircuit size={12} />
             {currentResult?.strategy === StrategyType.SMART ? "IA Probabilística" : 
              currentResult?.strategy === StrategyType.HOT ? "Estratégia Quente" :
              currentResult?.strategy === StrategyType.COLD ? "Estratégia Fria" : "Personalizado"}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start pt-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-6 mt-10">
             <div className="relative">
                 <div className="w-20 h-20 border-4 border-slate-800 rounded-full"></div>
                 <div className="absolute top-0 left-0 w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                     AI
                 </div>
             </div>
             <div className="text-center space-y-2">
                 <p className="animate-pulse text-yellow-400 font-bold">Calculando probabilidades...</p>
                 <p className="text-xs text-slate-500">Analisando 2.000 concursos passados</p>
                 <p className="text-xs text-slate-500">Verificando atrasos e frequências</p>
             </div>
          </div>
        ) : currentResult ? (
          <div className="w-full space-y-6">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
              {currentResult.numbers.map((num, idx) => (
                <NumberBall key={`${currentResult.timestamp}-${idx}`} num={num} delay={idx * 150} />
              ))}
            </div>

            <div className="bg-slate-800/80 rounded-xl p-5 border border-yellow-500/20 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
              <div className="flex items-center gap-2 mb-3 text-yellow-400">
                <ShieldCheck size={18} />
                <h3 className="font-bold text-sm uppercase">Análise da Estratégia</h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-light">
                {currentResult.explanation}
              </p>
            </div>

            {!isPremium() && <BuyCreditsBanner onBuy={handleOpenStore} />}
          </div>
        ) : null}
      </div>

      {!isLoading && (
          <div className="mt-auto grid gap-3 pt-6">
            <button 
            onClick={() => handleGenerate(currentResult?.strategy || StrategyType.SMART)}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl font-bold text-slate-900 shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
            <Sparkles size={20} />
            GERAR OUTRO JOGO {isPremium() ? "( Ilimitado )" : "( -1 Crédito )"}
            </button>
            <button 
            onClick={() => setScreen(AppScreen.HOME)}
            className="w-full py-3 text-slate-400 font-medium hover:text-white transition-colors"
            >
            Voltar ao Menu
            </button>
        </div>
      )}
    </div>
  );

  const renderPersonalized = () => (
    <div className="animate-in slide-in-from-right duration-300 space-y-6 pb-20">
      <div className="text-center">
        <h2 className="text-xl font-bold brand-font text-white">
          Configuração Avançada
        </h2>
        <p className="text-slate-400 text-xs mt-1">Defina as regras matemáticas do seu jogo</p>
      </div>

      <div className="space-y-6">
        
        {/* Count */}
        <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-slate-500 ml-1">Quantidade de Números</label>
            <div className="flex gap-2">
                {[6, 7, 8, 9, 10].map(n => (
                    <button 
                        key={n}
                        onClick={() => setPrefs({...prefs, numberCount: n})}
                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${prefs.numberCount === n ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>

        {/* Strategy */}
        <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-slate-500 ml-1">Estratégia Base</label>
            <div className="grid grid-cols-1 gap-2">
                <button 
                    onClick={() => setPrefs({...prefs, strategy: StrategyType.SMART})}
                    className={`p-3 rounded-lg text-left border transition-all ${prefs.strategy === StrategyType.SMART ? 'bg-slate-800 border-yellow-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                >
                    <div className="font-bold text-sm">Inteligência Híbrida (Recomendado)</div>
                    <div className="text-[10px]">Mistura números quentes e frios para equilíbrio ideal.</div>
                </button>
                <button 
                    onClick={() => setPrefs({...prefs, strategy: StrategyType.HOT})}
                    className={`p-3 rounded-lg text-left border transition-all ${prefs.strategy === StrategyType.HOT ? 'bg-slate-800 border-red-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                >
                    <div className="font-bold text-sm">Seguir a Tendência (Quentes)</div>
                    <div className="text-[10px]">Foca apenas nos números que mais saem.</div>
                </button>
                <button 
                    onClick={() => setPrefs({...prefs, strategy: StrategyType.COLD})}
                    className={`p-3 rounded-lg text-left border transition-all ${prefs.strategy === StrategyType.COLD ? 'bg-slate-800 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                >
                    <div className="font-bold text-sm">Caçador de Atrasos (Frios)</div>
                    <div className="text-[10px]">Foca nos números que "devem" sair em breve.</div>
                </button>
                <button 
                    onClick={() => setPrefs({...prefs, strategy: StrategyType.BALANCED})}
                    className={`p-3 rounded-lg text-left border transition-all ${prefs.strategy === StrategyType.BALANCED ? 'bg-slate-800 border-green-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                >
                    <div className="font-bold text-sm">Equilíbrio Par/Ímpar</div>
                    <div className="text-[10px]">Força distribuição geométrica na cartela.</div>
                </button>
            </div>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400">
            <Info size={14} className="inline mr-1 mb-0.5" />
            Esta geração consumirá {isPremium() ? "0" : "1"} crédito{isPremium() ? " (Premium)" : ""}.
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950 border-t border-slate-800">
          <div className="max-w-md mx-auto flex gap-3">
            <button 
                onClick={() => setScreen(AppScreen.HOME)}
                className="px-6 py-4 rounded-xl font-bold text-slate-400 hover:bg-slate-900"
            >
                Voltar
            </button>
            <button 
                onClick={() => handleGenerate(prefs.strategy || StrategyType.SMART)}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
                <Dices size={20} />
                GERAR AGORA
            </button>
          </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="animate-in slide-in-from-bottom duration-300">
       <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Histórico de Jogos</h2>
          <button onClick={() => setScreen(AppScreen.HOME)} className="p-2 bg-slate-800 rounded-lg">
             <ArrowRight className="rotate-180" />
          </button>
       </div>
       
       <div className="space-y-4 overflow-y-auto max-h-[70vh] pb-20">
         {history.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
               <History size={48} className="mx-auto mb-3 opacity-50" />
               <p>Nenhuma combinação gerada ainda.</p>
            </div>
         ) : (
            history.map((set, idx) => (
               <div key={idx} className="bg-slate-800 border border-slate-700 p-4 rounded-xl relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3 border-b border-slate-700/50 pb-2">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${set.game === GameType.MEGA_VIRADA ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'}`}>{set.game}</span>
                     <span className="text-[10px] text-slate-500">{new Date(set.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                     {set.numbers.map((n) => (
                        <span key={n} className="w-7 h-7 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-xs font-bold shadow-md">
                           {n}
                        </span>
                     ))}
                  </div>
                  {set.explanation && (
                     <div className="bg-slate-900/50 p-2 rounded text-[10px] text-slate-400 italic">
                        "{set.explanation}"
                     </div>
                  )}
               </div>
            ))
         )}
       </div>
    </div>
  );

  // --- INITIAL LOADING STATE ---
  if (isSessionLoading) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6">
                <div className="w-20 h-20 bg-slate-800 rounded-full animate-pulse"></div>
                <Clover className="text-yellow-500 w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-bold brand-font text-white mb-2">SorteMax</h1>
            <p className="text-slate-500 text-sm">Conectando ao banco de dados...</p>
        </div>
      );
  }

  if (screen === AppScreen.AUTH) {
      return <AuthScreen onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-yellow-500 selection:text-slate-900">
      
      {/* Modals & Overlays */}
      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)} 
        onGoToCheckout={initiateCheckout} 
      />

      {/* Payment Modal Logic */}
      {paymentPlan && (
        <PaymentModal 
            isOpen={!!paymentPlan} 
            onClose={() => setPaymentPlan(null)} 
            plan={paymentPlan}
            onSuccess={handlePaymentSuccess}
        />
      )}
      
      {/* Admin Panel Overlay - only visible if user is admin */}
      {screen === AppScreen.ADMIN && currentUser?.isAdmin && <AdminPanel onClose={() => setScreen(AppScreen.HOME)} />}
      
      {/* Header visibility logic */}
      {screen !== AppScreen.EXPLAINER && screen !== AppScreen.ADMIN && screen !== AppScreen.STATS && screen !== AppScreen.AI_AGENT && screen !== AppScreen.STORE && screen !== AppScreen.REFERRAL && screen !== AppScreen.BOLAO && renderHeader()}
      
      <main className={`max-w-md mx-auto p-4 pb-24 ${screen === AppScreen.HOME ? '' : 'min-h-screen'}`}>
        {screen === AppScreen.HOME && renderHome()}
        {screen === AppScreen.GENERATOR && renderGenerator()}
        {screen === AppScreen.PERSONALIZED && renderPersonalized()}
        {screen === AppScreen.HISTORY && renderHistory()}
        {screen === AppScreen.EXPLAINER && <LandingPage setScreen={setScreen} openWhatsApp={handleOpenStore} />}
        {screen === AppScreen.STATS && <StatsPanel setScreen={setScreen} game={selectedGame} />}
        {screen === AppScreen.STORE && <StoreScreen setScreen={setScreen} onSelectPlan={initiateCheckout} />}
        {screen === AppScreen.REFERRAL && currentUser && <ReferralScreen setScreen={setScreen} user={currentUser} />}
        {screen === AppScreen.BOLAO && currentUser && (
            <BolaoScreen 
                setScreen={setScreen} 
                user={currentUser} 
                isPremium={isPremium()} 
                onOpenPremium={() => setIsPremiumModalOpen(true)}
            />
        )}
        {screen === AppScreen.AI_AGENT && (
            <AiAgentScreen 
                setScreen={setScreen} 
                isPremium={isPremium()} 
                credits={credits} 
                deductCredit={decrementCredits}
                openPremium={() => setIsPremiumModalOpen(true)}
            />
        )}
      </main>

      {/* Floating CTA for Bolão - Fixed at bottom */}
      {screen === AppScreen.HOME && (
         <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-slate-950 to-transparent">
             <button 
                 onClick={() => setScreen(AppScreen.BOLAO)}
                 className="w-full max-w-md mx-auto bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-fuchsia-900/40 animate-[pulse_3s_ease-in-out_infinite] flex items-center justify-between px-6 border border-fuchsia-400/50"
             >
                 <div className="text-left">
                     <span className="block text-xs uppercase tracking-wider text-fuchsia-200">Clube do Bolão</span>
                     <span className="block text-lg">Entrar no Clube 🎉</span>
                 </div>
                 <Ticket size={28} className="text-fuchsia-200" />
             </button>
         </div>
      )}

      {/* Floating Buy Button (if low credits) - Adjusted position to be above Bolao CTA */}
      {screen === AppScreen.HOME && credits < 3 && !isPremium() && (
        <div className="fixed bottom-24 left-4 right-4 z-40">
            <button 
                onClick={handleOpenStore}
                className="w-full bg-green-600/90 backdrop-blur text-white text-sm font-bold py-2 rounded-xl shadow-lg shadow-green-900/50 flex items-center justify-center gap-2"
            >
                <Crown className="w-4 h-4" />
                RECARREGAR CRÉDITOS
            </button>
        </div>
      )}

    </div>
  );
}

export default App;
