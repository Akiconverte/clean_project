import { Request, Response } from "express";
import ListTagsService from "../services/TagServices/ListTagsService";
import CreateTagService from "../services/TagServices/CreateTagService";
import UpdateTagService from "../services/TagServices/UpdateTagService";
import DeleteTagService from "../services/TagServices/DeleteTagService";
import ShowTagService from "../services/TagServices/ShowTagService";

interface TagQuery {
  searchParam?: string;
  pageNumber?: string | number;
  kanban?: number | string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, kanban } = req.query as TagQuery;

  const { tags, count, hasMore } = await ListTagsService({
    searchParam,
    pageNumber,
    kanban
  });

  return res.json({ tags, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { tagId } = req.params;

  const tag = await ShowTagService(tagId);

  return res.json(tag);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color, kanban } = req.body;

  const tag = await CreateTagService({ name, color, kanban });

  return res.status(200).json(tag);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { tagId } = req.params;
  const tagData = req.body;

  const tag = await UpdateTagService({ tagData, tagId });

  return res.status(200).json(tag);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { tagId } = req.params;

  await DeleteTagService(tagId);

  return res.status(200).json({ message: "Tag deleted" });
};
