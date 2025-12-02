
import { User, Transaction } from '../types';
import { supabase } from './supabaseClient';

const CURRENT_USER_KEY = 'sortemax_current_session_v4';

// Helper: Mapear colunas do Banco de Dados (snake_case) para tipos do App (camelCase)
const mapUserFromDB = (u: any): User => ({
    id: u.id || '',
    name: u.name || 'Usuário',
    email: u.email || '',
    phone: u.phone || '',
    password: u.password || '',
    credits: typeof u.credits === 'number' ? u.credits : 5,
    isAdmin: !!u.is_admin,
    createdAt: u.created_at || new Date().toISOString(),
    referralCode: u.referral_code || '',
    referredBy: u.referred_by || undefined,
    referralCount: typeof u.referral_count === 'number' ? u.referral_count : 0,
    premiumExpiresAt: typeof u.premium_expires_at === 'number' ? u.premium_expires_at : undefined
});

const generateReferralCode = (name: string): string => {
    const firstName = (name || 'User').split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${firstName}${randomNum}`;
};

export const AuthService = {
  
  // LOGIN: Verifica email e senha no Supabase
  login: async (email: string, pass: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', pass)
            .single();

        if (error || !data) {
            console.warn("Auth Error:", error);
            return { success: false, message: 'E-mail ou senha incorretos.' };
        }

        const user = mapUserFromDB(data);
        
        // Atualizar last_login
        await supabase.from('users').update({ last_login: new Date() }).eq('id', user.id);
        
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return { success: true, user };

    } catch (err) {
        console.error(err);
        return { success: false, message: 'Erro de conexão com o banco.' };
    }
  },

  // REGISTER: Cria usuário no Supabase
  register: async (name: string, email: string, phone: string, pass: string, referralCodeUsed?: string): Promise<{ success: boolean; message?: string }> => {
    try {
        // Verificar se e-mail já existe
        const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
        if (existing) {
            return { success: false, message: 'Este e-mail já está cadastrado.' };
        }

        let initialCredits = 5;
        let referrerId = null;

        // Verificar Código de Indicação
        if (referralCodeUsed) {
            const { data: referrer } = await supabase.from('users').select('*').eq('referral_code', referralCodeUsed.toUpperCase()).single();
            if (referrer) {
                referrerId = referrer.id;
                initialCredits = 10; // Bônus para novo usuário (5 padrão + 5 bônus)
                
                // Dar 5 créditos para quem indicou
                await supabase
                    .from('users')
                    .update({ 
                        credits: (referrer.credits || 0) + 5,
                        referral_count: (referrer.referral_count || 0) + 1
                    })
                    .eq('id', referrer.id);
            }
        }

        // Criar Usuário no Banco
        const { error } = await supabase.from('users').insert([{
            name: name,
            email: email,
            phone: phone,
            password: pass,
            credits: initialCredits,
            is_admin: false,
            referral_code: generateReferralCode(name),
            referred_by: referrerId,
            referral_count: 0
        }]);

        if (error) throw error;
        return { success: true };

    } catch (err: any) {
        console.error(err);
        return { success: false, message: err.message || 'Erro ao criar conta.' };
    }
  },

  // ADMIN: Criar Usuário Manualmente
  adminCreateUser: async (name: string, email: string, phone: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
         const { error } = await supabase.from('users').insert([{
            name,
            email,
            phone,
            password: pass,
            credits: 5,
            is_admin: false,
            referral_code: generateReferralCode(name),
            referral_count: 0
        }]);
        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Obter usuário atual (Sincroniza Sessão Local com Banco Remoto)
  getCurrentUser: async (): Promise<User | null> => {
    const localData = localStorage.getItem(CURRENT_USER_KEY);
    if (!localData) return null;
    
    try {
        const sessionUser = JSON.parse(localData) as User;

        // Refresh silencioso: busca dados atualizados no banco
        const { data: dbUser, error } = await supabase.from('users').select('*').eq('id', sessionUser.id).single();
        
        // Se houve erro (ex: usuário não existe no banco novo) ou não encontrou
        if (error || !dbUser) {
            console.warn("Sessão inválida: Usuário local não existe no DB. Limpando...");
            localStorage.removeItem(CURRENT_USER_KEY);
            return null;
        }
        
        const mapped = mapUserFromDB(dbUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(mapped)); // Atualiza cache local
        return mapped;
    } catch (e) {
        console.error("Erro ao validar sessão:", e);
        // Se o JSON estiver quebrado ou ID inválido
        localStorage.removeItem(CURRENT_USER_KEY);
        return null;
    }
  },

  // ADMIN: Obter todos os usuários
  getAllUsers: async (): Promise<User[]> => {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(mapUserFromDB);
  },

  // ATUALIZAÇÕES DE DADOS
  updateUserCredits: async (userId: string, newCredits: number) => {
    await supabase.from('users').update({ credits: newCredits }).eq('id', userId);
  },

  updateUserPassword: async (userId: string, newPass: string) => {
    await supabase.from('users').update({ password: newPass }).eq('id', userId);
  },

  setPremiumStatus: async (userId: string, days: number) => {
    // Busca usuário atual para saber se já tem premium
    const { data: user } = await supabase.from('users').select('premium_expires_at').eq('id', userId).single();
    
    let currentExpiry = 0;
    if (user && user.premium_expires_at) {
        currentExpiry = user.premium_expires_at;
    }

    // Se já for premium (data futura), soma dias. Se não, começa de agora.
    const baseDate = currentExpiry > Date.now() ? currentExpiry : Date.now();
    const expiration = baseDate + (days * 24 * 60 * 60 * 1000);

    await supabase.from('users').update({ premium_expires_at: expiration }).eq('id', userId);
  },
  
  deleteUser: async (userId: string) => {
    await supabase.from('users').delete().eq('id', userId);
  },

  // === TRANSAÇÕES (FINANCEIRO) ===

  // 1. Criar Transação Pendente (antes de ir para o checkout)
  createPendingTransaction: async (userId: string, userName: string, planTitle: string, amount: number): Promise<string | null> => {
      const { data, error } = await supabase.from('transactions').insert([{
          user_id: userId,
          user_name: userName,
          plan_title: planTitle,
          amount: amount,
          status: 'pending' // Status inicial
      }]).select('id').single();

      if (error) {
          console.error("Erro criar transacao", error);
          return null;
      }
      return data.id;
  },

  // 2. Verificar status da transação (Polling)
  checkTransactionStatus: async (transactionId: string): Promise<'pending' | 'approved' | 'failed'> => {
      const { data } = await supabase.from('transactions').select('status').eq('id', transactionId).single();
      return data?.status || 'pending';
  },

  // 3. ADMIN: Aprovar Transação Manualmente (Simula o Webhook)
  adminApproveTransaction: async (transactionId: string, userId: string, planCredits: number) => {
      // 1. Marcar como pago
      await supabase.from('transactions').update({ status: 'approved' }).eq('id', transactionId);
      
      // 2. Liberar benefícios
      const { data: user } = await supabase.from('users').select('credits, premium_expires_at').eq('id', userId).single();
      
      if (user) {
          if (planCredits === -1) {
              // Premium (30 dias) - Lógica de soma
              const currentExpiry = user.premium_expires_at || 0;
              const baseDate = currentExpiry > Date.now() ? currentExpiry : Date.now();
              const expiration = baseDate + (30 * 24 * 60 * 60 * 1000);
              
              await supabase.from('users').update({ premium_expires_at: expiration }).eq('id', userId);
          } else {
              // Créditos (Soma)
              await supabase.from('users').update({ credits: user.credits + planCredits }).eq('id', userId);
          }
      }
  },

  // ADMIN: Cancelar/Excluir Transação
  adminRejectTransaction: async (transactionId: string) => {
      await supabase.from('transactions').delete().eq('id', transactionId);
  },

  // ADMIN: Obter todas as vendas
  getAllTransactions: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      
      return data.map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          userName: t.user_name,
          planTitle: t.plan_title,
          amount: t.amount,
          status: t.status,
          createdAt: t.created_at
      }));
  }
};
