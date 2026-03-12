import OpenAI from "openai";
import Message from "../../models/Message";
import TicketInsight from "../../models/TicketInsight";
import { logger } from "../../utils/logger";

interface AnalyzeRequest {
  ticketId: number;
}

export const AnalyzeTicketService = async ({
  ticketId
}: AnalyzeRequest): Promise<void> => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logger.warn("OpenAI API Key não configurada. Pulando análise de insights.");
      return;
    }

    const openai = new OpenAI({ apiKey });

    // 1. Buscar o histórico de mensagens do ticket
    const messages = await Message.findAll({
      where: { ticketId },
      order: [["createdAt", "ASC"]],
      limit: 50 // Limite razoável para análise
    });

    if (messages.length === 0) return;

    const chatHistory = messages.map(m => `${m.fromMe ? "Atendente" : "Cliente"}: ${m.body}`).join("\n");

    // 2. Prompt para a OpenAI
    const systemPrompt = `Você é um analista de qualidade de atendimento para uma OSC (Organização da Sociedade Civil) que atende alunos e membros da comunidade.
Sua tarefa é analisar a conversa fornecida e gerar um JSON com os seguintes campos:
- summary: Um resumo de 1 parágrafo da solução ou do problema.
- mainDoubt: A categoria principal da dúvida (ex: Inscrição, Pedagógico, Financeiro, Prazos, Localização, Outros).
- sentiment: Uma nota de 1 a 5 para a satisfação do cliente (1 muito insatisfeito, 5 muito satisfeito).
- agentFeedback: Um feedback construtivo para o atendente humano (o que ele fez bem ou o que pode melhorar).

Responda APENAS o JSON, sem explicações.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analise esta conversa:\n\n${chatHistory}` }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");

    // 3. Salvar o insight no banco de dados
    await TicketInsight.create({
      ticketId,
      summary: result.summary,
      mainDoubt: result.mainDoubt,
      sentiment: result.sentiment,
      agentFeedback: result.agentFeedback
    });


    logger.info(`Insight gerado para o Ticket #${ticketId}`);
  } catch (error) {
    // Falha silente: Não atrapalha o fechamento do ticket se a IA falhar
    logger.error(`Erro ao analisar ticket #${ticketId} com OpenAI: ${error.message}`);
  }
};
