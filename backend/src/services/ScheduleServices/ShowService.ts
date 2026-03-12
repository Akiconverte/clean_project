import Schedule from "../../models/Schedule";
import AppError from "../../errors/AppError";

const ShowService = async (
  id: string | number
): Promise<Schedule> => {
  const schedule = await Schedule.findByPk(id, {
    include: ["contact", "user"]
  });

  if (!schedule) {
    throw new AppError("ERR_NO_SCHEDULE_FOUND", 404);
  }

  return schedule;
};

export default ShowService;
