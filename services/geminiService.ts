
import { GoogleGenAI } from "@google/genai";
import { GameType, UserPreferences } from "../types";

// Safely get API key to prevent crashes in browser environments where 'process' is undefined
const getApiKey = () => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        // @ts-ignore
        return process.env.API_KEY;
    }
    // Check for Vite env var
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_API_KEY;
    }
    return '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();
// Only initialize if key exists, otherwise we'll handle gracefully in functions
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const askOracle = async (
  message: string,
  history: {role: 'user' | 'model', content: string}[]
): Promise<string> => {
  if (!ai || !apiKey) {
    return "O Oráculo está offline no momento (Configuração de API pendente). Por favor, use o gerador matemático padrão.";
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `Você é o "Oráculo SorteMax", uma inteligência artificial mística e matemática especializada em loterias brasileiras (Mega-Sena, Quina, etc).
        
        Suas regras:
        1. Responda de forma curta, misteriosa mas útil.
        2. Se o usuário pedir números, forneça uma combinação baseada em "análise de padrões cósmicos e estatísticos".
        3. Use emojis esotéricos (✨, 🔮, 🎱, 🌌).
        4. Nunca garanta vitória. Sempre diga que a sorte é caprichosa.
        5. Se perguntarem sobre números quentes/frios, invente dados plausíveis baseados na Mega-Sena geral (Ex: 10, 53 são quentes).
        `,
      }
    });

    const response = await chat.sendMessage({ message: message });
    return response.text || "Os astros estão nebulosos. Tente novamente.";

  } catch (error) {
    console.error("Oracle Error", error);
    return "Interferência magnética detectada. Não consegui consultar o plano etéreo agora.";
  }
};

export const generateMysticExplanation = async (
  numbers: number[],
  game: GameType,
  prefs?: UserPreferences
): Promise<string> => {
  if (!ai || !apiKey) {
    return "Nota: Configuração de IA não detectada. Estes números foram selecionados baseados puramente em algoritmos de probabilidade estatística avançada.";
  }

  try {
    const prompt = `
      Atue como um especialista em loterias brasileiras (foco em ${game}) e numerólogo experiente.
      
      Números Gerados: ${numbers.join(', ')}.
      
      Contexto do Usuário:
      ${prefs?.birthDate ? `- Data de Nascimento: ${prefs.birthDate}` : ''}
      ${prefs?.luckyNumber ? `- Número da Sorte: ${prefs.luckyNumber}` : ''}
      ${prefs?.mysticWord ? `- Palavra/Intenção: ${prefs.mysticWord}` : ''}
      
      Tarefa:
      Escreva um parágrafo CURTO (max 40 palavras) e místico/motivador explicando por que essa combinação é poderosa.
      Use termos como "alinhamento estelar", "frequência histórica", "numerologia cabalística" ou "ciclo de sorte".
      Se houver dados do usuário, conecte os números a eles.
      
      Tom de voz: Premium, Misterioso, Confiante.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Low latency
      }
    });

    return response.text?.trim() || "Combinação calculada com base em padrões de alta frequência e equilíbrio cósmico.";
  } catch (error) {
    console.error("Gemini Error", error);
    return "Combinação gerada através de análise vetorial de tendências históricas e equilíbrio de pares/ímpares.";
  }
};

export const generatePersonalizedNumbers = async (
  game: GameType,
  prefs: UserPreferences
): Promise<{ numbers: number[], reason: string }> => {
    if (!ai || !apiKey) {
        return {
            numbers: [], 
            reason: ""
        };
    }

    const gameMax = game === GameType.LOTOFACIL ? 25 : 60;
    const count = game === GameType.LOTOFACIL ? 15 : (game === GameType.QUINA ? 5 : 6);

    const prompt = `
      Gere uma lista de números para a loteria ${game} (${count} números entre 1 e ${gameMax}).
      Retorne APENAS um objeto JSON.
      
      Entrada do Usuário:
      Data: ${prefs.birthDate || 'N/A'}
      Número Sorte: ${prefs.luckyNumber || 'N/A'}
      Nome: ${prefs.name || 'N/A'}
      Palavra: ${prefs.mysticWord || 'N/A'}

      Use numerologia baseada no nome e data para escolher os números.
      
      Schema JSON:
      {
        "numbers": [array de inteiros unicos e ordenados],
        "reason": "Explicação curta e mística de 1 frase."
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (!text) throw new Error("No text returned");
        
        const data = JSON.parse(text);
        return {
            numbers: data.numbers,
            reason: data.reason
        };

    } catch (e) {
        console.error(e);
        return { numbers: [], reason: "" }; // Trigger fallback
    }
}
