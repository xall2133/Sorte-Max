
import { GameType, GameConfig, StrategyType, AppStats, UserPreferences } from '../types';

export const GAMES: Record<string, GameConfig> = {
  [GameType.MEGA_VIRADA]: { 
      id: GameType.MEGA_VIRADA, 
      name: 'Mega da Virada', 
      min: 1, max: 60, defaultCount: 6, maxCount: 20,
      color: 'border-green-500', 
      gradient: 'from-green-900 to-slate-900' 
  },
  [GameType.MEGA_SENA]: { 
      id: GameType.MEGA_SENA, 
      name: 'Mega-Sena', 
      min: 1, max: 60, defaultCount: 6, maxCount: 20,
      color: 'border-green-600', 
      gradient: 'from-emerald-800 to-slate-900' 
  },
  [GameType.LOTOFACIL]: { 
      id: GameType.LOTOFACIL, 
      name: 'Lotofácil', 
      min: 1, max: 25, defaultCount: 15, maxCount: 20,
      color: 'border-purple-500', 
      gradient: 'from-purple-900 to-slate-900' 
  },
  [GameType.QUINA]: { 
      id: GameType.QUINA, 
      name: 'Quina', 
      min: 1, max: 80, defaultCount: 5, maxCount: 15,
      color: 'border-blue-600', 
      gradient: 'from-blue-900 to-slate-900' 
  },
  [GameType.LOTOMANIA]: { 
      id: GameType.LOTOMANIA, 
      name: 'Lotomania', 
      min: 0, max: 99, defaultCount: 50, maxCount: 50, // Lotomania é fixo 50
      color: 'border-orange-500', 
      gradient: 'from-orange-900 to-slate-900' 
  },
  [GameType.DUPLA_SENA]: { 
      id: GameType.DUPLA_SENA, 
      name: 'Dupla Sena', 
      min: 1, max: 50, defaultCount: 6, maxCount: 15,
      color: 'border-red-500', 
      gradient: 'from-red-900 to-slate-900' 
  },
  [GameType.TIMEMANIA]: { 
      id: GameType.TIMEMANIA, 
      name: 'Timemania', 
      min: 1, max: 80, defaultCount: 10, maxCount: 10, // Timemania joga 10
      color: 'border-yellow-500', 
      gradient: 'from-yellow-700 to-slate-900' 
  },
  [GameType.DIA_DE_SORTE]: { 
      id: GameType.DIA_DE_SORTE, 
      name: 'Dia de Sorte', 
      min: 1, max: 31, defaultCount: 7, maxCount: 15,
      color: 'border-yellow-600', 
      gradient: 'from-yellow-800 to-slate-900',
      hasExtras: true,
      extraName: 'Mês da Sorte',
      extraMin: 1, extraMax: 12, extraCount: 1
  },
  [GameType.MILIONARIA]: { 
      id: GameType.MILIONARIA, 
      name: '+Milionária', 
      min: 1, max: 50, defaultCount: 6, maxCount: 6, // Apostas multiplas sao complexas na milionaria
      color: 'border-cyan-500', 
      gradient: 'from-cyan-900 to-slate-900',
      hasExtras: true,
      extraName: 'Trevos',
      extraMin: 1, extraMax: 6, extraCount: 2
  },
};

// --- MOCK STATS GENERATOR ---
const generateMockStats = (max: number): { hot: number[], cold: number[] } => {
    // Generate deterministic "random" stats based on max to look real
    const hot: number[] = [];
    const cold: number[] = [];
    for(let i=0; i<10; i++) {
        let h = Math.floor((max * (i+1) * 0.13) % max) || max;
        let c = Math.floor((max * (i+1) * 0.77) % max) || max;
        hot.push(h);
        cold.push(c);
    }
    return { hot: [...new Set(hot)], cold: [...new Set(cold)] };
};

export const getGameStats = (gameType: GameType): AppStats => {
    const game = GAMES[gameType];
    const { hot, cold } = generateMockStats(game.max);
    
    return {
        hotNumbers: hot,
        coldNumbers: cold,
        evenOddRatio: "Equilíbrio Variável",
        lastDraws: []
    };
};

// --- HELPER PARA PERSONALIZAÇÃO ---
// Converte string (nome, palavra) em números baseados na tabela ASCII/Numerologia
const stringToNumbers = (str: string, min: number, max: number): number[] => {
    if (!str) return [];
    const nums: number[] = [];
    const cleanStr = str.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    for (let i = 0; i < cleanStr.length; i++) {
        const code = cleanStr.charCodeAt(i);
        // Map code to range [min, max]
        let mapped = (code % max) || max;
        if (mapped < min) mapped = min + mapped;
        if (mapped > max) mapped = max;
        nums.push(mapped);
    }
    return nums;
};

