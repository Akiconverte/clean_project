import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as ChatController from "../controllers/ChatController";

const chatRoutes = express.Router();
const upload = multer(uploadConfig);

chatRoutes.get("/chats", isAuth, ChatController.index);
chatRoutes.get("/chats/:id", isAuth, ChatController.show);
chatRoutes.get("/chats/:id/messages", isAuth, ChatController.messages);
chatRoutes.post("/chats", isAuth, ChatController.store);
chatRoutes.post("/chats/:id/messages", isAuth, upload.single("media"), ChatController.saveMessage);
chatRoutes.post("/chats/:id/read", isAuth, ChatController.checkAsRead);
chatRoutes.put("/chats/:id", isAuth, ChatController.update);
chatRoutes.delete("/chats/:id", isAuth, ChatController.remove);

export default chatRoutes;
