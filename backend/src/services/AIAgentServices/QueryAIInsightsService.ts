import { OpenAI } from "openai";
import TicketInsight from "../../models/TicketInsight";
import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";

interface Request {
  question: string;
}

const QueryAIInsightsService = async ({ question }: Request): Promise<string> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 1. Coletar Estatísticas Agregadas (Snapshot)
  const totalInsights = await TicketInsight.count();
  const avgSentiment = await TicketInsight.findAll({
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("sentiment")), "average"]
    ],
    raw: true
  });


  const categories = await TicketInsight.findAll({
    attributes: [
      "mainDoubt",
      [Sequelize.fn("COUNT", Sequelize.col("mainDoubt")), "count"]
    ],
    group: ["mainDoubt"],
    order: [[Sequelize.literal("count"), "DESC"]],
    limit: 10,
    raw: true
  });

  // 2. Coletar Exemplos Recentes (Contexto qualitativo)
  const recentInsights = await TicketInsight.findAll({
    limit: 15,
    order: [["createdAt", "DESC"]],
    attributes: ["summary", "mainDoubt", "sentiment", "agentFeedback"],
    raw: true
  });

  // 3. Montar o Prompt para a OpenAI
  const context = {
    total_analises: totalInsights,
    satisfacao_media: (avgSentiment[0] as any)?.average || 0,
    ranking_duvidas: categories,
    ultimas_analises: recentInsights.map(i => ({
      assunto: i.mainDoubt,
      resumo: i.summary,
      nota: i.sentiment,
      dica: i.agentFeedback
    }))
  };

  const prompt = `
    Você é o "Consultor Estratégico do Whaticket", um especialista em análise de dados e atendimento ao cliente para OSCs (Organizações da Sociedade Civil).
    Sua missão é ajudar o gestor a entender o que está acontecendo no suporte com base nos dados reais abaixo.

    DADOS DO SISTEMA:
    ${JSON.stringify(context, null, 2)}

    PERGUNTA DO GESTOR:
    "${question}"

    DIRETRIZES:
    - Responda de forma profissional, direta e orientada a dados.
    - Se perguntarem sobre números, cite as estatísticas acima.
    - Se perguntarem sobre tendências, analise as "ultimas_analises" para identificar padrões.
    - Se a informação não estiver nos dados acima, peça desculpas e diga que ainda não tem dados suficientes sobre esse ponto específico.
    - Use Markdown para formatar a resposta (negrito, listas, etc).
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um consultor de dados gerenciais." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message?.content || "Desculpe, não consegui processar sua pergunta agora.";
  } catch (err) {
    console.error("OpenAI Query Error:", err);
    throw new Error("ERR_AI_QUERY_FAILED");
  }
};

export default QueryAIInsightsService;
