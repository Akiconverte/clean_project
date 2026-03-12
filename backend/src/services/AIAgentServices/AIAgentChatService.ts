import fs from "fs";
import path from "path";
const pdfParse = require("pdf-parse");
import OpenAI from "openai";
import PromptFile from "../../models/PromptFile";
import AiAgent from "../../models/AiAgent";

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface Request {
    promptBase?: string; // O papel do robô (opcional para usar global)
    extraCommands?: string; // Comandos/Formatações obrigatórias
    history: ChatMessage[]; // Histórico
    whatsappId?: number; // Id da conexão para RAG
    mediaPath?: string; // Caminho físico para o Whisper
    apiKey: string; // Token da OpenAI
    temperature?: number;
}

// 1.1 Funcionalidade de Transcrição de Áudio (Whisper)
const transcribeAudio = async (
    openai: OpenAI,
    mediaPath: string
): Promise<string> => {
    try {
        if (!fs.existsSync(mediaPath)) return "";
        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(mediaPath),
            model: "whisper-1",
        });
        return response.text;
    } catch (error) {
        console.error("Erro na API da OpenAI (Whisper):", error);
        return "";
    }
};

// 1.2 RAG (Compreensão de Arquivos em Anexo)
const extractContextFromFiles = async (whatsappId?: number): Promise<string> => {
    if (!whatsappId) return "";

    // Busca os arquivos atrelados a esta Conexão (WhatsApp) específica
    const files = await PromptFile.findAll({
        where: { whatsappId }
    });

    let context = "";

    for (const file of files) {
        const filePath = path.join(__dirname, "..", "..", "..", "public", file.path);

        if (!fs.existsSync(filePath)) continue;

        try {
            if (file.path.endsWith(".pdf")) {
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdfParse(dataBuffer);
                context += `\n[Conteúdo do arquivo ${file.name}]:\n${data.text}\n`;
            } else if (file.path.endsWith(".txt")) {
                const text = fs.readFileSync(filePath, "utf-8");
                context += `\n[Conteúdo do arquivo ${file.name}]:\n${text}\n`;
            }
        } catch (err) {
            console.error(`Erro ao fazer parsing de contexto dinâmico no arquivo ${file.name}:`, err);
        }
    }

    return context;
};

// 1.3 Construção do Prompt Enviado ao GPT
const AIAgentChatService = async ({
    promptBase,
    extraCommands,
    history,
    whatsappId,
    mediaPath,
    apiKey,
    temperature
}: Request): Promise<string> => {
    const openai = new OpenAI({ apiKey });

    // Busca configurações globais se não for passado prompt individual
    let finalPrompt = promptBase;
    let finalExtra = extraCommands;
    let finalTemp = temperature;

    const globalAgent = await AiAgent.findByPk(1);
    if (globalAgent) {
        if (!finalPrompt) finalPrompt = globalAgent.prompt;
        if (!finalExtra) finalExtra = globalAgent.extraCommands;
        if (finalTemp === undefined || finalTemp === null) finalTemp = globalAgent.temperature;
    }

    if (!finalPrompt) finalPrompt = "Você é um assistente virtual atencioso.";
    if (finalTemp === undefined || finalTemp === null) finalTemp = 0.5;

    // Bloco 1: Whisper (Se existir áudio)
    if (mediaPath) {
        const transcription = await transcribeAudio(openai, mediaPath);
        if (transcription) {
            const audioMessage = `[Transcrição]: ${transcription}`;

            // Atualiza a última mensagem de usuário na history com a transcrição injetada.
            // Iteração de trás pra frente por compatibilidade
            let lastUserIndex = -1;
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i].role === "user") {
                    lastUserIndex = i;
                    break;
                }
            }

            if (lastUserIndex !== -1) {
                history[lastUserIndex].content = audioMessage;
            } else {
                history.push({ role: "user", content: audioMessage });
            }
        }
    }

    // Bloco 2: Contexto Interno via RAG
    const contextInternal = await extractContextFromFiles(whatsappId);

    let systemContent = finalPrompt;

    // Agrega as Informações de Contexto
    if (contextInternal) {
        systemContent += `\n\n### BASE DE CONHECIMENTO (RAG) ###\nUse as informações abaixo como sua única fonte de verdade para responder perguntas técnicas ou sobre a empresa:\n${contextInternal}\n#################################\n\nSe a resposta não estiver nos dados acima, peça para o cliente aguardar um atendente humano.`;
    }

    // Agrega Bloco Opcional Extra
    if (finalExtra) {
        systemContent += `\n\n=== REGRAS/COMANDOS EXTRAS ===\n${finalExtra}`;
    }

    const messages: ChatMessage[] = [
        { role: "system", content: systemContent },
        ...history
    ];

    // Chamada de API principal
    let responseText = "";
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages as any,
            temperature: Number(finalTemp),
        });

        responseText = chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Erro na geração de texto OpenAI GPT:", error);
        throw new Error("Falha ao gerar resposta da IA.");
    }

    return responseText;
};

export default AIAgentChatService;
