
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, BarChart3, LogOut, Search, UserCheck, Smartphone, Key, Crown, Coins, X, Save, UserPlus, DollarSign, CheckCircle, Clock, Trash } from 'lucide-react';
import { AuthService } from '../services/authService';
import { User, Transaction } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'sales'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [passwordPrompt, setPasswordPrompt] = useState<{id: string, name: string} | null>(null);
  const [newPassInput, setNewPassInput] = useState('');
  
  const [creditPrompt, setCreditPrompt] = useState<{id: string, name: string, current: number} | null>(null);
  const [newCreditInput, setNewCreditInput] = useState('');

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', phone: '', password: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const uData = await AuthService.getAllUsers();
    const tData = await AuthService.getAllTransactions();
    setUsers(uData);
    setTransactions(tData);
    setLoading(false);
  };

  // --- ACTIONS ---

  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await AuthService.adminCreateUser(newUserForm.name, newUserForm.email, newUserForm.phone, newUserForm.password);
      if (res.success) {
          alert("Usuário criado!");
          setShowCreateUser(false);
          setNewUserForm({ name: '', email: '', phone: '', password: '' });
          loadData();
      } else {
          alert(res.message);
      }
  };

  const handleUpdateCredits = async () => {
      if (creditPrompt && newCreditInput) {
          await AuthService.updateUserCredits(creditPrompt.id, parseInt(newCreditInput));
          setCreditPrompt(null);
          setNewCreditInput('');
          loadData();
      }
  };

  const deleteUser = async (id: string) => {
      if(confirm('ATENÇÃO: Isso excluirá o usuário. Continuar?')) {
          await AuthService.deleteUser(id);
          loadData();
      }
  };

  const handlePasswordChange = async () => {
      if (passwordPrompt && newPassInput) {
          await AuthService.updateUserPassword(passwordPrompt.id, newPassInput);
          alert(`Senha alterada!`);
          setPasswordPrompt(null);
          setNewPassInput('');
      }
  };

  const handleSetPremium = async (userId: string) => {
      if (confirm("Dar 30 dias de Premium?")) {
          await AuthService.setPremiumStatus(userId, 30);
          loadData();
      }
  };

  // Aprovar Transação Pendente Manualmente
  const handleApproveTransaction = async (t: Transaction) => {
      if (confirm(`Confirmar pagamento de R$ ${t.amount} para ${t.userName}?`)) {
          // Determinar créditos baseado no título (logica simples, idealmente viria do ID do plano)
          let creditsToAdd = 0;
          if (t.planTitle.includes('Mini')) creditsToAdd = 20;
          if (t.planTitle.includes('Médio')) creditsToAdd = 60;
          if (t.planTitle.includes('Turbo')) creditsToAdd = 150;
          if (t.planTitle.includes('Premium')) creditsToAdd = -1; // Flag premium

          await AuthService.adminApproveTransaction(t.id, t.userId, creditsToAdd);
          alert("Transação aprovada e benefícios liberados!");
          loadData();
      }
  };

  const handleRejectTransaction = async (id: string) => {
      if (confirm('Deseja excluir este registro de venda pendente?')) {
          await AuthService.adminRejectTransaction(id);
          loadData();
      }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Somar apenas Approved
  const totalRevenue = transactions
    .filter(t => t.status === 'approved')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto animate-in slide-in-from-bottom duration-300 font-sans">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-white/10 p-4 sticky top-0 flex justify-between items-center z-10 shadow-xl">
            <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2 brand-font">
                <BarChart3 className="text-yellow-500" /> Painel Admin
            </h2>
            <div className="flex gap-2">
                <button onClick={() => setShowCreateUser(true)} className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg font-bold">
                    <UserPlus size={16} /> Novo Cliente
                </button>
                <button onClick={onClose} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm bg-slate-800 py-2 px-4 rounded-lg">
                    <LogOut size={16} /> Sair
                </button>
            </div>
        </div>

        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Clientes Totais</div>
                    <div className="text-3xl font-bold text-white">{users.length}</div>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Assinantes Premium</div>
                    <div className="text-3xl font-bold text-yellow-400">{users.filter(u => u.premiumExpiresAt && u.premiumExpiresAt > Date.now()).length}</div>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Faturamento (Aprovado)</div>
                    <div className="text-3xl font-bold text-green-400">R$ {totalRevenue.toFixed(2)}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-700">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 font-bold text-sm ${activeTab === 'users' ? 'text-white border-b-2 border-yellow-500' : 'text-slate-500'}`}
                >
                    Gerenciar Usuários
                </button>
                <button 
                    onClick={() => setActiveTab('sales')}
                    className={`px-4 py-2 font-bold text-sm ${activeTab === 'sales' ? 'text-white border-b-2 border-green-500' : 'text-slate-500'}`}
                >
                    Vendas & Transações
                </button>
            </div>

            {/* TAB: USERS */}
            {activeTab === 'users' && (
                <>
                {/* Modals for Users (Create, Pass, Credit) omitted for brevity, logic same as previous */}
                {/* Password Modal */}
                {passwordPrompt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 w-full max-w-sm">
                            <h3 className="text-white font-bold mb-4">Nova senha para {passwordPrompt.name}</h3>
                            <input type="text" value={newPassInput} onChange={(e) => setNewPassInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded mb-4 text-white"/>
                            <div className="flex gap-2">
                                <button onClick={() => setPasswordPrompt(null)} className="flex-1 p-2 bg-slate-800 text-white rounded">Cancelar</button>
                                <button onClick={handlePasswordChange} className="flex-1 p-2 bg-green-600 text-white rounded font-bold">Salvar</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {creditPrompt && (
                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="bg-slate-900 p-6 rounded-xl border border-yellow-500/30 w-full max-w-sm">
                            <h3 className="text-white font-bold text-center mb-4">Gerenciar Créditos</h3>
                            <input type="number" value={newCreditInput} onChange={(e) => setNewCreditInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded mb-4 text-white text-center text-lg font-bold" placeholder="Novo saldo"/>
                            <div className="flex gap-2">
                                <button onClick={() => setCreditPrompt(null)} className="flex-1 p-2 bg-slate-800 text-white rounded">Cancelar</button>
                                <button onClick={handleUpdateCredits} className="flex-1 p-2 bg-yellow-600 text-white rounded font-bold">Atualizar</button>
                            </div>
                        </div>
                     </div>
                )}

                {showCreateUser && (
                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 w-full max-w-md">
                            <h3 className="text-white font-bold mb-4">Novo Cliente</h3>
                            <form onSubmit={handleCreateUser} className="space-y-3">
                                <input placeholder="Nome" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                                <input placeholder="Email" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                                <input placeholder="Senha" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white" />
                                <button type="submit" className="w-full py-2 bg-green-600 text-white font-bold rounded">Salvar</button>
                                <button type="button" onClick={() => setShowCreateUser(false)} className="w-full py-2 bg-slate-800 text-slate-400 rounded">Cancelar</button>
                            </form>
                        </div>
                     </div>
                )}

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Indicação</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Créditos</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-700/30">
                                        <td className="p-4">
                                            <div className="font-medium text-white">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </td>
                                        <td className="p-4 text-xs text-slate-400">{user.referralCode} ({user.referralCount})</td>
                                        <td className="p-4">
                                            {user.premiumExpiresAt && user.premiumExpiresAt > Date.now() ? 
                                                <span className="text-yellow-400 text-xs font-bold">PREMIUM</span> : 
                                                <span className="text-slate-500 text-xs">GRÁTIS</span>
                                            }
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => setCreditPrompt({id: user.id, name: user.name, current: user.credits})} className="font-bold text-green-400 bg-green-900/20 px-2 py-1 rounded">{user.credits}</button>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleSetPremium(user.id)} className="text-xs bg-yellow-600/20 text-yellow-500 px-2 py-1 rounded">Prem</button>
                                            <button onClick={() => setPasswordPrompt({id: user.id, name: user.name})} className="text-xs bg-slate-700 text-white px-2 py-1 rounded">Senha</button>
                                            <button onClick={() => deleteUser(user.id)} className="text-xs bg-red-900/20 text-red-500 px-2 py-1 rounded">X</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                </>
            )}

            {/* TAB: SALES */}
            {activeTab === 'sales' && (
                 <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Item</th>
                                <th className="p-4 text-right">Valor</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {transactions.length === 0 ? (
                                <tr><td colSpan={6} className="p-6 text-center text-slate-500">Nenhuma venda registrada ainda.</td></tr>
                            ) : transactions.map(t => (
                                <tr key={t.id} className={t.status === 'pending' ? 'bg-yellow-900/10' : ''}>
                                    <td className="p-4 text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                    <td className="p-4 text-white text-sm font-bold">{t.userName}</td>
                                    <td className="p-4 text-slate-300 text-sm">{t.planTitle}</td>
                                    <td className="p-4 text-right text-green-400 font-bold">R$ {t.amount.toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        {t.status === 'approved' && <span className="bg-green-900/20 text-green-500 text-[10px] px-2 py-1 rounded uppercase font-bold flex items-center justify-center gap-1"><CheckCircle size={10} /> Pago</span>}
                                        {t.status === 'pending' && <span className="bg-yellow-900/20 text-yellow-500 text-[10px] px-2 py-1 rounded uppercase font-bold flex items-center justify-center gap-1"><Clock size={10} /> Pendente</span>}
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        {t.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApproveTransaction(t)}
                                                    className="bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded"
                                                >
                                                    Aprovar
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectTransaction(t.id)}
                                                    className="bg-red-900/30 hover:bg-red-900/50 text-red-500 text-[10px] font-bold px-2 py-1.5 rounded"
                                                >
                                                    <Trash size={12} />
                                                </button>
                                            </>
                                        )}
                                        {t.status !== 'pending' && (
                                            <button 
                                                onClick={() => handleRejectTransaction(t.id)}
                                                className="text-slate-600 hover:text-red-500 transition-colors"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            )}
        </div>
    </div>
  );
};
