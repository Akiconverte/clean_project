import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";

interface Request {
  tagData: {
    name?: string;
    color?: string;
    kanban?: number;
  };
  tagId: string | number;
}

const UpdateTagService = async ({
  tagData,
  tagId
}: Request): Promise<Tag> => {
  const { name, color, kanban } = tagData;

  const tag = await Tag.findByPk(tagId);

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  await tag.update({
    name,
    color,
    kanban
  });

  return tag;
};

export default UpdateTagService;
