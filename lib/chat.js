import { requireGatheringMember } from "@/lib/gatherings";
import { getDatabase } from "@/lib/mongodb";
import { getUserProfiles } from "@/lib/users";
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
    .find(messageQuery)
    .sort(afterObjectId ? { _id: 1 } : { createdAt: -1 })
    .limit(100)
    .toArray();

  if (!afterObjectId) {
    messages.reverse();
  }
  const profiles = await getUserProfiles(
    database,
    messages.map((message) => message.userId),
  );

  return messages.map((message) => {
    const profile = profiles.get(message.userId);
    return {
      ...serializeDocument(message),
      authorName: profile?.displayName || "알 수 없는 사용자",
      authorImage: profile?.image || "",
    };
  });
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
    ...serializeDocument({ _id: result.insertedId, ...message }),
    authorName: authorName || "알 수 없는 사용자",
  };
}
