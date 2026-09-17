import { connection } from "next/server";

import ChatRoom from "@/app/gatherings/[id]/chat/ChatRoom";
import { getChatMessages } from "@/lib/chat";
import { requireSession } from "@/lib/session";

export default async function ChatPage({ params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const messages = await getChatMessages(id, session.user.id);

  return (
    <section>
      <h1>채팅</h1>
      <p>최근 메시지 100개를 표시합니다. 새 메시지는 실시간으로 갱신됩니다.</p>
      <ChatRoom
        gatheringId={id}
        currentUserId={session.user.id}
        initialMessages={messages}
      />
    </section>
  );
}
