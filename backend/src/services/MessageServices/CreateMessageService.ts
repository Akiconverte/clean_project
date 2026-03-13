import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

interface MessageData {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  ack?: number;
  quotedMsgId?: string | null;
}
interface Request {
  messageData: MessageData;
}

const CreateMessageService = async ({
  messageData
}: Request): Promise<Message> => {
  if (messageData.quotedMsgId) {
    const quotedExists = await (Message as any).findByPk(messageData.quotedMsgId);
    if (!quotedExists) {
      messageData.quotedMsgId = null;
    }
  }

  try {
    await (Message as any).upsert(messageData);
  } catch (err: any) {
    const isQuotedFkError =
      err?.name === "SequelizeForeignKeyConstraintError" &&
      (err?.index === "Messages_quotedMsgId_foreign_idx" ||
        String(err?.original?.sqlMessage || "").includes("Messages_quotedMsgId_foreign_idx"));

    if (isQuotedFkError && messageData.quotedMsgId) {
      messageData.quotedMsgId = null;
      await (Message as any).upsert(messageData);
    } else {
      throw err;
    }
  }

  const message = await (Message as any).findByPk(messageData.id, {
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        include: [
          "contact",
          "queue",
          {
            model: Whatsapp,
            as: "whatsapp",
            attributes: ["name"]
          }
        ]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new Error("ERR_CREATING_MESSAGE");
  }

  const io = getIO();
  io.to(message.ticketId.toString())
    .to(message.ticket.status)
    .to("notification")
    .emit("appMessage", {
      action: "create",
      message,
      ticket: message.ticket,
      contact: message.ticket.contact
    });

  return message;
};

export default CreateMessageService;
