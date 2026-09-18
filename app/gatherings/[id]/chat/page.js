import { Typography } from '@heroui/react';
import { connection } from 'next/server';

import ChatRoom from '@/app/gatherings/[id]/chat/ChatRoom';
import HeroToast from '@/components/HeroToast';
import { getChatMessages } from '@/lib/chat';
import { requireSession } from '@/lib/session';
import { getSingleSearchParam } from '@/lib/utils/validation';

export default async function ChatPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const messages = await getChatMessages(id, session.user.id);

  return (
    <section data-chat-page className="flex h-full min-h-0 flex-col gap-3">
      <HeroToast
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <div className="shrink-0 rounded-[28px] border border-border bg-surface p-4 sm:p-6">
        <Typography type="h1">채팅</Typography>
        <p className="text-sm text-foreground/70">
          최근 메시지 100개를 표시합니다. 새 메시지는 실시간으로 갱신됩니다.
        </p>
      </div>
      <ChatRoom
        gatheringId={id}
        currentUserId={session.user.id}
        initialMessages={messages}
      />
    </section>
  );
}
