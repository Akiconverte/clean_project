import * as Yup from "yup";
import Schedule from "../../models/Schedule";
import AppError from "../../errors/AppError";

interface ScheduleData {
  body?: string;
  sendAt?: string;
  contactId?: number;
  userId?: number;
}

interface Request {
  scheduleData: ScheduleData;
  id: string | number;
}

const UpdateService = async ({
  scheduleData,
  id
}: Request): Promise<Schedule> => {
  const { body, sendAt, contactId, userId } = scheduleData;

  const schedule = await Schedule.findByPk(id, {
    include: ["contact", "user"]
  });

  if (!schedule) {
    throw new AppError("ERR_NO_SCHEDULE_FOUND", 404);
  }

  const schema = Yup.object().shape({
    body: Yup.string().min(1),
    sendAt: Yup.string(),
    contactId: Yup.number()
  });

  try {
    await schema.validate({ body, sendAt, contactId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await schedule.update({
    body,
    sendAt,
    contactId,
    userId
  });

  await schedule.reload({
    include: ["contact", "user"]
  });

  return schedule;
};

export default UpdateService;
