import { getDatabase } from "@/lib/mongodb";
import { parseObjectId, serializeDocument } from "@/lib/utils/documents";

export async function getUnreadNotificationCount(userId) {
  const database = await getDatabase();
  return database.collection("notifications").countDocuments({
    userId,
    isRead: false,
  });
}

export async function createGatheringNotifications({
  gatheringId,
  actorUserId,
  type,
  targetId,
  message,
}) {
  const database = await getDatabase();
  const members = await database
    .collection("gatheringMembers")
    .find({
      gatheringId,
      userId: { $ne: actorUserId },
    })
    .toArray();

  if (members.length === 0) {
    return;
  }

  const createdAt = new Date();
  await database.collection("notifications").insertMany(
    members.map((member) => ({
      userId: member.userId,
      actorUserId,
      gatheringId,
      type,
      targetId,
      message,
      isRead: false,
      createdAt,
    })),
  );
}

export async function getNotifications(userId) {
  const database = await getDatabase();
  const notifications = await database
    .collection("notifications")
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  await database.collection("notifications").updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } },
  );

  const gatheringIds = [...new Set(notifications.map((item) => item.gatheringId))]
    .map(parseObjectId)
    .filter(Boolean);
  const gatherings = gatheringIds.length > 0
    ? await database.collection("gatherings").find({ _id: { $in: gatheringIds } }).toArray()
    : [];
  const gatheringNames = new Map(
    gatherings.map((gathering) => [gathering._id.toString(), gathering.name]),
  );

  return notifications.map((notification) => ({
    ...serializeDocument(notification),
    gatheringName: gatheringNames.get(notification.gatheringId) || "삭제된 모임",
    href: notification.type === "SCHEDULE_CREATED"
      ? `/gatherings/${notification.gatheringId}/schedules/${notification.targetId}`
      : `/gatherings/${notification.gatheringId}/challenges`,
  }));
}
