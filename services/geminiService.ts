
import { GoogleGenAI, Type } from "@google/genai";
import { GameType, UserPreferences } from "../types";

// Always initialize instance right before use to ensure latest API key
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askOracle = async (
  message: string,
  history: {role: 'user' | 'model', content: string}[]
): Promise<string> => {
  const ai = getAi();
  
  if (!process.env.API_KEY) {
    return "O Oráculo está offline no momento (Configuração de API pendente). Por favor, use o gerador matemático padrão.";
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
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
    // Use .text property directly as per guidelines
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
  const ai = getAi();

  if (!process.env.API_KEY) {
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
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Low latency reasoning
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
    const ai = getAi();
    
    if (!process.env.API_KEY) {
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
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                // Using responseSchema for reliable JSON output as per recommended guidelines
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        numbers: {
                            type: Type.ARRAY,
                            items: { type: Type.INTEGER },
                            description: "The generated lottery numbers."
                        },
                        reason: {
                            type: Type.STRING,
                            description: "A short mystic explanation for the numbers."
                        }
                    },
                    required: ["numbers", "reason"]
                }
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
        console.error("Personalized Generation Error", e);
        return { numbers: [], reason: "" }; // Trigger fallback in UI
    }
}
