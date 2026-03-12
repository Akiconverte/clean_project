import cron from "node-cron";
import { Op } from "sequelize";
import Schedule from "../../models/Schedule";
import Contact from "../../models/Contact";
import { whatsappProvider } from "../../providers/WhatsApp";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";

export const startScheduleCheck = async (): Promise<void> => {
  cron.schedule("* * * * *", async () => {
    logger.debug("Checking for scheduled messages...");

    const schedules = await Schedule.findAll({
      where: {
        status: "PENDENTE",
        sendAt: {
          [Op.lte]: new Date()
        }
      },
      include: [{ model: Contact, as: "contact" }]
    });

    if (schedules.length > 0) {
      logger.info(`Found ${schedules.length} scheduled messages to send.`);

      for (const schedule of schedules) {
        try {
          const whatsapp = await Whatsapp.findOne({ where: { status: "CONNECTED" } });
          if (!whatsapp) {
            logger.warn("No connected WhatsApp found for scheduled message");
            continue;
          }

          const ticket = await FindOrCreateTicketService(
            schedule.contact,
            whatsapp.id,
            0 // unread messages
          );

          await whatsappProvider.sendMessage(
            whatsapp.id,
            `${schedule.contact.number}@c.us`,
            schedule.body,
            {}
          );

          await schedule.update({
            sentAt: new Date(),
            status: "ENVIADA",
            ticketId: ticket.id
          });

          logger.info(`Scheduled message sent to ${schedule.contact.name}`);
        } catch (err) {
          logger.error(`Error sending scheduled message: ${err}`);
        }
      }
    }
  });
};
