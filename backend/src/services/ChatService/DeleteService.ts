import Chat from "../../models/Chat";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string | number): Promise<void> => {
  const record = await Chat.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_CHAT_FOUND", 404);
  }

  await record.destroy();
};

export default DeleteService;
