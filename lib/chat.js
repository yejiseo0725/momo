import { GatheringError, requireGatheringMember } from "@/lib/gatherings";
import { getDatabase } from "@/lib/mongodb";
import { getUserDisplayNames } from "@/lib/users";
import { parseObjectId, serializeDocument } from "@/lib/utils/documents";

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
    .find(messageQuery, {
      projection: {
        userId: 1,
        content: 1,
        createdAt: 1,
      },
    })
    .sort(afterObjectId ? { _id: -1 } : { createdAt: -1 })
    .limit(100)
    .toArray();

  messages.reverse();
  const displayNames = await getUserDisplayNames(
    database,
    messages.map((message) => message.userId),
  );

  return messages.map((message) => ({
    ...serializeDocument(message),
    authorName: displayNames.get(message.userId) || "알 수 없는 사용자",
  }));
}

export async function createChatMessage(gatheringId, userId, content, authorName) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const chatRoom = await getChatRoom(database, gatheringId);

  if (!chatRoom) {
    throw new GatheringError("채팅방을 찾을 수 없습니다.");
  }

  const createdAt = new Date();
  const message = {
    chatRoomId: chatRoom._id.toString(),
    userId,
    content,
    createdAt,
  };
  const result = await database.collection("chatMessages").insertOne(message);

  return {
    id: result.insertedId.toString(),
    userId,
    content,
    createdAt: createdAt.toISOString(),
    authorName: authorName || "알 수 없는 사용자",
  };
}
