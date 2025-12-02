
import { PaymentPlan } from '../types';

// COLOQUE AQUI OS SEUS LINKS REAIS DA CAKTO
// Crie um checkout para cada plano lá na Cakto e cole o link correspondente abaixo.

const CHECKOUT_URLS: Record<string, string> = {
    // Pacote de 20 Créditos (R$ 9,90)
    'mini': 'https://pay.cakto.com.br/b2pbe5r_674585', 
    
    // Pacote de 60 Créditos (R$ 19,90)
    'medium': 'https://pay.cakto.com.br/4zoprgb_674591',
    
    // Pacote de 150 Créditos (R$ 39,90) - Atualizado
    'turbo': 'https://pay.cakto.com.br/3e4rtf5_674593',
    
    // Plano Premium (R$ 49,90)
    'premium': 'https://pay.cakto.com.br/33mab5t_674481' 
};

export const getCheckoutUrl = (planId: string): string => {
    // Se não tiver link configurado, leva para a home da Cakto para evitar erro
    return CHECKOUT_URLS[planId] || 'https://pay.cakto.com.br/';
};
