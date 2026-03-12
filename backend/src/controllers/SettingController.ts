import { Request, Response } from "express";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import ListSettingsService from "../services/SettingServices/ListSettingsService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const settings = await ListSettingsService();

  return res.status(200).json(settings);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { settingKey: key } = req.params;
  const { value } = req.body;

  const setting = await UpdateSettingService({
    key,
    value
  });

  const io = getIO();
  io.emit("settings", {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};

export const publicIndex = async (req: Request, res: Response): Promise<Response> => {
  const settings = await ListSettingsService();
  const publicKeys = [
    "appLogoLogin",
    "appLogoSignup",
    "appLogoDashboard",
    "appName",
    "appPrimaryColor",
    "appSecondaryColor",
    "appFavicon",
    "appFooterText"
  ];

  const publicSettings = settings?.filter(s => publicKeys.includes(s.key)) || [];

  return res.status(200).json(publicSettings);
};

export const uploadLogo = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const file = req.file;
  const { settingKey } = req.body;

  if (!file || !settingKey) {
    throw new AppError("ERR_MISSING_FILE", 400);
  }

  // Utiliza a variável BACKEND_URL ou fallback para URL padrão com a rota /public
  const baseUrl = process.env.BACKEND_URL || "http://localhost:8080";
  const publicUrl = `${baseUrl}/public/${file.filename}`;

  const setting = await UpdateSettingService({
    key: settingKey,
    value: publicUrl
  });

  const io = getIO();
  io.emit("settings", {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};

