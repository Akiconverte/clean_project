import { Router } from "express";

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import settingRoutes from "./settingRoutes";
import queueIntegrationRoutes from "./queueIntegrationRoutes";
import contactRoutes from "./contactRoutes";
import ticketRoutes from "./ticketRoutes";
import whatsappRoutes from "./whatsappRoutes";
import messageRoutes from "./messageRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";
import queueRoutes from "./queueRoutes";
import quickAnswerRoutes from "./quickAnswerRoutes";
import apiRoutes from "./apiRoutes";
import aiRoutes from "./aiRoutes";
import groupRoutes from "./groupRoutes";
import tagRoutes from "./tagRoutes";
import ticketTagRoutes from "./ticketTagRoutes";
import chatRoutes from "./chatRoutes";
import scheduleRoutes from "./scheduleRoutes";
import ticketNoteRoutes from "./ticketNoteRoutes";
import ticketInsightRoutes from "./ticketInsightRoutes";


const routes = Router();

routes.use("/auth", authRoutes);
routes.use(userRoutes);
routes.use(contactRoutes);
routes.use(ticketRoutes);
routes.use(whatsappRoutes);
routes.use(messageRoutes);
routes.use(whatsappSessionRoutes);
routes.use(settingRoutes);
routes.use(queueRoutes);
routes.use(quickAnswerRoutes);
routes.use(apiRoutes);
routes.use(ticketTagRoutes);
routes.use(tagRoutes);
routes.use(queueIntegrationRoutes);
routes.use(groupRoutes);
routes.use(chatRoutes);
routes.use(aiRoutes);
routes.use(scheduleRoutes);
routes.use(ticketNoteRoutes);
routes.use(ticketInsightRoutes);


export default routes;
