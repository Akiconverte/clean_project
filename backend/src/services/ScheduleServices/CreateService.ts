import * as Yup from "yup";
import Schedule from "../../models/Schedule";
import AppError from "../../errors/AppError";

interface Request {
  body: string;
  sendAt: string;
  contactId: number | string;
  userId: number | string;
}

const CreateService = async ({
  body,
  sendAt,
  contactId,
  userId
}: Request): Promise<Schedule> => {
  const schema = Yup.object().shape({
    body: Yup.string().required().min(1),
    sendAt: Yup.string().required(),
    contactId: Yup.number().required()
  });

  try {
    await schema.validate({ body, sendAt, contactId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const schedule = await Schedule.create({
    body,
    sendAt,
    contactId,
    userId,
    status: "PENDENTE"
  });

  await schedule.reload({
    include: ["contact", "user"]
  });

  return schedule;
};

export default CreateService;
