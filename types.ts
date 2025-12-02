
export enum GameType {
  MEGA_SENA = 'Mega-Sena',
  MEGA_VIRADA = 'Mega da Virada',
  LOTOFACIL = 'Lotofácil',
  QUINA = 'Quina',
  DUPLA_SENA = 'Dupla-Sena'
}

export enum StrategyType {
  SMART = 'smart',      // IA decide
  HOT = 'hot',          // Números que mais saem
  COLD = 'cold',        // Números atrasados
  BALANCED = 'balanced' // Equilíbrio par/impar
}

export interface GameConfig {
  id: GameType;
  name: string;
  min: number;
  max: number;
  defaultCount: number;
  color: string;
}

export interface GeneratedSet {
  id: string;
  numbers: number[];
  explanation: string;
  strategy: StrategyType;
  timestamp: number;
  game: GameType;
}

export interface UserPreferences {
  birthDate?: string;
  luckyNumber?: number;
  name?: string;
  mysticWord?: string;
  strategy?: StrategyType;
  numberCount?: number; // 6 to 10 for Mega
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
  premiumExpiresAt?: number; // Timestamp for when premium ends
  isAdmin: boolean;
  createdAt: string;
  referralCode: string; // Código único do usuário
  referredBy?: string; // ID de quem indicou
  referralCount: number; // Quantas pessoas indicou
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
  credits: number; // -1 for Premium (Unlimited)
  price: number;
  popular?: boolean;
}

export interface Bolao {
  id: string;
  title: string;
  game: GameType;
  totalShares: number;
  soldShares: number;
  pricePerShare: number;
  numbersCount: number; // Quantos números jogados (ex: 15 na mega)
  potEstimate: string;
  endsAt: number;
  creatorName: string;
  isOfficial: boolean; // Se foi criado pelo sistema/admin
}
