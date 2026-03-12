import { Op, Filterable } from "sequelize";
import Schedule from "../../models/Schedule";
import Contact from "../../models/Contact";
import User from "../../models/User";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  userId?: number | string;
  contactId?: number | string;
}

interface Response {
  schedules: Schedule[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam,
  pageNumber = "1",
  userId,
  contactId
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {};

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      body: {
        [Op.like]: `%${searchParam}%`
      }
    };
  }

  if (contactId) {
    whereCondition = {
      ...whereCondition,
      contactId
    };
  }

  if (userId) {
    whereCondition = {
      ...whereCondition,
      userId
    };
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: schedules } = await Schedule.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["sendAt", "ASC"]],
    include: [
      { model: Contact, as: "contact", attributes: ["id", "name", "number"] },
      { model: User, as: "user", attributes: ["id", "name"] }
    ]
  });

  const hasMore = count > offset + schedules.length;

  return {
    schedules,
    count,
    hasMore
  };
};

export default ListService;
