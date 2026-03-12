import { Request, Response } from "express";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Message from "../models/Message";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import { whatsappProvider } from "../providers/WhatsApp";
import { Op } from "sequelize";

// GET /groups — list ALL groups from connected WhatsApp, merged with DB (for groupMode)
export const index = async (req: Request, res: Response): Promise<Response> => {
    const { searchParam = "" } = req.query as { searchParam: string };

    // Find all connected WhatsApps
    const whatsapps = await Whatsapp.findAll({ where: { status: "CONNECTED" } });

    let liveGroups: { id: string; name: string; isGroup: boolean; unreadCount: number; timestamp: number; whatsappId: number }[] = [];

    for (const whatsapp of whatsapps) {
        try {
            const chats = await whatsappProvider.getChats(whatsapp.id);
            const waChats = chats.map(c => ({ ...c, whatsappId: whatsapp.id }));
            liveGroups.push(...waChats);
        } catch (_e) {
            // fall through to DB groups if live call fails
        }
    }

    // Merge with DB contacts (to get groupMode, profilePicUrl, etc.)
    const dbGroups = await Contact.findAll({ where: { isGroup: true } });
    const dbMap = new Map(dbGroups.map(g => [g.number, g]));

    const merged = liveGroups
        .filter(g => g.name?.toLowerCase().includes((searchParam as string).toLowerCase()))
        .map(g => {
            const gid = g.id.replace("@g.us", "");
            const dbGroup = dbMap.get(gid);
            return {
                waId: g.id,
                id: dbGroup?.id || null,
                name: g.name,
                isGroup: true,
                unreadCount: g.unreadCount,
                timestamp: g.timestamp,
                groupMode: dbGroup?.groupMode || false,
                groupTag: dbGroup?.groupTag || null,
                profilePicUrl: dbGroup?.profilePicUrl || null,
                number: gid,
                whatsappId: g.whatsappId || null
            };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

    // If no live groups (no connected WA), fall back to DB
    if (merged.length === 0) {
        const fallback = dbGroups
            .filter(g => g.name.toLowerCase().includes((searchParam as string).toLowerCase()))
            .map(g => ({
                waId: `${g.number}@g.us`,
                id: g.id,
                name: g.name,
                isGroup: true,
                unreadCount: 0,
                timestamp: 0,
                groupMode: g.groupMode,
                groupTag: g.groupTag,
                profilePicUrl: g.profilePicUrl,
                number: g.number,
                whatsappId: whatsapps.length > 0 ? whatsapps[0].id : null
            }));
        return res.json(fallback);
    }

    return res.json(merged);
};

// GET /groups/:groupId/messages — messages for a group (by DB contact id or by waId)
export const messages = async (req: Request, res: Response): Promise<Response> => {
    const { groupId } = req.params;

    const group = await Contact.findByPk(groupId);
    if (!group || !group.isGroup) {
        throw new AppError("ERR_GROUP_NOT_FOUND", 404);
    }

    const tickets = await Ticket.findAll({
        where: { contactId: groupId },
        attributes: ["id"]
    });
    const ticketIds = tickets.map(t => t.id);

    if (ticketIds.length === 0) {
        return res.json({ messages: [], count: 0, hasMore: false, group });
    }

    const { count, rows: msgs } = await Message.findAndCountAll({
        where: {
            ticketId: { [Op.in]: ticketIds },
            isDeleted: false
        },
        include: [
            {
                model: Contact,
                as: "contact",
                attributes: ["id", "name", "profilePicUrl"]
            }
        ],
        order: [["createdAt", "DESC"]],
        limit: 60,
        offset: 0
    });

    return res.json({
        messages: msgs.reverse(),
        count,
        hasMore: count > msgs.length,
        group
    });
};

// POST /groups/:groupId/send
export const send = async (req: Request, res: Response): Promise<Response> => {
    const { groupId } = req.params;
    const { body, waId, whatsappId } = req.body;

    if (!body || !waId || !whatsappId) {
        throw new AppError("ERR_MISSING_PARAMS", 400);
    }

    try {
        await whatsappProvider.sendMessage(whatsappId, waId, body, {});
    } catch (err) {
        throw new AppError("ERR_SENDING_GROUP_MSG");
    }

    return res.json({ message: "Mensagem enviada ao grupo." });
};

// PUT /groups/:groupId/mode
export const toggleMode = async (req: Request, res: Response): Promise<Response> => {
    const { groupId } = req.params;
    const { groupMode } = req.body;

    const group = await Contact.findByPk(groupId);
    if (!group || !group.isGroup) {
        throw new AppError("ERR_GROUP_NOT_FOUND", 404);
    }

    await group.update({ groupMode: !!groupMode });

    return res.json(group);
};

// PUT /groups/:groupId/tag
export const updateTag = async (req: Request, res: Response): Promise<Response> => {
    const { groupId } = req.params;
    const { groupTag } = req.body;

    const group = await Contact.findByPk(groupId);
    if (!group || !group.isGroup) {
        throw new AppError("ERR_GROUP_NOT_FOUND", 404);
    }

    await group.update({ groupTag: groupTag || null });

    return res.json({ groupTag: group.groupTag });
};
