import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as GroupController from "../controllers/GroupController";

const groupRoutes = Router();

groupRoutes.get("/groups", isAuth, GroupController.index);
groupRoutes.get("/groups/:groupId/messages", isAuth, GroupController.messages);
groupRoutes.post("/groups/:groupId/send", isAuth, GroupController.send);
groupRoutes.put("/groups/:groupId/mode", isAuth, GroupController.toggleMode);
groupRoutes.put("/groups/:groupId/tag", isAuth, GroupController.updateTag);

export default groupRoutes;
