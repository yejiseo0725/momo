import { requireGatheringMember } from "@/lib/gatherings";
import { getDatabase } from "@/lib/mongodb";
import { getUserDisplayNames } from "@/lib/users";
import { parseObjectId, serializeDocument } from "@/lib/utils/documents";

async function getOrCreateChatRoom(database, gatheringId) {
  await database.collection("chatRooms").updateOne(
    { gatheringId },
    { $setOnInsert: { gatheringId, createdAt: new Date() } },
    { upsert: true },
  );
  return database.collection("chatRooms").findOne({ gatheringId });
}

async function getChatRoom(database, gatheringId) {
  return database.collection("chatRooms").findOne({ gatheringId });
}

export async function getChatMessages(gatheringId, userId, { afterMessageId = "" } = {}) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const chatRoom = await getChatRoom(database, gatheringId);

  if (!chatRoom) {
    return [];
  }

  const chatRoomId = chatRoom._id.toString();
  const afterObjectId = parseObjectId(afterMessageId);
  const messageQuery = afterObjectId
    ? { chatRoomId, _id: { $gt: afterObjectId } }
    : { chatRoomId };
  const messages = await database
    .collection("chatMessages")
    .find(messageQuery)
    .sort(afterObjectId ? { _id: 1 } : { createdAt: -1 })
    .limit(100)
    .toArray();

  if (!afterObjectId) {
    messages.reverse();
  }
  const displayNames = await getUserDisplayNames(
    database,
    messages.map((message) => message.userId),
  );

  return messages.map((message) => ({
    ...serializeDocument(message),
    authorName: displayNames.get(message.userId) || "알 수 없는 사용자",
  }));
}

export async function createChatMessage(gatheringId, userId, content) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const chatRoom = await getOrCreateChatRoom(database, gatheringId);
  const createdAt = new Date();
  const message = {
    chatRoomId: chatRoom._id.toString(),
    userId,
    content,
    createdAt,
  };
  const result = await database.collection("chatMessages").insertOne(message);
  const displayNames = await getUserDisplayNames(database, [userId]);

  return {
    ...serializeDocument({ _id: result.insertedId, ...message }),
    authorName: displayNames.get(userId) || "알 수 없는 사용자",
  };
}
