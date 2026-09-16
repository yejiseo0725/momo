import { connection } from "next/server";

import RealtimeChatListener from "@/app/gatherings/[id]/chat/RealtimeChatListener";
import { sendChatMessageAction } from "@/app/gatherings/[id]/chat/actions";
import EmptyState from "@/components/EmptyState";
import Message from "@/components/Message";
import { getChatMessages } from "@/lib/chat";
import { requireSession } from "@/lib/session";
import { formatDateTime } from "@/lib/utils/documents";
import { getSingleSearchParam } from "@/lib/utils/validation";

export default async function ChatPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const messages = await getChatMessages(id, session.user.id);

  return (
    <section>
      <RealtimeChatListener gatheringId={id} />
      <h1>채팅</h1>
      <p>최근 메시지 100개를 표시합니다. 새 메시지는 실시간으로 갱신됩니다.</p>
      <Message error={getSingleSearchParam(query.error)} />

      {messages.length === 0 ? <EmptyState>첫 메시지를 남겨 보세요.</EmptyState> : (
        <div className="stack chat-list" aria-live="polite">
          {messages.map((message) => (
            <article key={message.id} data-mine={message.userId === session.user.id}>
              <p className="chat-meta">
                <strong>{message.authorName}</strong>
                <small>{formatDateTime(message.createdAt)}</small>
              </p>
              <p>{message.content}</p>
            </article>
          ))}
        </div>
      )}

      <form action={sendChatMessageAction}>
        <input type="hidden" name="gatheringId" value={id} />
        <label htmlFor="chat-content">메시지</label>
        <textarea id="chat-content" name="content" rows="3" maxLength="1000" required />
        <button type="submit">보내기</button>
      </form>
    </section>
  );
}
