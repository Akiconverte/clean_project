import Tag from "../../models/Tag";

interface Request {
  name: string;
  color: string;
  kanban?: number;
}

const CreateTagService = async ({
  name,
  color,
  kanban = 0
}: Request): Promise<Tag> => {
  const tag = await Tag.create({
    name,
    color,
    kanban
  });

  return tag;
};

export default CreateTagService;
