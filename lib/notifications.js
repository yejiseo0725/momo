import { getDatabase } from "@/lib/mongodb";
import { getUserDisplayNames } from "@/lib/users";
import { parseObjectId, serializeDocument } from "@/lib/utils/documents";

function getMembershipKey(gatheringId, userId) {
  return `${gatheringId}:${userId}`;
}

function getNotificationActionMessage(notification) {
  if (notification.type === "SCHEDULE_CREATED") {
    return "새 일정을 등록했습니다.";
  }
  if (notification.type === "CHALLENGE_CREATED") {
    return "새 챌린지를 등록했습니다.";
  }

  return notification.message;
}

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
  const actorMembershipQueries = [...new Map(
    notifications.map((notification) => {
      const key = getMembershipKey(notification.gatheringId, notification.actorUserId);
      return [key, {
        gatheringId: notification.gatheringId,
        userId: notification.actorUserId,
      }];
    }),
  ).values()];
  const actorMemberships = actorMembershipQueries.length > 0
    ? await database.collection("gatheringMembers").find({
      $or: actorMembershipQueries,
    }).toArray()
    : [];
  const activeActorMemberships = new Set(
    actorMemberships.map((membership) => (
      getMembershipKey(membership.gatheringId, membership.userId)
    )),
  );
  const actorDisplayNames = await getUserDisplayNames(
    database,
    actorMemberships.map((membership) => membership.userId),
  );

  return notifications.map((notification) => {
    const membershipKey = getMembershipKey(
      notification.gatheringId,
      notification.actorUserId,
    );
    const actorName = activeActorMemberships.has(membershipKey)
      ? actorDisplayNames.get(notification.actorUserId) || "알 수 없는 사용자"
      : "탈퇴한유저";

    return {
      ...serializeDocument(notification),
      gatheringName: gatheringNames.get(notification.gatheringId) || "삭제된 모임",
      message: `${actorName} 님이 ${getNotificationActionMessage(notification)}`,
      href: notification.type === "SCHEDULE_CREATED"
        ? `/gatherings/${notification.gatheringId}/schedules/${notification.targetId}`
        : `/gatherings/${notification.gatheringId}/challenges`,
    };
  });
}
