
import { supabase } from './supabaseClient';
import { Bolao, BolaoParticipant, BolaoChatMessage, GameType } from '../types';

export const BolaoService = {
    
    // 1. LISTAR BOLÕES (Feed Público)
    getActiveBoloes: async (): Promise<Bolao[]> => {
        // Agora fazemos JOIN com a tabela users para pegar nome e telefone do criador
        const { data, error } = await supabase
            .from('boloes')
            .select(`
                *,
                users (name, phone),
                bolao_participantes (count)
            `)
            .eq('status', 'open')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro listar bolões", error);
            return [];
        }

        // Calcular cotas vendidas e mapear dados do criador
        const bolosComCotas = await Promise.all(data.map(async (b: any) => {
            const { data: parts } = await supabase
                .from('bolao_participantes')
                .select('shares_count')
                .eq('bolao_id', b.id);
            
            const totalSold = parts?.reduce((acc, curr) => acc + (curr.shares_count || 1), 0) || 0;
            
            return {
                ...b,
                pricePerShare: b.price_per_share, // map snake_case
                totalShares: b.total_shares,
                shares_sold: totalSold,
                creator_name: b.users?.name,
                creator_phone: b.users?.phone
            };
        }));

        return bolosComCotas;
    },

    // 2. CRIAR BOLÃO (Microgestor)
    createBolao: async (
        creatorId: string, 
        title: string, 
        game: string, 
        totalShares: number, 
        price: number,
        description: string
    ): Promise<{success: boolean, message?: string}> => {
        
        try {
            const { error } = await supabase.from('boloes').insert([{
                creator_id: creatorId,
                title,
                game,
                total_shares: totalShares,
                price_per_share: price,
                description,
                terms_accepted: true, // Obrigatório
                status: 'open'
            }]);

            if (error) throw error;
            return { success: true };
        } catch (e: any) {
            console.error(e);
            return { success: false, message: e.message };
        }
    },

    // 3. OBTER DETALHES DO BOLÃO
    getBolaoDetails: async (bolaoId: string): Promise<{bolao: Bolao | null, participants: BolaoParticipant[]}> => {
        const { data: bolao } = await supabase
            .from('boloes')
            .select('*, users(name, phone)')
            .eq('id', bolaoId)
            .single();
            
        const { data: parts } = await supabase.from('bolao_participantes').select('*').eq('bolao_id', bolaoId);
        
        if (!bolao) return { bolao: null, participants: [] };

        const mappedBolao: Bolao = {
            ...bolao,
            price_per_share: bolao.price_per_share,
            total_shares: bolao.total_shares,
            shares_sold: parts?.reduce((acc, curr) => acc + curr.shares_count, 0) || 0,
            creator_name: bolao.users?.name,
            creator_phone: bolao.users?.phone
        };

        return { bolao: mappedBolao, participants: parts || [] };
    },

    // 4. ADICIONAR PARTICIPANTE
    addParticipant: async (
        bolaoId: string, 
        name: string, 
        shares: number, 
        userId?: string
    ) => {
        const { error } = await supabase.from('bolao_participantes').insert([{
            bolao_id: bolaoId,
            user_id: userId || null,
            name: name,
            shares_count: shares,
            is_paid: false,
            has_indicated_payment: false
        }]);
        return { success: !error, error };
    },

    // 5. TOGGLE PAGAMENTO (GESTOR)
    togglePayment: async (participantId: string, currentStatus: boolean) => {
        await supabase.from('bolao_participantes').update({ 
            is_paid: !currentStatus 
            // Se confirmar pagamento, remove o alerta de indicação
            // has_indicated_payment: !currentStatus ? false : false 
        }).eq('id', participantId);
    },

    // 5b. INFORMAR PAGAMENTO (PARTICIPANTE)
    indicatePayment: async (participantId: string) => {
        await supabase.from('bolao_participantes').update({ has_indicated_payment: true }).eq('id', participantId);
    },

    // 6. REMOVER PARTICIPANTE
    removeParticipant: async (participantId: string) => {
        // Validação extra de segurança: Checar se já pagou antes de deletar
        const { data } = await supabase.from('bolao_participantes').select('is_paid').eq('id', participantId).single();
        
        if (data && data.is_paid) {
            return { success: false, message: "Não é possível excluir um participante com pagamento confirmado." };
        }

        const { error } = await supabase.from('bolao_participantes').delete().eq('id', participantId);
        return { success: !error, message: error ? error.message : "Removido" };
    },

    // 6b. EXCLUIR BOLÃO INTEIRO
    deleteBolao: async (bolaoId: string) => {
        // Verificar se tem participantes
        const { count } = await supabase.from('bolao_participantes').select('*', { count: 'exact', head: true }).eq('bolao_id', bolaoId);
        
        if (count && count > 0) {
            return { success: false, message: "Não é possível excluir um bolão que já possui participantes." };
        }

        const { error } = await supabase.from('boloes').delete().eq('id', bolaoId);
        return { success: !error, message: error ? error.message : "Bolão excluído." };
    },

    // 7. CHAT
    getChatMessages: async (bolaoId: string): Promise<BolaoChatMessage[]> => {
        try {
            const { data, error } = await supabase
                .from('bolao_chat')
                .select(`
                    *,
                    users (name)
                `)
                .eq('bolao_id', bolaoId)
                .order('created_at', { ascending: true }); 
            
            if (error) {
                console.error("Erro chat:", error);
                return [];
            }

            return data?.map((msg: any) => ({
                ...msg,
                user_name: msg.users?.name || 'Usuário'
            })) || [];
        } catch (e) {
            console.error("Exception chat:", e);
            return [];
        }
    },

    sendMessage: async (bolaoId: string, userId: string, message: string) => {
        try {
            const { error } = await supabase.from('bolao_chat').insert([{
                bolao_id: bolaoId,
                user_id: userId,
                message
            }]);
            if (error) console.error("Erro envio:", error);
        } catch (e) {
            console.error(e);
        }
    },

    // 8. SALVAR NÚMEROS DO JOGO
    saveGeneratedNumbers: async (bolaoId: string, numbers: number[]) => {
        await supabase.from('boloes').update({
            generated_numbers: JSON.stringify(numbers)
        }).eq('id', bolaoId);
    }
};
