import Chat from "../../models/Chat";
import ChatUser from "../../models/ChatUser";
import User from "../../models/User";

interface Data {
  id: number | string;
  users: any[];
  title: string;
}

const UpdateService = async (data: Data): Promise<Chat> => {
  const { id, users, title } = data;

  const record = await Chat.findByPk(id);

  if (!record) {
    throw new Error("ERR_NO_CHAT_FOUND");
  }

  await record.update({
    title
  });

  if (Array.isArray(users) && users.length > 0) {
    await ChatUser.destroy({ where: { chatId: record.id } });
    await ChatUser.create({ chatId: record.id, userId: record.ownerId });
    for (let user of users) {
      await ChatUser.create({ chatId: record.id, userId: user.id });
    }
  }

  await record.reload({
    include: [
      { model: ChatUser, as: "users", include: [{ model: User, as: "user" }] },
      { model: User, as: "owner" }
    ]
  });

  return record;
};

export default UpdateService;
