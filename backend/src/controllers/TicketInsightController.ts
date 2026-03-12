import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import TicketInsight from "../models/TicketInsight";
import Ticket from "../models/Ticket";
import sequelize from "../database";
import QueryAIInsightsService from "../services/AIAgentServices/QueryAIInsightsService";



export const index = async (req: Request, res: Response): Promise<Response> => {
  const { startDate, endDate } = req.query;

  const where: any = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate]
    };
  }

  const insights = await TicketInsight.findAll({
    where,
    order: [["createdAt", "DESC"]]
  });

  return res.json(insights);
};

export const getStats = async (req: Request, res: Response): Promise<Response> => {
  // 1. Contagem por Categoria (mainDoubt)
  const categories = await TicketInsight.findAll({
    attributes: [
      "mainDoubt",
      [Sequelize.fn("COUNT", Sequelize.col("mainDoubt")), "count"]
    ],
    group: ["mainDoubt"],
    raw: true
  });

  // 2. Estatísticas de Sentimento e Total
  const sentimentStats = await TicketInsight.findAll({
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("sentiment")), "averageSentiment"],
      [Sequelize.fn("COUNT", Sequelize.col("sentiment")), "totalInsights"]
    ],
    raw: true
  });

  // 3. Distribuição de Humor (Notas 1 a 5)
  const sentimentDistribution = await TicketInsight.findAll({
    attributes: [
      "sentiment",
      [Sequelize.fn("COUNT", Sequelize.col("sentiment")), "count"]
    ],
    group: ["sentiment"],
    raw: true
  });

  // 4. Métricas Globais de Tickets (Aguardando, Atendendo, Total)
  const pendingTickets = await Ticket.count({ where: { status: "pending" } });
  const openTickets = await Ticket.count({ where: { status: "open" } });
  const closedTickets = await Ticket.count({ where: { status: "closed" } });

  // 5. Última dica gerada pela IA
  const lastInsight = await TicketInsight.findOne({
    order: [["createdAt", "DESC"]],
    attributes: ["agentFeedback", "mainDoubt"]
  });

  return res.json({
    categories,
    sentiment: sentimentStats[0],
    distribution: sentimentDistribution,
    global: {
      pending: pendingTickets,
      open: openTickets,
      closed: closedTickets
    },
    lastDica: lastInsight?.agentFeedback || "Continue prestando um bom atendimento!"
  });
};

export const chat = async (req: Request, res: Response): Promise<Response> => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const response = await QueryAIInsightsService({ question });

  return res.json({ response });
};