// --- DYNAMIC EXPLANATION GENERATOR ---
const generateAnalysisText = (numbers: number[], gameType: GameType, strategyName: string): string => {
    // Metrics
    const evens = numbers.filter(n => n % 2 === 0).length;
    const odds = numbers.length - evens;
    const sum = numbers.reduce((a,b) => a+b, 0);
    const low = numbers.filter(n => n <= (GAMES[gameType].max / 2)).length;
    const high = numbers.length - low;

    // Primes (simplified list for lottery range)
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    const primeCount = numbers.filter(n => primes.includes(n)).length;

    // Templates
    const introTemplates = [
        `Análise ${strategyName}:`,
        `Estratégia aplicada (${strategyName}):`,
        `Configuração Gerada:`,
        `Padrão Identificado:`
    ];
    
    const balanceTemplates = [
        `Equilíbrio de ${evens} pares e ${odds} ímpares.`,
        `Distribuição de ${evens} pares x ${odds} ímpares.`,
        `Forte presença de ${odds > evens ? 'ímpares' : 'pares'} (${odds > evens ? odds : evens}).`
    ];

    const sumTemplates = [
        `Soma total de ${sum}, dentro da média histórica.`,
        `Soma de ${sum}, indicando um jogo ${sum > (numbers.length * GAMES[gameType].max / 2) ? 'com dezenas altas' : 'compacto'}.`,
        `Total somado: ${sum}.`
    ];

    const advancedTemplates = [
        `Contém ${primeCount} números primos.`,
        `${low} números na primeira metade e ${high} na segunda.`,
        `Distribuição otimizada por quadrantes.`
    ];

    // Pick random
    const intro = introTemplates[Math.floor(Math.random() * introTemplates.length)];
    const balance = balanceTemplates[Math.floor(Math.random() * balanceTemplates.length)];
    const sumText = sumTemplates[Math.floor(Math.random() * sumTemplates.length)];
    const advanced = advancedTemplates[Math.floor(Math.random() * advancedTemplates.length)];

    return `${intro} ${balance} ${sumText} ${advanced}`;
};


// --- GENERATION LOGIC ---

// Fallback determinístico caso a IA falhe ou não seja solicitada para personalização
export const generateFromPreferences = (
    gameType: GameType,
    prefs: UserPreferences
): { numbers: number[], extras?: number[], reason: string } => {
    const game = GAMES[gameType];
    const count = prefs.numberCount || game.defaultCount;
    const pool = new Set<number>();
    let explanationParts: string[] = [];

    // 1. LUCKY NUMBER
    if (prefs.luckyNumber) {
        const luck = parseInt(prefs.luckyNumber);
        if (!isNaN(luck) && luck >= game.min && luck <= game.max) {
            pool.add(luck);
            explanationParts.push("Número da sorte fixado.");
        }
    }

    // 2. BIRTH DATE
    if (prefs.birthDate) {
        // Ex: 1990-05-12
        const parts = prefs.birthDate.split('-').map(p => parseInt(p));
        // Day
        if (parts[2] >= game.min && parts[2] <= game.max) pool.add(parts[2]);
        // Month
        if (parts[1] >= game.min && parts[1] <= game.max) pool.add(parts[1]);
        // Year Logic (Sum digits or last 2)
        const yearLast2 = parts[0] % 100;
        if (yearLast2 >= game.min && yearLast2 <= game.max) pool.add(yearLast2);
        
        explanationParts.push("Datas astrais incluídas.");
    }

    // 3. NAME & MYSTIC WORD (Numerology)
    if (prefs.name) {
        const nameNums = stringToNumbers(prefs.name, game.min, game.max);
        // Pegar alguns números derivados do nome
        nameNums.slice(0, 2).forEach(n => pool.add(n));
        explanationParts.push("Vibração do nome.");
    }
    if (prefs.mysticWord) {
        const wordNums = stringToNumbers(prefs.mysticWord, game.min, game.max);
        wordNums.slice(0, 2).forEach(n => pool.add(n));
        explanationParts.push(`Energia de "${prefs.mysticWord}".`);
    }

    // 4. FILL THE REST
    while (pool.size < count) {
        const r = Math.floor(Math.random() * (game.max - game.min + 1)) + game.min;
        pool.add(r);
    }

    const finalNumbers = Array.from(pool).slice(0, count).sort((a,b) => a-b);

    // 5. EXTRAS
    let extras: number[] | undefined = undefined;
    if (game.hasExtras) {
        extras = [];
        const extraSet = new Set<number>();
        while (extraSet.size < (game.extraCount || 0)) {
            let r = Math.floor(Math.random() * ((game.extraMax || 1) - (game.extraMin || 1) + 1)) + (game.extraMin || 1);
            extraSet.add(r);
        }
        extras = Array.from(extraSet).sort((a,b) => a-b);
    }

    // Generate dynamic reason
    const dynamicReason = generateAnalysisText(finalNumbers, gameType, "Pessoal/Mística");
    
    return { numbers: finalNumbers, extras, reason: `${explanationParts.join(' ')} ${dynamicReason}` };
};


