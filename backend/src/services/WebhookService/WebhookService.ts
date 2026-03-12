import axios from "axios";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";

interface WebhookData {
    event: string;
    ticket: any;
    contact: any;
    message?: any;
}

const WebhookService = async (
    whatsapp: Whatsapp,
    data: WebhookData
): Promise<void> => {
    const { webhookUrl, webhookToken } = whatsapp;

    if (!webhookUrl) return;

    try {
        const headers: any = {
            "Content-Type": "application/json"
        };

        if (webhookToken) {
            headers["Authorization"] = `Bearer ${webhookToken}`;
        }

        await axios.post(webhookUrl, data, { headers });
        logger.info(`Webhook sent to ${webhookUrl} for event ${data.event}`);
    } catch (err) {
        logger.error(`Error sending webhook to ${webhookUrl}: ${err.message}`);
    }
};

export default WebhookService;
