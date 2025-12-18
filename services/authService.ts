
import { User, Transaction } from '../types';
import { supabase } from './supabaseClient';

const CURRENT_USER_KEY = 'sortemax_session_v5';

const mapUserFromDB = (u: any): User => ({
    id: u.id || '',
    name: u.name || 'Usuário',
    email: u.email || '',
    phone: u.phone || '',
    password: u.password || '',
    credits: typeof u.credits === 'number' ? u.credits : 5,
    // Charlie é o único administrador
    isAdmin: u.name?.toLowerCase() === 'charlie' || !!u.is_admin,
    createdAt: u.created_at || new Date().toISOString(),
    referredBy: u.referred_by || undefined,
    referralCount: typeof u.referral_count === 'number' ? u.referral_count : 0,
    premiumExpiresAt: typeof u.premium_expires_at === 'number' ? u.premium_expires_at : undefined,
    referralCode: u.referral_code || ''
});

const generateReferralCode = (name: string): string => {
    const firstName = (name || 'User').split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${firstName}${randomNum}`;
};

export const AuthService = {
  
  accessWithName: async (name: string, referralCodeUsed?: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
        const cleanName = name.trim();
        if (!cleanName) return { success: false, message: 'Por favor, digite seu nome.' };

        const localData = localStorage.getItem(CURRENT_USER_KEY);
        if (localData) {
            const existing = JSON.parse(localData);
            const { data: dbUser } = await supabase.from('users').select('*').eq('id', existing.id).single();
            if (dbUser) {
                const user = mapUserFromDB(dbUser);
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                return { success: true, user };
            }
        }

        let initialCredits = 100; // Começa com bastante, mas isPremium forçará infinito
        let referrerId = null;

        if (referralCodeUsed) {
            const { data: referrer } = await supabase.from('users').select('*').eq('referral_code', referralCodeUsed.toUpperCase()).single();
            if (referrer) {
                referrerId = referrer.id;
                await supabase.from('users').update({ 
                    credits: (referrer.credits || 0) + 5,
                    referral_count: (referrer.referral_count || 0) + 1
                }).eq('id', referrer.id);
            }
        }

        const tempEmail = `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@sortemax.app`;

        const { data: newUser, error } = await supabase.from('users').insert([{
            name: cleanName,
            email: tempEmail,
            credits: initialCredits,
            is_admin: cleanName.toLowerCase() === 'charlie',
            referral_code: generateReferralCode(cleanName),
            referred_by: referrerId
        }]).select('*').single();

        if (error) {
            console.error("Erro Supabase:", error);
            return { success: false, message: `Erro no banco: ${error.message}` };
        }

        const user = mapUserFromDB(newUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return { success: true, user };

    } catch (err: any) {
        console.error("Erro Geral Auth:", err);
        return { success: false, message: 'Falha na conexão. Verifique sua internet.' };
    }
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const localData = localStorage.getItem(CURRENT_USER_KEY);
    if (!localData) return null;
    
    try {
        const sessionUser = JSON.parse(localData);
        const { data: dbUser, error } = await supabase.from('users').select('*').eq('id', sessionUser.id).single();
        
        if (error || !dbUser) {
            localStorage.removeItem(CURRENT_USER_KEY);
            return null;
        }
        
        const mapped = mapUserFromDB(dbUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(mapped));
        return mapped;
    } catch (e) {
        return null;
    }
  },

  updateUserCredits: async (userId: string, newCredits: number) => {
    await supabase.from('users').update({ credits: newCredits }).eq('id', userId);
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    return (data || []).map(mapUserFromDB);
  },

  getAllTransactions: async (): Promise<Transaction[]> => {
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    return (data || []).map(t => ({
      id: t.id,
      userId: t.user_id,
      userName: t.user_name,
      planTitle: t.plan_title,
      amount: t.amount,
      status: t.status as any,
      createdAt: t.created_at
    }));
  },

  createPendingTransaction: async (userId: string, userName: string, planTitle: string, amount: number): Promise<string | null> => {
      const { data, error } = await supabase.from('transactions').insert([{
          user_id: userId,
          user_name: userName,
          plan_title: planTitle,
          amount: amount,
          status: 'pending'
      }]).select('id').single();
      return data?.id || null;
  },

  checkTransactionStatus: async (transactionId: string): Promise<'pending' | 'approved' | 'failed'> => {
      const { data } = await supabase.from('transactions').select('status').eq('id', transactionId).single();
      return (data?.status as any) || 'pending';
  },

  setPremiumStatus: async (userId: string, days: number) => {
    const expiration = Date.now() + (days * 24 * 60 * 60 * 1000);
    await supabase.from('users').update({ premium_expires_at: expiration }).eq('id', userId);
  },

  deleteUser: async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
  },

  updateUserPassword: async (userId: string, newPass: string) => {
    await supabase.from('users').update({ password: newPass }).eq('id', userId);
  },

  adminCreateUser: async (name: string, email: string, phone: string, password?: string) => {
    const { error } = await supabase.from('users').insert([{
        name, email, credits: 5, referral_code: generateReferralCode(name)
    }]);
    return { success: !error, message: error?.message };
  },

  adminApproveTransaction: async (txId: string, userId: string, credits: number) => {
    await supabase.from('transactions').update({ status: 'approved' }).eq('id', txId);
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (user) {
        if (credits === -1) {
            const exp = Date.now() + (30 * 24 * 60 * 60 * 1000);
            await supabase.from('users').update({ premium_expires_at: exp }).eq('id', userId);
        } else {
            await supabase.from('users').update({ credits: (user.credits || 0) + credits }).eq('id', userId);
        }
    }
  },

  adminRejectTransaction: async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
  },

  getUserByEmail: async (email: string) => {
    const { data } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (!data) return null;
    const user = mapUserFromDB(data);
    return { ...user, isPremium: true }; // Todos são premium por email também
  }
};
