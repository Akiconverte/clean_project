import { Router } from "express";
import uploadConfig from "../config/upload";
import multer from "multer";

import * as AIAgentController from "../controllers/AIAgentController";
import isAuth from "../middleware/isAuth";

const aiRoutes = Router();
const upload = multer(uploadConfig);

// Protege as rotas de gerência do Agente (usado no painel)
aiRoutes.get("/ai-agents/1", isAuth, AIAgentController.index);
aiRoutes.post("/ai-agents", isAuth, AIAgentController.store);
aiRoutes.post("/prompt-files", isAuth, upload.array("file"), AIAgentController.uploadFile);
aiRoutes.get("/prompt-files/agent/:whatsappId", isAuth, AIAgentController.listFiles);
aiRoutes.delete("/prompt-files/:fileId", isAuth, AIAgentController.removeFile);

export default aiRoutes;
