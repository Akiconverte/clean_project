import express, { Request, Response } from "express";
import isAuth from "../middleware/isAuth";

import * as TicketInsightController from "../controllers/TicketInsightController";

const ticketInsightRoutes = express.Router();

ticketInsightRoutes.get("/ticket-insights", isAuth, TicketInsightController.index);
ticketInsightRoutes.get("/ticket-insights/stats", isAuth, TicketInsightController.getStats);
ticketInsightRoutes.post("/ticket-insights/chat", isAuth, TicketInsightController.chat);

export default ticketInsightRoutes;

