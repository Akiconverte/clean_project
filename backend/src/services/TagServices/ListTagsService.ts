import { Op } from "sequelize";
import Tag from "../../models/Tag";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  kanban?: number | string;
}

interface Response {
  tags: Tag[];
  count: number;
  hasMore: boolean;
}

const ListTagsService = async ({
  searchParam = "",
  pageNumber = "1",
  kanban
}: Request): Promise<Response> => {
  let whereCondition: any = {};

  if (searchParam) {
    whereCondition.name = {
      [Op.like]: `%${searchParam}%`
    };
  }

  if (kanban !== undefined) {
    whereCondition.kanban = kanban;
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tags } = await Tag.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + tags.length;

  return {
    tags,
    count,
    hasMore
  };
};

export default ListTagsService;
