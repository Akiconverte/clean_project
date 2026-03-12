import { Sequelize, Op, Filterable } from "sequelize";
import QueueIntegrations from "../../models/QueueIntegrations";

interface Request {
    searchParam?: string;
    pageNumber?: string | number;
}

interface Response {
    queueIntegrations: QueueIntegrations[];
    count: number;
    hasMore: boolean;
}

const ListQueueIntegrationService = async ({
    searchParam = "",
    pageNumber = "1"
}: Request): Promise<Response> => {
    const whereCondition: Filterable["where"] = {
        [Op.or]: [
            {
                name: Sequelize.where(
                    Sequelize.fn("LOWER", Sequelize.col("name")),
                    "LIKE",
                    `%${searchParam.toLowerCase()}%`
                )
            }
        ]
    };

    const limit = 20;
    const offset = limit * (+pageNumber - 1);

    const { count, rows: queueIntegrations } = await QueueIntegrations.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    const hasMore = count > offset + queueIntegrations.length;

    return {
        queueIntegrations,
        count,
        hasMore
    };
};

export default ListQueueIntegrationService;
