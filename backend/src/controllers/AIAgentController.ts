import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import AiAgent from "../models/AiAgent";
import PromptFile from "../models/PromptFile";
import { logger } from "../utils/logger";

export const index = async (req: Request, res: Response): Promise<Response> => {
    try {
        const agent = await AiAgent.findByPk(1);
        return res.status(200).json(agent);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar Agente IA." });
    }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { promptBase, extraCommands, temperature } = req.body;

        // Sempre trabalhamos com o Agente Global (ID 1)
        const [agent] = await AiAgent.findOrCreate({
            where: { id: 1 },
            defaults: {
                prompt: promptBase,
                extraCommands,
                temperature
            }
        });

        await agent.update({
            prompt: promptBase,
            extraCommands,
            temperature
        });

        return res.status(200).json({ message: "Inteligência Artificial centralizada e salva com sucesso!" });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ error: "Erro ao salvar Agente IA." });
    }
};

export const uploadFile = async (req: Request, res: Response): Promise<Response> => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "Nenhum arquivo enviado." });
        }

        const { whatsappId } = req.body;

        for (const file of files) {
            await PromptFile.create({
                name: file.originalname,
                path: file.filename, // Salvo pelo Multer
                whatsappId: whatsappId
            });
        }

        return res.status(200).json({ message: "Arquivo de contexto RAG salvo com sucesso!" });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ error: "Erro ao fazer upload do RAG." });
    }
};

export const listFiles = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { whatsappId } = req.params;
        const files = await PromptFile.findAll({
            where: { whatsappId }
        });
        return res.status(200).json(files);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar." });
    }
}

export const removeFile = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fileId } = req.params;
        const file = await PromptFile.findByPk(fileId);

        if (file) {
            const filePath = path.join(__dirname, "..", "..", "public", file.path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            await file.destroy();
        }

        return res.status(200).json({ message: "Arquivo Removido." });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao excluir." });
    }
}
