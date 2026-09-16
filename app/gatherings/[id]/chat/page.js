import { connection } from "next/server";
import ChatRoom from "@/app/gatherings/[id]/chat/chat-room";
import { userIdCandidates } from "@/lib/database-helpers";
import { requireGatheringMember } from "@/lib/gathering-access";
import { serializeChatMessage } from "@/lib/chat";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export default async function ChatPage({ params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  await requireGatheringMember(id, session.user.id);
  const chatRoom = await db.collection("chatRooms").findOne({ gatheringId: id });
  const messages = chatRoom ? await db.collection("chatMessages").find({ chatRoomId: chatRoom._id.toString() }).sort({ createdAt: 1 }).limit(100).toArray() : [];
  const users = await db.collection("users").find({ _id: { $in: messages.flatMap((message) => userIdCandidates(message.userId)) } }).toArray();
  const userById = new Map(users.map((user) => [user._id.toString(), user]));
  const initialMessages = messages.map((message) => serializeChatMessage(message, userById.get(message.userId)?.nickname || "멤버"));

  return <ChatRoom gatheringId={id} initialMessages={initialMessages} userId={session.user.id} />;
}
