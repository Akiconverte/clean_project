import axios from "axios";
import { proto } from "whaileys";
import QueueIntegrations from "../../models/QueueIntegrations";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";

const HandleMessageIntegrationService = async (
    msg: proto.IWebMessageInfo,
    queueIntegration: QueueIntegrations,
    ticket: Ticket
): Promise<void> => {
    if (queueIntegration.type === "n8n" || queueIntegration.type === "webhook") {
        if (queueIntegration?.urlN8N) {
            try {
                await axios.post(queueIntegration.urlN8N, msg);
                logger.info(`Webhook sent to ${queueIntegration.urlN8N}`);
            } catch (error) {
                logger.error(`Error sending webhook to ${queueIntegration.urlN8N}: ${error.message}`);
            }
        }
    } else if (queueIntegration.type === "typebot") {
        // Typebot integration logic can be added here later
        logger.info("Typebot integration not implemented yet in this service.");
    }
};

export default HandleMessageIntegrationService;
