
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, ExternalLink, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { AuthService } from '../services/authService';
import { getCheckoutUrl } from '../services/caktoService';
import { PaymentPlan } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PaymentPlan;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  const [step, setStep] = useState<'init' | 'waiting' | 'success'>('init');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('init');
      setTransactionId(null);
    }
  }, [isOpen]);

  // Polling: Verifica se a transação foi aprovada no banco
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'waiting' && transactionId) {
      interval = setInterval(async () => {
        const status = await AuthService.checkTransactionStatus(transactionId);
        if (status === 'approved') {
          setStep('success');
          clearInterval(interval);
          setTimeout(() => {
             onSuccess();
             onClose();
          }, 3000);
        }
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(interval);
  }, [step, transactionId, onSuccess, onClose]);

  const handleGoToPayment = async () => {
    const user = await AuthService.getCurrentUser();
    if (!user) return;

    // 1. Criar transação pendente no Supabase
    const txId = await AuthService.createPendingTransaction(user.id, user.name, plan.title, plan.price);
    
    if (txId) {
        setTransactionId(txId);
        setStep('waiting');

        // 2. Abrir Cakto em nova aba
        const checkoutUrl = getCheckoutUrl(plan.id);
        window.open(checkoutUrl, '_blank');
    } else {
        alert("Erro ao iniciar transação. Tente novamente.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <ShieldCheck className="text-green-500" size={18} />
                <span className="text-white font-bold text-sm">Pagamento Seguro</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>

        <div className="p-6">
            
            {/* STEP 1: RESUMO E BOTÃO DE PAGAR */}
            {step === 'init' && (
                <div className="space-y-6 text-center">
                     <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Você está comprando</p>
                        <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                        <div className="text-3xl font-bold text-green-400 mb-2">R$ {plan.price.toFixed(2).replace('.', ',')}</div>
                        <p className="text-xs text-slate-500">Pagamento via PIX ou Cartão</p>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg text-left flex gap-3">
                         <Zap className="text-blue-400 flex-shrink-0" size={20} />
                         <p className="text-xs text-blue-200">
                             Ao clicar abaixo, você será redirecionado para o checkout seguro da <b>Cakto</b>.
                         </p>
                    </div>

                    <button 
                        onClick={handleGoToPayment} 
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/50 flex items-center justify-center gap-2 animate-pulse"
                    >
                        PAGAR AGORA <ExternalLink size={18} />
                    </button>
                </div>
            )}

            {/* STEP 2: AGUARDANDO CONFIRMAÇÃO */}
            {step === 'waiting' && (
                <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-slate-800 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-white">Aguardando Pagamento...</h3>
                        <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                            Finalize o pagamento na aba que abriu. Assim que o banco confirmar, seus créditos cairão aqui automaticamente.
                        </p>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-xs text-slate-500">
                        <p>Já pagou e não liberou?</p>
                        <p className="mt-1">Envie o comprovante no WhatsApp: (71) 98219-4803</p>
                    </div>

                    <button onClick={onClose} className="text-slate-500 hover:text-white text-xs underline">
                        Fechar e aguardar em segundo plano
                    </button>
                </div>
            )}

            {/* STEP 3: SUCESSO */}
            {step === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in">
                    <CheckCircle className="w-20 h-20 text-green-500" />
                    <h3 className="text-2xl font-bold text-white">Pagamento Aprovado!</h3>
                    <p className="text-slate-400 text-sm">Seus benefícios foram liberados.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
