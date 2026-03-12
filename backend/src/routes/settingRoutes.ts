import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as SettingController from "../controllers/SettingController";

const settingRoutes = Router();

settingRoutes.get("/settings", isAuth, SettingController.index);

// routes.get("/settings/:settingKey", isAuth, SettingsController.show);

settingRoutes.get("/settings/public", SettingController.publicIndex);

// change setting key to key in future
settingRoutes.put("/settings/:settingKey", isAuth, SettingController.update);

import multer from "multer";
import uploadConfig from "../config/upload";
const upload = multer(uploadConfig);

settingRoutes.post("/settings/logo", isAuth, upload.single("file"), SettingController.uploadLogo);

export default settingRoutes;

