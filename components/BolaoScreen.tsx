
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, Clock, Ticket, Trophy, Plus, Lock, Share2, Crown, ShieldAlert, CheckCircle, XCircle, MessageSquare, Send, Save, Trash2, Dices, Loader2, Phone, Mail, HandCoins, AlertCircle } from 'lucide-react';
import { AppScreen, Bolao, GameType, User, BolaoParticipant, BolaoChatMessage, StrategyType } from '../types';
import { BolaoService } from '../services/bolaoService';
import { AuthService } from '../services/authService';
import { GAMES, generateByStrategy } from '../services/lotteryLogic';

interface BolaoScreenProps {
  setScreen: (screen: AppScreen) => void;
  user: User;
  isPremium: boolean;
  onOpenPremium: () => void;
}

export const BolaoScreen: React.FC<BolaoScreenProps> = ({ setScreen, user, isPremium, onOpenPremium }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'create' | 'manage'>('feed');
  const [boloes, setBoloes] = useState<Bolao[]>([]);
  const [selectedBolao, setSelectedBolao] = useState<string | null>(null);
  
  // Create Form State
  const [newBolao, setNewBolao] = useState({ title: '', game: GameType.MEGA_SENA, totalShares: 10, price: 10, description: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Manage State
  const [participants, setParticipants] = useState<BolaoParticipant[]>([]);
  const [currentBolaoData, setCurrentBolaoData] = useState<Bolao | null>(null);
  const [chatMessages, setChatMessages] = useState<BolaoChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Add Participant Form (Agora usa EMAIL)
  const [newPartEmail, setNewPartEmail] = useState('');
  const [newPartShares, setNewPartShares] = useState(1);
  const [isAddingPart, setIsAddingPart] = useState(false);
  
  // Delete Loading State
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
      loadFeed();
  }, []);

  useEffect(() => {
      if (selectedBolao) {
          loadBolaoDetails(selectedBolao);
          // Polling chat
          const interval = setInterval(() => loadChat(selectedBolao), 3000); // 3s polling
          return () => clearInterval(interval);
      }
  }, [selectedBolao]);

  // Auto-scroll chat
  useEffect(() => {
      if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [chatMessages]);

  const loadFeed = async () => {
      const data = await BolaoService.getActiveBoloes();
      setBoloes(data);
  };

  const loadBolaoDetails = async (id: string) => {
      const { bolao, participants } = await BolaoService.getBolaoDetails(id);
      setCurrentBolaoData(bolao);
      setParticipants(participants);
      loadChat(id);
  };

  const loadChat = async (id: string) => {
      const msgs = await BolaoService.getChatMessages(id);
      setChatMessages(prev => {
          if (prev.length !== msgs.length) return msgs;
          return prev;
      });
  };

  const handleCreate = async () => {
      if (!termsAccepted) {
          alert("Você deve aceitar os termos de responsabilidade.");
          return;
      }
      if (!newBolao.title.trim()) {
          alert("Digite um título para o bolão.");
          return;
      }
      if (newBolao.price <= 0 || newBolao.totalShares <= 0) {
          alert("Valores inválidos para cotas ou preço.");
          return;
      }

      setIsCreating(true);
      const res = await BolaoService.createBolao(user.id, newBolao.title, newBolao.game, newBolao.totalShares, newBolao.price, newBolao.description);
      setIsCreating(false);

      if (res.success) {
          alert("Bolão criado com sucesso!");
          setNewBolao({ title: '', game: GameType.MEGA_SENA, totalShares: 10, price: 10, description: '' });
          setTermsAccepted(false);
          loadFeed();
          setActiveTab('feed');
      } else {
          alert("Erro ao criar: " + res.message);
      }
  };

  const handleAddParticipant = async () => {
      if (!selectedBolao) return;
      if (!newPartEmail.trim()) {
          alert("Digite o e-mail do usuário.");
          return;
      }
      
      setIsAddingPart(true);
      
      // 1. Buscar usuário por E-mail
      const foundUser = await AuthService.getUserByEmail(newPartEmail);
      
      if (!foundUser) {
          alert("Usuário não encontrado com este e-mail.");
          setIsAddingPart(false);
          return;
      }

      // 2. Verificar se é Premium
      if (!foundUser.isPremium) {
          alert(`O usuário ${foundUser.name} não é Premium. Apenas membros Premium podem participar.`);
          setIsAddingPart(false);
          return;
      }

      // 3. Adicionar na Lista
      await BolaoService.addParticipant(selectedBolao, foundUser.name, newPartShares, foundUser.id); 
      setNewPartEmail('');
      setNewPartShares(1);
      setIsAddingPart(false);
      loadBolaoDetails(selectedBolao);
      alert(`${foundUser.name} adicionado com sucesso!`);
  };

  const handleTogglePaid = async (pId: string, current: boolean) => {
      await BolaoService.togglePayment(pId, current);
      if (selectedBolao) loadBolaoDetails(selectedBolao);
  };

  const handleIndicatePayment = async (pId: string) => {
      if (confirm("Confirmar que você realizou o PIX para o organizador?")) {
        await BolaoService.indicatePayment(pId);
        if (selectedBolao) loadBolaoDetails(selectedBolao);
      }
  }

  const handleDeleteParticipant = async (pId: string, isPaid: boolean) => {
      if (isPaid) {
          alert("Segurança: Não é possível remover um participante que já pagou. Desmarque o pagamento primeiro.");
          return;
      }
      if (confirm("Tem certeza que deseja remover este participante?")) {
          setIsDeletingId(pId);
          const res = await BolaoService.removeParticipant(pId);
          setIsDeletingId(null);
          
          if (res.success) {
             // Forçar recarregamento imediato
             if (selectedBolao) await loadBolaoDetails(selectedBolao);
          } else {
              alert("Erro ao excluir: " + res.message);
          }
      }
  };

  const handleDeleteBolao = async () => {
      if (!selectedBolao) return;
      if (participants.length > 0) {
          alert("Não é possível excluir um bolão com participantes. Remova-os primeiro.");
          return;
      }
      if (confirm("Deseja excluir este bolão permanentemente?")) {
          const res = await BolaoService.deleteBolao(selectedBolao);
          if (res.success) {
              setSelectedBolao(null);
              loadFeed();
          } else {
              alert("Erro ao excluir bolão: " + res.message);
          }
      }
  }

  const handleSendMessage = async () => {
      if (!selectedBolao || !newMessage.trim()) return;
      
      const msgToSend = newMessage;
      setNewMessage(''); 
      
      await BolaoService.sendMessage(selectedBolao, user.id, msgToSend);
      loadChat(selectedBolao);
  };
  
  const handleGenerateGame = async () => {
      if (!selectedBolao || !currentBolaoData) return;
      const gameConfig = GAMES[currentBolaoData.game as GameType];
      const result = generateByStrategy(currentBolaoData.game, StrategyType.SMART, gameConfig.defaultCount);
      
      await BolaoService.saveGeneratedNumbers(selectedBolao, result.numbers);
      loadBolaoDetails(selectedBolao);
      alert("Números gerados e salvos no bolão!");
  };

  const openWhatsApp = (phone: string, title: string) => {
      const message = `Olá, vi seu bolão "${title}" no SorteMax e gostaria de participar! Qual a chave PIX?`;
      const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  // RENDER VIEW FOR A SINGLE BOLAO
  if (selectedBolao && currentBolaoData) {
      const isOwner = currentBolaoData.creator_id === user.id;
      const isParticipant = participants.some(p => p.user_id === user.id);
      const myParticipantData = participants.find(p => p.user_id === user.id);
      const canChat = isOwner || isParticipant;

      return (
          <div className="min-h-screen bg-slate-950 pb-20 animate-in fade-in">
              <div className="p-4 bg-slate-900 border-b border-white/10 sticky top-0 z-10 flex items-center gap-3">
                  <button onClick={() => setSelectedBolao(null)} className="text-slate-400 hover:text-white"><ArrowLeft /></button>
                  <div className="flex-1">
                      <h2 className="font-bold text-white text-lg">{currentBolaoData.title}</h2>
                      <span className="text-xs text-fuchsia-400 font-bold uppercase">{currentBolaoData.game}</span>
                  </div>
                  {isOwner && (
                      <div className="flex gap-2">
                        {participants.length === 0 && (
                            <button onClick={handleDeleteBolao} className="bg-red-900/50 text-red-500 p-2 rounded hover:bg-red-900" title="Excluir Bolão">
                                <Trash2 size={16}/>
                            </button>
                        )}
                        <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded flex items-center">GESTOR</span>
                      </div>
                  )}
              </div>
              
              <div className="p-4 space-y-6">
                  {/* ORGANIZER INFO */}
                  {!isOwner && (
                      <div className="bg-slate-900 border border-fuchsia-500/30 p-4 rounded-xl flex items-center justify-between">
                          <div>
                              <div className="text-[10px] text-slate-500 uppercase font-bold">Organizado por</div>
                              <div className="text-white font-bold">{currentBolaoData.creator_name || 'Usuário SorteMax'}</div>
                          </div>
                          {currentBolaoData.creator_phone ? (
                              <button 
                                onClick={() => openWhatsApp(currentBolaoData.creator_phone!, currentBolaoData.title)}
                                className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2"
                              >
                                  <Phone size={14} /> WhatsApp
                              </button>
                          ) : (
                              <div className="text-xs text-slate-500">Sem contato</div>
                          )}
                      </div>
                  )}

                  {/* STATS */}
                  <div className="grid grid-cols-3 gap-2">
                       <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                           <div className="text-slate-500 text-[10px] uppercase">Cotas</div>
                           <div className="text-white font-bold">{currentBolaoData.shares_sold} / {currentBolaoData.total_shares}</div>
                       </div>
                       <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                           <div className="text-slate-500 text-[10px] uppercase">Valor Ref.</div>
                           <div className="text-green-400 font-bold">R$ {currentBolaoData.price_per_share}</div>
                       </div>
                       <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                           <div className="text-slate-500 text-[10px] uppercase">Status</div>
                           <div className="text-white font-bold uppercase">{currentBolaoData.status === 'open' ? 'Aberto' : 'Fechado'}</div>
                       </div>
                  </div>
                  
                  {/* GENERATED NUMBERS */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-white text-sm">Jogo do Bolão</h3>
                          {isOwner && (
                              <button onClick={handleGenerateGame} className="text-[10px] bg-fuchsia-600 text-white px-2 py-1 rounded flex items-center gap-1">
                                  <Dices size={12}/> Gerar
                              </button>
                          )}
                      </div>
                      {currentBolaoData.generated_numbers ? (
                          <div className="flex flex-wrap gap-2">
                              {JSON.parse(currentBolaoData.generated_numbers).map((n: number) => (
                                  <span key={n} className="w-8 h-8 bg-slate-200 text-slate-900 rounded-full flex items-center justify-center font-bold text-sm shadow">
                                      {n}
                                  </span>
                              ))}
                          </div>
                      ) : (
                          <div className="text-xs text-slate-500 italic">Nenhum jogo gerado ainda.</div>
                      )}
                  </div>

                  {/* PARTICIPANTS MANAGEMENT */}
                  <div>
                      <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                          <Users size={16}/> Participantes
                      </h3>
                      
                      {isOwner && (
                          <div className="flex gap-2 mb-4">
                              <div className="flex-1 relative">
                                  <Mail size={14} className="absolute left-3 top-3 text-slate-500"/>
                                  <input 
                                    value={newPartEmail} onChange={e=>setNewPartEmail(e.target.value)}
                                    placeholder="E-mail do usuário" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white"
                                  />
                              </div>
                              <input 
                                type="number" value={newPartShares} onChange={e=>setNewPartShares(parseInt(e.target.value))}
                                className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white text-center"
                              />
                              <button onClick={handleAddParticipant} disabled={isAddingPart} className="bg-green-600 text-white p-2 rounded-lg disabled:opacity-50">
                                  {isAddingPart ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                              </button>
                          </div>
                      )}

                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {participants.length === 0 && <div className="text-xs text-slate-500 italic">Nenhum participante adicionado.</div>}
                          {participants.map(p => (
                              <div key={p.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                                  <div>
                                      <div className="text-white text-sm font-bold flex items-center gap-2">
                                        {p.name}
                                        {p.has_indicated_payment && !p.is_paid && (
                                            <span className="text-yellow-500 animate-pulse" title="Informou pagamento">
                                                <AlertCircle size={14} />
                                            </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-slate-500">{p.shares_count} cota(s) • R$ {(p.shares_count * currentBolaoData.price_per_share).toFixed(2)}</div>
                                      
                                      {/* BOTÃO PARA PARTICIPANTE INFORMAR PAGAMENTO */}
                                      {!isOwner && p.user_id === user.id && !p.is_paid && !p.has_indicated_payment && (
                                          <button 
                                            onClick={() => handleIndicatePayment(p.id)}
                                            className="mt-2 text-[10px] bg-yellow-600/30 text-yellow-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-yellow-600/50"
                                          >
                                              <HandCoins size={12} /> Informar que paguei
                                          </button>
                                      )}
                                      {!isOwner && p.user_id === user.id && p.has_indicated_payment && !p.is_paid && (
                                          <div className="mt-1 text-[10px] text-yellow-500 font-bold">Pagamento em análise...</div>
                                      )}
                                  </div>

                                  {/* GESTÃO DO DONO */}
                                  {isOwner ? (
                                      <div className="flex items-center gap-2">
                                          <button 
                                            onClick={() => handleTogglePaid(p.id, p.is_paid)}
                                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${p.is_paid ? 'bg-green-900/20 border-green-500 text-green-500' : 'bg-red-900/20 border-red-500 text-red-500'}`}
                                          >
                                              {p.is_paid ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                                              {p.is_paid ? 'PAGO' : 'PEND'}
                                          </button>
                                          
                                          {/* Lixeira só aparece se NÃO pagou */}
                                          {!p.is_paid && (
                                              <button 
                                                onClick={() => handleDeleteParticipant(p.id, p.is_paid)}
                                                disabled={isDeletingId === p.id}
                                                className="text-slate-600 hover:text-red-500 p-1"
                                                title="Remover Participante"
                                              >
                                                  {isDeletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                              </button>
                                          )}
                                      </div>
                                  ) : (
                                      <div className={`text-[10px] font-bold px-2 py-1 rounded ${p.is_paid ? 'text-green-500' : 'text-red-500'}`}>
                                          {p.is_paid ? 'CONFIRMADO' : 'AGUARDANDO'}
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  {/* CHAT */}
                  <div className="h-72 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                      <div className="p-2 bg-slate-800 border-b border-slate-700 text-xs font-bold text-slate-400 flex items-center gap-2">
                          <MessageSquare size={12}/> Chat do Grupo {canChat ? '' : '(Restrito a membros)'}
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950/50">
                          {canChat ? (
                              chatMessages.length === 0 ? (
                                  <div className="text-center text-xs text-slate-600 italic mt-10">Sem mensagens ainda.</div>
                              ) : (
                                  chatMessages.map(msg => (
                                    <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[9px] text-slate-500 mb-0.5 px-1">{msg.user_name}</span>
                                        <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs shadow-md ${msg.user_id === user.id ? 'bg-fuchsia-900 text-white rounded-tr-none' : 'bg-slate-800 text-slate-300 rounded-tl-none'}`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                  ))
                              )
                          ) : (
                              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 p-4 text-center">
                                  <Lock size={24} />
                                  <p className="text-xs">Para ver e enviar mensagens, solicite ao organizador para adicionar você à lista de participantes.</p>
                              </div>
                          )}
                          <div ref={chatEndRef} />
                      </div>
                      
                      {canChat && (
                        <div className="p-2 bg-slate-800 border-t border-slate-700 flex gap-2">
                            <input 
                                value={newMessage} 
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-fuchsia-500 outline-none" 
                                placeholder="Digite sua mensagem..."
                            />
                            <button onClick={handleSendMessage} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white p-2 rounded-lg transition-colors">
                                <Send size={16}/>
                            </button>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // MAIN LIST SCREEN (FEED)
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
            Bolões
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${activeTab === 'create' ? 'bg-cyan-900/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Novo Bolão
          </button>
      </div>

      <div className="px-4 space-y-6">
        
        {/* FEED TAB */}
        {activeTab === 'feed' && (
            <div className="space-y-4">
                {boloes.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-sm">Nenhum bolão aberto no momento.</div>
                )}
                {boloes.map(bolao => {
                    const progress = (bolao.shares_sold! / bolao.total_shares) * 100;
                    return (
                        <div key={bolao.id} onClick={() => setSelectedBolao(bolao.id)} className="relative group bg-slate-900/80 border border-slate-800 hover:border-fuchsia-500/50 rounded-2xl overflow-hidden cursor-pointer">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fuchsia-500 to-cyan-500"></div>
                            
                            {bolao.creator_id === user.id && (
                                <div className="absolute top-0 right-0 bg-yellow-600 text-[9px] font-bold px-3 py-1 rounded-bl-xl text-black shadow-lg">
                                    SEU BOLÃO
                                </div>
                            )}

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{bolao.title}</h3>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">{bolao.game}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-500 uppercase">Por Cota</div>
                                        <div className="font-bold text-green-400">R$ {bolao.price_per_share}</div>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                        <span>Ocupação</span>
                                        <span className="text-cyan-400">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500"></div>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 flex justify-between items-end">
                                     <span>{bolao.shares_sold} / {bolao.total_shares} cotas</span>
                                     <div className="text-right">
                                         <span className="block text-[9px] text-slate-600 uppercase">Org. por</span>
                                         <span className="text-white font-bold text-[10px]">{bolao.creator_name || 'Usuário'}</span>
                                     </div>
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
                        <Lock className="text-slate-500 w-8 h-8 mx-auto" />
                        <h3 className="text-xl font-bold text-white">Recurso Premium</h3>
                        <p className="text-sm text-slate-400">
                            Apenas membros Premium podem organizar bolões.
                        </p>
                        <button onClick={onOpenPremium} className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl font-bold text-slate-900 mt-4">
                            SEJA PREMIUM
                        </button>
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-cyan-500/20 rounded-2xl p-6 space-y-6">
                        <div className="text-center mb-4">
                             <h3 className="text-lg font-bold text-white">Organizar Novo Bolão</h3>
                             <p className="text-xs text-slate-500">Ferramenta de gestão para grupos</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-cyan-400 font-bold uppercase ml-1">Título</label>
                                <input value={newBolao.title} onChange={e => setNewBolao({...newBolao, title: e.target.value})} type="text" placeholder="Ex: Bolão da Firma" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase ml-1">Jogo</label>
                                    <select value={newBolao.game} onChange={e => setNewBolao({...newBolao, game: e.target.value as GameType})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none">
                                        {Object.values(GAMES).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase ml-1">Cotas</label>
                                    <input type="number" value={newBolao.totalShares} onChange={e => setNewBolao({...newBolao, totalShares: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase ml-1">Preço Sugerido (R$)</label>
                                <input type="number" value={newBolao.price} onChange={e => setNewBolao({...newBolao, price: parseFloat(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                            </div>

                            <div className="bg-red-900/10 border border-red-500/30 p-3 rounded-lg flex items-start gap-3">
                                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1" />
                                <div className="text-[10px] text-red-200">
                                    <span className="font-bold">Termo de Isenção:</span> Declaro que este app é apenas uma ferramenta de organização. 
                                    Eu, como organizador, sou totalmente responsável por receber os valores, comprar os bilhetes na lotérica e distribuir os prêmios. 
                                    O app não processa pagamentos nem garante apostas.
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleCreate} 
                                disabled={isCreating}
                                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCreating && <Loader2 size={18} className="animate-spin" />}
                                {isCreating ? "CRIANDO..." : "CRIAR BOLÃO"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
