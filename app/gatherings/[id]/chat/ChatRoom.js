'use client';

import {
  Button,
  Card,
  Description,
  Form,
  Label,
  TextArea,
  TextField,
} from '@heroui/react';
import { useEffect, useRef, useState } from 'react';

import { sendChatMessageAction } from '@/app/gatherings/[id]/chat/actions';
import EmptyState from '@/components/EmptyState';
import HeroToast from '@/components/HeroToast';
import UserInfo from '@/components/UserInfo';
import { io } from 'socket.io-client';

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const SCROLL_THRESHOLD = 60;

export default function ChatRoom({
  gatheringId,
  currentUserId,
  initialMessages,
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [feedback, setFeedback] = useState({ error: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const formRef = useRef(null);
  const socketRef = useRef(null);
  const chatListRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const isInitialMountRef = useRef(true);
  const messagesRef = useRef(messages);
  const isSynchronizingRef = useRef(false);
  const needsSynchronizationRef = useRef(false);

  function isNearBottom(element) {
    if (!element) {
      return true;
    }
    return (
      element.scrollHeight - element.scrollTop - element.clientHeight <=
      SCROLL_THRESHOLD
    );
  }

  function handleScroll() {
    const element = chatListRef.current;
    if (!element) {
      return;
    }

    const atBottom = isNearBottom(element);
    shouldAutoScrollRef.current = atBottom;

    if (atBottom) {
      setUnreadCount(0);
    }
  }

  function handleScrollToBottom() {
    const element = chatListRef.current;
    if (element) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth',
      });
    }
    shouldAutoScrollRef.current = true;
    setUnreadCount(0);
  }

  useEffect(() => {
    messagesRef.current = messages;

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (chatListRef.current) {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      }
      return;
    }

    if (shouldAutoScrollRef.current && chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const socket = io({ path: '/socket.io' });
    socketRef.current = socket;

    async function synchronizeMessages() {
      if (isSynchronizingRef.current) {
        needsSynchronizationRef.current = true;
        return;
      }

      isSynchronizingRef.current = true;

      try {
        do {
          needsSynchronizationRef.current = false;
          const currentList = messagesRef.current;
          const lastMessage = currentList.at(-1);
          const afterQuery = lastMessage
            ? `?after=${encodeURIComponent(lastMessage.id)}`
            : '';
          const response = await fetch(
            `/api/gatherings/${encodeURIComponent(gatheringId)}/chat${afterQuery}`,
            { cache: 'no-store' },
          );

          if (!response.ok) {
            return;
          }

          const data = await response.json();
          if (!Array.isArray(data.messages) || data.messages.length === 0) {
            continue;
          }

          const currentIds = new Set(currentList.map((message) => message.id));
          const newIncomingMessages = data.messages.filter(
            (message) => !currentIds.has(message.id),
          );

          if (newIncomingMessages.length === 0) {
            continue;
          }

          const element = chatListRef.current;
          const atBottom = isNearBottom(element);
          const othersNewMessages = newIncomingMessages.filter(
            (message) => message.userId !== currentUserId,
          );

          if (atBottom || othersNewMessages.length === 0) {
            shouldAutoScrollRef.current = true;
          } else {
            shouldAutoScrollRef.current = false;
            setUnreadCount((prev) => prev + othersNewMessages.length);
          }

          const nextMessages = [...currentList, ...newIncomingMessages].slice(
            -100,
          );
          messagesRef.current = nextMessages;
          setMessages(nextMessages);
        } while (needsSynchronizationRef.current);
      } catch {
        // 일시적인 연결 실패는 다음 소켓 알림이나 페이지 방문 때 다시 동기화한다.
      } finally {
        const shouldSynchronizeAgain = needsSynchronizationRef.current;
        needsSynchronizationRef.current = false;
        isSynchronizingRef.current = false;

        if (shouldSynchronizeAgain) {
          void synchronizeMessages();
        }
      }
    }

    function joinGatheringRoom() {
      socket.emit('join-gathering', gatheringId, (result) => {
        if (result?.allowed) {
          void synchronizeMessages();
        }
      });
    }

    function loadNewMessages(event) {
      if (event?.gatheringId !== gatheringId || !event.message) {
        return;
      }

      const currentList = messagesRef.current;
      if (currentList.some((message) => message.id === event.message.id)) {
        return;
      }

      const element = chatListRef.current;
      const atBottom = isNearBottom(element);

      if (atBottom || event.message.userId === currentUserId) {
        shouldAutoScrollRef.current = true;
      } else {
        shouldAutoScrollRef.current = false;
        setUnreadCount((prev) => prev + 1);
      }

      const nextMessages = [...currentList, event.message]
        .sort(
          (left, right) =>
            left.createdAt.localeCompare(right.createdAt) ||
            left.id.localeCompare(right.id),
        )
        .slice(-100);
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
    }

    socket.on('connect', joinGatheringRoom);
    socket.on('message-created', loadNewMessages);

    return () => {
      socket.off('connect', joinGatheringRoom);
      socket.off('message-created', loadNewMessages);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gatheringId, currentUserId]);

  async function submitMessage(formData) {
    setFeedback({ error: '', message: '' });
    setIsSending(true);

    try {
      const result = await sendChatMessageAction(formData);

      if (result.error) {
        setFeedback({ error: result.error, message: '' });
        return;
      }

      shouldAutoScrollRef.current = true;
      setUnreadCount(0);

      setMessages((currentMessages) => {
        if (
          currentMessages.some((message) => message.id === result.message.id)
        ) {
          return currentMessages;
        }

        const nextMessages = [...currentMessages, result.message].slice(-100);
        messagesRef.current = nextMessages;
        return nextMessages;
      });
      formRef.current?.reset();
      socketRef.current?.emit('notify-message-created', result.socketToken);
    } catch {
      setFeedback({ error: '메시지를 보내지 못했습니다.', message: '' });
    } finally {
      setIsSending(false);
    }
  }

  function handleMessageKeyDown(event) {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();

    if (!isSending) {
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <HeroToast
        error={feedback.error}
        message={feedback.message}
        trigger={feedback}
      />

      <div className="relative flex-1 min-h-0">
        <div
          ref={chatListRef}
          className="flex h-full flex-col gap-3 overflow-y-auto pr-1 pb-4"
          aria-live="polite"
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <EmptyState>첫 메시지를 남겨 보세요.</EmptyState>
          ) : (
            messages.map((message) => {
              const isMine = message.userId === currentUserId;
              return (
                <Card
                  key={message.id}
                  className={isMine ? 'bg-primary text-white' : 'bg-white'}
                >
                  <Card.Header>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <UserInfo
                        name={message.authorName}
                        image={message.authorImage}
                        className={isMine ? 'text-white' : ''}
                      />
                      <small className={isMine ? 'text-white/70' : 'text-muted'}>
                        {dateTimeFormatter.format(new Date(message.createdAt))}
                      </small>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <p>{message.content}</p>
                  </Card.Content>
                </Card>
              );
            })
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 shadow-md"
            onPress={handleScrollToBottom}
            aria-label={`새 메시지 ${unreadCount}개 확인`}
          >
            <span>새 메시지 +{unreadCount}</span>
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </Button>
        )}
      </div>

      <Form
        ref={formRef}
        className="shrink-0 border-t border-border bg-background pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        action={submitMessage}
      >
        <input type="hidden" name="gatheringId" value={gatheringId} />
        <TextField fullWidth isRequired name="content">
          <Label>메시지</Label>
          <div className="flex w-full items-stretch gap-2">
            <TextArea
              id="chat-content"
              rows="3"
              maxLength="1000"
              onKeyDown={handleMessageKeyDown}
              className="flex-1"
            />
            <Button
              type="submit"
              className="!h-auto self-stretch"
              isDisabled={isSending}
              isPending={isSending}
            >
              {isSending ? '보내는 중...' : '보내기'}
            </Button>
          </div>
          <Description>
            Enter로 보내고 Shift+Enter로 줄바꿈합니다.
          </Description>
        </TextField>
      </Form>
    </div>
  );
}
