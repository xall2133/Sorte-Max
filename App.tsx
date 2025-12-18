
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
  Ticket,
  Home,
  Store,
  LayoutGrid,
  Calendar,
  Hash,
  Type,
  ChevronLeft,
  X,
  Check
} from 'lucide-react';

import { GameType, AppScreen, GeneratedSet, UserPreferences, StrategyType, User, PaymentPlan } from './types';
import { GAMES, generateByStrategy, generateFromPreferences } from './services/lotteryLogic';
import { AuthService } from './services/authService';
import { generatePersonalizedNumbers } from './services/geminiService';
import { NumberBall } from './components/NumberBall';
import { PremiumModal } from './components/PremiumModal';
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
  const [screen, setScreen] = useState<AppScreen>(AppScreen.HOME);
  const [isSessionLoading, setIsSessionLoading] = useState(true); 
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
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
      fixedNumbers: [],
      birthDate: '',
      luckyNumber: '',
      name: '',
      mysticWord: ''
  });

  // Sincronizar nome do usuário com preferências do gerador
  useEffect(() => {
    if (currentUser && currentUser.name) {
      setPrefs(prev => ({ ...prev, name: currentUser.name }));
    }
  }, [currentUser]);

  useEffect(() => {
    const initSession = async () => {
        try {
            const user = await AuthService.getCurrentUser();
            if (user) {
                handleLoginSuccess(user);
            } else {
                setScreen(AppScreen.AUTH);
            }
        } catch (error) {
            setScreen(AppScreen.AUTH);
        } finally {
            setIsSessionLoading(false);
        }
    };
    initSession();
    try {
        const savedHistory = JSON.parse(localStorage.getItem('sortemax_history') || '[]');
        setHistory(savedHistory);
    } catch (e) {
        setHistory([]);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCredits(user.credits);
    setScreen(AppScreen.HOME);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setCredits(0);
    setPrefs({
        strategy: StrategyType.SMART,
        numberCount: 6,
        excludedNumbers: [],
        fixedNumbers: [],
        birthDate: '',
        luckyNumber: '',
        name: '',
        mysticWord: ''
    });
    setShowLogoutConfirm(false);
    setScreen(AppScreen.AUTH);
  };

  const isPremium = () => {
      return true; 
  };

  const isAdmin = () => {
      return currentUser?.name?.toLowerCase() === 'charlie';
  };

  const decrementCredits = async (amount: number = 1): Promise<boolean> => {
    return true;
  };

  const handleGenerate = async (strategy: StrategyType, isMystic: boolean = false) => {
    const canProceed = await decrementCredits(1);
    if (!canProceed) return;

    setIsLoading(true);
    setCurrentResult(null);

    setTimeout(async () => {
        let res;
        if (isMystic) {
            const aiRes = await generatePersonalizedNumbers(selectedGame, prefs);
            if (aiRes.numbers.length > 0) {
                res = { numbers: aiRes.numbers, reason: aiRes.reason, extras: undefined };
            } else {
                res = generateFromPreferences(selectedGame, prefs);
            }
        } else {
            res = generateByStrategy(selectedGame, strategy, prefs.numberCount || GAMES[selectedGame].defaultCount, prefs.fixedNumbers, prefs.excludedNumbers);
        }

        const newSet: GeneratedSet = {
            id: Date.now().toString(),
            numbers: res.numbers,
            extras: res.extras,
            explanation: res.reason,
            strategy,
            timestamp: Date.now(),
            game: selectedGame
        };

        const newHistory = [newSet, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('sortemax_history', JSON.stringify(newHistory));
        
        setIsLoading(false);
        setCurrentResult(newSet);
        setScreen(AppScreen.GENERATOR);
    }, 1500); 
  };

  const renderBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <NavButton active={screen === AppScreen.HOME} onClick={() => setScreen(AppScreen.HOME)} icon={<Home size={22}/>} label="Início" />
        <NavButton active={screen === AppScreen.BOLAO} onClick={() => setScreen(AppScreen.BOLAO)} icon={<Ticket size={22}/>} label="Bolão" highlight />
        <NavButton active={screen === AppScreen.AI_AGENT} onClick={() => setScreen(AppScreen.AI_AGENT)} icon={<Bot size={22}/>} label="Oráculo" />
        <NavButton active={screen === AppScreen.STORE} onClick={() => setScreen(AppScreen.STORE)} icon={<Store size={22}/>} label="Loja" />
    </nav>
  );

  const NavButton = ({ active, onClick, icon, label, highlight }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-yellow-500 scale-110' : 'text-slate-500'}`}>
        <div className={`${highlight && !active ? 'text-fuchsia-500 animate-pulse' : ''} ${active ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : ''}`}>
            {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );

  if (isSessionLoading) return null;
  if (screen === AppScreen.AUTH) return <AuthScreen onLogin={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-24">
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} onGoToCheckout={(p) => setPaymentPlan(p)} />
      {paymentPlan && <PaymentModal isOpen={!!paymentPlan} onClose={() => setPaymentPlan(null)} plan={paymentPlan} onSuccess={async () => {
          const u = await AuthService.getCurrentUser();
          if (u) { setCredits(u.credits); setCurrentUser(u); }
      }} />}
      
      {/* Modal Interno de Logout (Substitui o confirm nativo) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-[2rem] w-full max-w-xs shadow-2xl space-y-6 text-center">
             <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <LogOut className="text-red-500" size={32} />
             </div>
             <div>
                <h3 className="text-lg font-bold">Encerrar Sessão?</h3>
                <p className="text-slate-400 text-sm mt-1">Sua conta e créditos serão preservados.</p>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="py-3 bg-slate-800 rounded-xl font-bold text-sm">Voltar</button>
                <button onClick={handleLogout} className="py-3 bg-red-600 rounded-xl font-bold text-sm shadow-lg shadow-red-900/30">Sair</button>
             </div>
          </div>
        </div>
      )}

      {/* Header Compacto */}
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-lg border-b border-white/5 px-4 py-3 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                <Clover size={18} className="text-slate-950" />
            </div>
            <h1 className="text-base font-black brand-font leading-none">Sorte<span className="gold-text">Max</span></h1>
          </div>
          
          <div className="flex items-center gap-2">
              <div onClick={() => setScreen(AppScreen.STORE)} className="bg-slate-950/50 border border-white/10 rounded-full px-2.5 py-1 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform">
                  <Coins size={12} className="text-yellow-500" />
                  <span className="text-[10px] font-bold">∞</span>
              </div>
              
              <button onClick={() => setScreen(AppScreen.REFERRAL)} className="text-yellow-500 p-2 active:scale-90 transition-transform">
                <Gift size={18}/>
              </button>
              
              {isAdmin() && (
                  <button onClick={() => setScreen(AppScreen.ADMIN)} className="text-fuchsia-500 animate-pulse p-2 active:scale-90 transition-transform">
                    <LayoutGrid size={18}/>
                  </button>
              )}

              <button 
                type="button"
                onPointerDown={(e) => { e.stopPropagation(); setShowLogoutConfirm(true); }}
                className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 active:bg-red-500/30 transition-all ml-1 px-3 py-1.5 rounded-xl group cursor-pointer"
              >
                <LogOut size={16} className="pointer-events-none" />
                <span className="text-[10px] font-black uppercase tracking-tighter pointer-events-none">Sair</span>
              </button>
          </div>
      </header>

      <main className="max-w-md mx-auto p-5">
        {screen === AppScreen.HOME && (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Boas vindas personalizado */}
                <div className="px-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Olá, {currentUser?.name || 'Vencedor'}</p>
                    <h2 className="text-2xl font-black mt-1">Pronto para a <span className="gold-text">Sorte?</span></h2>
                </div>

                {/* Banner Principal */}
                <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${GAMES[selectedGame].gradient} border border-white/10 shadow-2xl relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Sparkles size={120} /></div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black bg-yellow-500 text-slate-950 px-3 py-1 rounded-full uppercase tracking-widest">Sorteio de Hoje</span>
                        <h2 className="text-3xl font-black mt-4 mb-2">{GAMES[selectedGame].name}</h2>
                        <p className="text-white/60 text-sm mb-8">Baseado em 2.450 concursos analisados.</p>
                        <button 
                            onClick={() => handleGenerate(StrategyType.SMART)}
                            disabled={isLoading}
                            className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Dices size={24} />
                            GERAR NÚMEROS AGORA
                        </button>
                    </div>
                </div>

                {/* Seleção de Jogo */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">Mudar Loteria</h3>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {Object.values(GAMES).map(g => (
                            <button 
                                key={g.id}
                                onClick={() => setSelectedGame(g.id)}
                                className={`flex-shrink-0 w-32 h-32 rounded-3xl border transition-all flex flex-col items-center justify-center gap-2 ${selectedGame === g.id ? 'bg-slate-800 border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'bg-slate-900/50 border-white/5 opacity-50'}`}
                            >
                                <div className={`w-3 h-3 rounded-full ${g.color.replace('border', 'bg')}`}></div>
                                <span className="text-xs font-bold text-center px-2 leading-tight">{g.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de Ações Rápidas */}
                <div className="grid grid-cols-2 gap-4">
                    <ActionCard onClick={() => setScreen(AppScreen.PERSONALIZED)} icon={<Settings className="text-blue-400" />} title="Personalizado" desc="Use sua energia" />
                    <ActionCard onClick={() => setScreen(AppScreen.STATS)} icon={<TrendingUp className="text-green-400" />} title="Estatísticas" desc="Análise técnica" />
                    <ActionCard onClick={() => setScreen(AppScreen.HISTORY)} icon={<History className="text-slate-400" />} title="Histórico" desc="Seus jogos" />
                    <ActionCard onClick={() => setScreen(AppScreen.EXPLAINER)} icon={<Info className="text-yellow-400" />} title="Como funciona" desc="Guia SorteMax" />
                </div>
            </div>
        )}

        {screen === AppScreen.GENERATOR && (
            <div className="animate-in zoom-in-95 duration-300 space-y-8 pt-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-slate-800 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-yellow-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs text-center">
                            Consultando o Oráculo...<br/><span className="text-slate-500 text-[10px] mt-1 block">A sorte está sendo tecida</span>
                        </p>
                    </div>
                ) : currentResult && (
                    <div className="space-y-10">
                        <div className="text-center">
                            <h2 className="text-3xl font-black">{GAMES[selectedGame].name}</h2>
                            <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                                <Sparkles size={14} /> Combinação de Sorte
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            {currentResult.numbers.map((n, i) => <NumberBall key={i} num={n} delay={i * 100} />)}
                        </div>
                        
                        {currentResult.extras && (
                            <div className="flex flex-col items-center gap-3 border-t border-white/5 pt-8">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{GAMES[selectedGame].extraName}</span>
                                <div className="flex justify-center gap-4">
                                    {currentResult.extras.map((n, i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-2 border-yellow-500 bg-yellow-500/10 flex items-center justify-center font-bold text-yellow-500 text-xl shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                            {n}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 text-white/5 rotate-12"><Bot size={80}/></div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 relative z-10">Análise do Oráculo</h4>
                            <p className="text-sm text-slate-300 leading-relaxed italic relative z-10">"{currentResult.explanation}"</p>
                        </div>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setScreen(AppScreen.HOME)} 
                                className="flex-1 py-5 bg-slate-900 border border-white/10 text-white font-bold rounded-2xl active:scale-95 transition-transform"
                            >
                                VOLTAR
                            </button>
                            <button 
                                onClick={() => handleGenerate(currentResult.strategy, currentResult.strategy === StrategyType.PERSONAL_MYSTIC)} 
                                className="flex-[2] py-5 bg-yellow-500 text-slate-950 font-black rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <Dices size={20}/> NOVO JOGO
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {screen === AppScreen.PERSONALIZED && (
            <div className="animate-in slide-in-from-right duration-300 space-y-8 pt-4">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setScreen(AppScreen.HOME)} className="p-2 bg-slate-900 rounded-xl text-slate-400"><ChevronLeft/></button>
                    <h2 className="text-xl font-bold brand-font">Gerador Personalizado</h2>
                </div>

                <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data de Nascimento</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18}/>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500/50 outline-none" 
                                    value={prefs.birthDate}
                                    onChange={e => setPrefs({...prefs, birthDate: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seu Número da Sorte</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={18}/>
                                <input 
                                    type="number" 
                                    placeholder="Ex: 7, 13, 22..."
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-green-500/50 outline-none" 
                                    value={prefs.luckyNumber}
                                    onChange={e => setPrefs({...prefs, luckyNumber: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Palavra de Poder / Desejo</label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={18}/>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Prosperidade, Saúde..."
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-purple-500/50 outline-none" 
                                    value={prefs.mysticWord}
                                    onChange={e => setPrefs({...prefs, mysticWord: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-2xl">
                        <p className="text-[10px] text-blue-300 text-center leading-relaxed">
                            <Sparkles size={12} className="inline mr-1 mb-1"/> 
                            A IA cruzará os dados de <b>{prefs.name}</b> com os ciclos estatísticos da <b>{GAMES[selectedGame].name}</b> para criar sua combinação única.
                        </p>
                    </div>

                    <button 
                        onClick={() => handleGenerate(StrategyType.PERSONAL_MYSTIC, true)}
                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3"
                    >
                        <Sparkles size={22} />
                        GERAR COM MINHA SORTE
                    </button>
                </div>
            </div>
        )}

        {/* Telas Secundárias */}
        {screen === AppScreen.BOLAO && <BolaoScreen setScreen={setScreen} user={currentUser!} isPremium={isPremium()} onOpenPremium={() => setIsPremiumModalOpen(true)} />}
        {screen === AppScreen.AI_AGENT && <AiAgentScreen setScreen={setScreen} isPremium={isPremium()} credits={credits} deductCredit={decrementCredits} openPremium={() => setIsPremiumModalOpen(true)} />}
        {screen === AppScreen.STORE && <StoreScreen setScreen={setScreen} onSelectPlan={setPaymentPlan} />}
        {screen === AppScreen.HISTORY && renderHistory()}
        {screen === AppScreen.STATS && <StatsPanel setScreen={setScreen} game={selectedGame} />}
        {screen === AppScreen.REFERRAL && <ReferralScreen setScreen={setScreen} user={currentUser!} />}
        {screen === AppScreen.ADMIN && <AdminPanel onClose={() => setScreen(AppScreen.HOME)} />}
      </main>

      {renderBottomNav()}
    </div>
  );

  function ActionCard({ icon, title, desc, onClick }: any) {
    return (
        <button onClick={onClick} className="p-5 bg-slate-900/50 border border-white/5 rounded-[2rem] text-left hover:bg-slate-800 transition-all group active:scale-95">
            <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">{icon}</div>
            <h4 className="font-bold text-white text-sm">{title}</h4>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">{desc}</p>
        </button>
    );
  }

  function renderHistory() { 
      return (
        <div className="animate-in slide-in-from-bottom space-y-6 pt-4">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setScreen(AppScreen.HOME)} className="p-2 bg-slate-900 rounded-xl text-slate-400"><ChevronLeft/></button>
                <h2 className="text-xl font-bold brand-font">Seu Histórico</h2>
            </div>
            
            {history.length === 0 ? (
                <div className="bg-slate-900/50 border border-white/5 p-10 rounded-3xl text-center text-slate-500">Nenhum jogo gerado ainda.</div>
            ) : (
                <div className="space-y-4">
                    {history.map((h, i) => (
                        <div key={h.id} className="bg-slate-900/80 p-5 rounded-3xl border border-white/5 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">{h.game}</span>
                                <span className="text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {h.numbers.map(n => <span key={n} className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-300">{n}</span>)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      );
  }
}

export default App;

const Coins = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18.06"/><path d="M7 6h1v4"/><path d="m16.71 13.88.07.41a.5.5 0 0 1-.39.57l-.61.1a.5.5 0 0 0-.39.58l.07.41"/></svg>
);
