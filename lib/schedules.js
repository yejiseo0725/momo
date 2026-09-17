import { requireGatheringMember } from "@/lib/gatherings";
import { getDatabase } from "@/lib/mongodb";
import { createGatheringNotifications } from "@/lib/notifications";
import { getUserDisplayNames } from "@/lib/users";
import { parseObjectId, serializeDocument } from "@/lib/utils/documents";

export class ScheduleError extends Error {
  constructor(message) {
    super(message);
    this.name = "ScheduleError";
  }
}

async function findSchedule(database, scheduleId, gatheringId) {
  const objectId = parseObjectId(scheduleId);
  const schedule = objectId
    ? await database.collection("schedules").findOne({ _id: objectId, gatheringId })
    : null;

  if (!schedule) {
    throw new ScheduleError("존재하지 않는 일정입니다.");
  }

  return schedule;
}

export async function getSchedules(gatheringId, userId) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const schedules = await database
    .collection("schedules")
    .find({ gatheringId })
    .sort({ startDate: 1, createdAt: 1 })
    .toArray();
  const displayNames = await getUserDisplayNames(
    database,
    schedules.map((schedule) => schedule.userId),
  );

  return schedules.map((schedule) => ({
    ...serializeDocument(schedule),
    authorName: displayNames.get(schedule.userId) || "알 수 없는 사용자",
  }));
}

export async function getScheduleDetails(scheduleId, gatheringId, userId) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  let schedule;

  try {
    schedule = await findSchedule(database, scheduleId, gatheringId);
  } catch (error) {
    if (error instanceof ScheduleError) {
      return null;
    }
    throw error;
  }

  const participants = await database
    .collection("scheduleMembers")
    .find({ scheduleId })
    .toArray();
  const displayNames = await getUserDisplayNames(
    database,
    [schedule.userId, ...participants.map((participant) => participant.userId)],
  );

  return {
    schedule: {
      ...serializeDocument(schedule),
      authorName: displayNames.get(schedule.userId) || "알 수 없는 사용자",
    },
    participants: participants.map((participant) => ({
      ...serializeDocument(participant),
      displayName: displayNames.get(participant.userId) || "알 수 없는 사용자",
    })),
    isParticipating: participants.some((participant) => participant.userId === userId),
  };
}

export async function createSchedule(gatheringId, userId, input) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const now = new Date();
  const result = await database.collection("schedules").insertOne({
    gatheringId,
    userId,
    title: input.title,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    region: input.region,
    createdAt: now,
    updatedAt: now,
  });
  const scheduleId = result.insertedId.toString();

  try {
    await database.collection("scheduleMembers").insertOne({ scheduleId, userId });
  } catch (error) {
    await database.collection("schedules").deleteOne({ _id: result.insertedId });
    throw error;
  }

  await createGatheringNotifications({
    gatheringId,
    actorUserId: userId,
    type: "SCHEDULE_CREATED",
    targetId: scheduleId,
    message: "새 일정을 등록했습니다.",
  });

  return scheduleId;
}

export async function updateSchedule(scheduleId, gatheringId, userId, input) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const schedule = await findSchedule(database, scheduleId, gatheringId);

  if (schedule.userId !== userId) {
    throw new ScheduleError("일정 작성자만 수정할 수 있습니다.");
  }

  await database.collection("schedules").updateOne(
    { _id: schedule._id },
    {
      $set: {
        title: input.title,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        region: input.region,
        updatedAt: new Date(),
      },
    },
  );
}

export async function deleteSchedule(scheduleId, gatheringId, userId) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const schedule = await findSchedule(database, scheduleId, gatheringId);

  if (schedule.userId !== userId) {
    throw new ScheduleError("일정 작성자만 삭제할 수 있습니다.");
  }

  await database.collection("scheduleMembers").deleteMany({ scheduleId });
  await database.collection("schedules").deleteOne({ _id: schedule._id });
}

export async function joinSchedule(scheduleId, gatheringId, userId) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  await findSchedule(database, scheduleId, gatheringId);
  await database.collection("scheduleMembers").updateOne(
    { scheduleId, userId },
    { $setOnInsert: { scheduleId, userId } },
    { upsert: true },
  );
}

export async function leaveSchedule(scheduleId, gatheringId, userId) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const schedule = await findSchedule(database, scheduleId, gatheringId);

  if (schedule.userId === userId) {
    throw new ScheduleError("일정 작성자는 참여를 취소할 수 없습니다.");
  }

  await database.collection("scheduleMembers").deleteOne({ scheduleId, userId });
}
