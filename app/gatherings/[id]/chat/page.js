import { connection } from "next/server";

import ChatRoom from "@/app/gatherings/[id]/chat/ChatRoom";
import ToastMessage from "@/components/ToastMessage";
import { getChatMessages } from "@/lib/chat";
import { requireSession } from "@/lib/session";
import { getSingleSearchParam } from "@/lib/utils/validation";

export default async function ChatPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const messages = await getChatMessages(id, session.user.id);

  return (
    <section>
      <ToastMessage
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
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