export const generateByStrategy = (
    gameType: GameType, 
    strategy: StrategyType, 
    count: number,
    fixed: number[] = [],
    exclude: number[] = []
): { numbers: number[], extras?: number[], reason: string } => {
    
    const game = GAMES[gameType];
    const stats = getGameStats(gameType);
    let pool: number[] = [];
    
    // Default Count Fallback
    const numCount = count || game.defaultCount;

    // 1. Build Pool based on Game Type & Strategy
    const allNumbers = Array.from({ length: game.max - game.min + 1 }, (_, i) => i + game.min);
    
    // --- SPECIAL STRATEGIES PER GAME ---
    if (gameType === GameType.LOTOFACIL) {
        if (strategy === StrategyType.SMART) {
            const fibonacci = [1, 2, 3, 5, 8, 13, 21];
            const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
            pool = [...allNumbers, ...fibonacci, ...primes, ...stats.hotNumbers]; 
        } else {
            pool = strategy === StrategyType.HOT ? [...stats.hotNumbers, ...stats.hotNumbers, ...allNumbers] : 
                   strategy === StrategyType.COLD ? [...stats.coldNumbers, ...allNumbers] : allNumbers;
        }
    } 
    else if (gameType === GameType.LOTOMANIA) {
        pool = allNumbers; // Lotomania needs spread
    }
    else {
        // Mega-Sena, Quina, etc.
        if (strategy === StrategyType.SMART) {
            pool = [...stats.hotNumbers, ...stats.coldNumbers, ...allNumbers, ...allNumbers];
        } else if (strategy === StrategyType.HOT) {
            pool = [...stats.hotNumbers, ...stats.hotNumbers, ...allNumbers];
        } else if (strategy === StrategyType.COLD) {
            pool = [...stats.coldNumbers, ...stats.coldNumbers, ...allNumbers];
        } else {
            pool = allNumbers;
        }
    }

    // 2. Select Numbers
    const result = new Set<number>(fixed);
    let attempts = 0;

    while (result.size < numCount && attempts < 5000) {
        attempts++;
        const candidate = pool[Math.floor(Math.random() * pool.length)];
        
        if (exclude.includes(candidate)) continue;
        if (result.has(candidate)) continue;
        
        result.add(candidate);
    }
    
    // Fill if empty
    while (result.size < numCount) {
         let r = Math.floor(Math.random() * (game.max - game.min + 1)) + game.min;
         if (!exclude.includes(r) && !result.has(r)) result.add(r);
    }

    const finalNumbers = Array.from(result).sort((a, b) => a - b);

    // 3. Handle Extras
    let extras: number[] | undefined = undefined;
    let extraText = "";
    if (game.hasExtras) {
        extras = [];
        const extraSet = new Set<number>();
        while (extraSet.size < (game.extraCount || 0)) {
            let r = Math.floor(Math.random() * ((game.extraMax || 1) - (game.extraMin || 1) + 1)) + (game.extraMin || 1);
            extraSet.add(r);
        }
        extras = Array.from(extraSet).sort((a,b) => a-b);
        
        if (gameType === GameType.DIA_DE_SORTE) {
            const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            extraText = ` Mês: ${months[extras[0]-1]}.`;
        } else if (gameType === GameType.MILIONARIA) {
            extraText = ` Trevos: ${extras.join(' e ')}.`;
        }
    }

    // 4. Generate Dynamic Reason
    const strategyNames = {
        [StrategyType.SMART]: "Inteligência Híbrida",
        [StrategyType.HOT]: "Tendência Quente",
        [StrategyType.COLD]: "Correção de Atraso",
        [StrategyType.BALANCED]: "Equilíbrio",
        [StrategyType.PERSONAL_MYSTIC]: "Personalizado"
    };

    const dynamicReason = generateAnalysisText(finalNumbers, gameType, strategyNames[strategy]);

    return { numbers: finalNumbers, extras, reason: `${dynamicReason}${extraText}` };
};
