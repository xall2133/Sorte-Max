
import { Bolao, GameType } from '../types';

// Mock Data for demonstration
const MOCK_BOLOES: Bolao[] = [
    {
        id: '1',
        title: 'Lendário da Virada 202X',
        game: GameType.MEGA_VIRADA,
        totalShares: 100,
        soldShares: 87,
        pricePerShare: 50.00,
        numbersCount: 15,
        potEstimate: 'R$ 570 Milhões',
        endsAt: Date.now() + 86400000 * 3, // 3 days
        creatorName: 'SorteMax Oficial',
        isOfficial: true
    },
    {
        id: '2',
        title: 'Bolão dos Estrategistas',
        game: GameType.MEGA_SENA,
        totalShares: 20,
        soldShares: 12,
        pricePerShare: 15.00,
        numbersCount: 8,
        potEstimate: 'R$ 45 Milhões',
        endsAt: Date.now() + 3600000 * 5, // 5 hours
        creatorName: 'Grupo Alpha',
        isOfficial: false
    },
    {
        id: '3',
        title: 'Lotofácil Erre 5',
        game: GameType.LOTOFACIL,
        totalShares: 10,
        soldShares: 9,
        pricePerShare: 25.00,
        numbersCount: 18,
        potEstimate: 'R$ 8 Milhões',
        endsAt: Date.now() + 3600000 * 1, // 1 hour
        creatorName: 'SorteMax Oficial',
        isOfficial: true
    }
];

export const BolaoService = {
    getActiveBoloes: (): Bolao[] => {
        return MOCK_BOLOES;
    },

    createBolao: (data: Partial<Bolao>): boolean => {
        // Logic to save to DB would go here
        console.log("Creating bolao", data);
        return true;
    }
};
