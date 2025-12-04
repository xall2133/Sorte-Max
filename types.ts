
export enum GameType {
  MEGA_SENA = 'Mega-Sena',
  MEGA_VIRADA = 'Mega da Virada',
  LOTOFACIL = 'Lotofácil',
  QUINA = 'Quina',
  LOTOMANIA = 'Lotomania',
  DUPLA_SENA = 'Dupla Sena',
  TIMEMANIA = 'Timemania',
  DIA_DE_SORTE = 'Dia de Sorte',
  MILIONARIA = '+Milionária'
}

export enum StrategyType {
  SMART = 'smart',      // IA decide
  HOT = 'hot',          // Números que mais saem
  COLD = 'cold',        // Números atrasados
  BALANCED = 'balanced', // Equilíbrio par/impar
  PERSONAL_MYSTIC = 'mystic' // Baseado em dados pessoais
}

export interface GameConfig {
  id: GameType;
  name: string;
  min: number;
  max: number;
  defaultCount: number;
  maxCount: number; // Limite máximo permitido para apostas
  color: string;
  gradient: string;
  hasExtras?: boolean; // Se tem trevos ou mês
  extraName?: string;
  extraMin?: number;
  extraMax?: number;
  extraCount?: number;
}

export interface GeneratedSet {
  id: string;
  numbers: number[];
  extras?: number[]; // Para trevos ou mês
  explanation: string;
  strategy: StrategyType;
  timestamp: number;
  game: GameType;
}

export interface UserPreferences {
  birthDate?: string;
  luckyNumber?: string; // Alterado para string para permitir input mais livre no form, convertido depois
  name?: string;
  mysticWord?: string;
  strategy?: StrategyType;
  numberCount?: number; 
  excludedNumbers?: number[];
  fixedNumbers?: number[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  credits: number;
  premiumExpiresAt?: number; 
  isAdmin: boolean;
  createdAt: string;
  referralCode: string; 
  referredBy?: string; 
  referralCount: number; 
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  planTitle: string;
  amount: number;
  status: 'approved' | 'pending' | 'failed';
  createdAt: string;
}

export interface AppStats {
  hotNumbers: number[];
  coldNumbers: number[];
  evenOddRatio: string;
  lastDraws: number[][];
}

export enum AppScreen {
  AUTH = 'AUTH',
  HOME = 'HOME',
  GENERATOR = 'GENERATOR',
  PERSONALIZED = 'PERSONALIZED',
  HISTORY = 'HISTORY',
  STATS = 'STATS',
  EXPLAINER = 'EXPLAINER',
  ADMIN = 'ADMIN',
  AI_AGENT = 'AI_AGENT',
  STORE = 'STORE',
  REFERRAL = 'REFERRAL',
  BOLAO = 'BOLAO'
}

export interface PaymentPlan {
  id: string;
  title: string;
  credits: number;
  price: number;
  popular?: boolean;
}

// --- CLUBE DO BOLÃO TYPES ---

export interface Bolao {
  id: string;
  creator_id: string;
  title: string;
  game: GameType;
  total_shares: number;
  price_per_share: number;
  description?: string;
  status: 'open' | 'closed' | 'finished';
  generated_numbers?: string; // JSON string "1,2,3..."
  created_at: string;
  terms_accepted: boolean;
  
  // Virtual fields (calculados no frontend ou via join)
  shares_sold?: number;
  is_creator?: boolean;
  creator_name?: string;
  creator_phone?: string;
}

export interface BolaoParticipant {
  id: string;
  bolao_id: string;
  user_id?: string;
  name: string;
  shares_count: number;
  is_paid: boolean;
  has_indicated_payment?: boolean; // Novo campo
  created_at: string;
}

export interface BolaoChatMessage {
  id: string;
  bolao_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_name?: string; // Join
}
