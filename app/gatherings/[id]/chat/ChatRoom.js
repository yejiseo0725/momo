"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { sendChatMessageAction } from "@/app/gatherings/[id]/chat/actions";
import EmptyState from "@/components/EmptyState";
import ToastMessage from "@/components/ToastMessage";

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function ChatRoom({ gatheringId, currentUserId, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [feedback, setFeedback] = useState({ error: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef(null);
  const socketRef = useRef(null);
  const messagesRef = useRef(messages);
  const isSynchronizingRef = useRef(false);
  const needsSynchronizationRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const socket = io({ path: "/socket.io" });
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
            : "";
          const response = await fetch(
            `/api/gatherings/${encodeURIComponent(gatheringId)}/chat${afterQuery}`,
            { cache: "no-store" },
          );

          if (!response.ok) {
            return;
          }

          const data = await response.json();
          if (!Array.isArray(data.messages) || data.messages.length === 0) {
            continue;
          }

          const currentIds = new Set(currentList.map((message) => message.id));
          const newMessages = data.messages.filter((message) => !currentIds.has(message.id));

          if (newMessages.length === 0) {
            continue;
          }

          const nextMessages = [...currentList, ...newMessages].slice(-100);
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
      socket.emit("join-gathering", gatheringId, synchronizeMessages);
    }

    function loadNewMessages(event) {
      if (event?.gatheringId === gatheringId) {
        void synchronizeMessages();
      }
    }

    socket.on("connect", joinGatheringRoom);
    socket.on("message-created", loadNewMessages);

    return () => {
      socket.off("connect", joinGatheringRoom);
      socket.off("message-created", loadNewMessages);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gatheringId]);

  async function submitMessage(formData) {
    setFeedback({ error: "", message: "" });
    setIsSending(true);

    try {
      const result = await sendChatMessageAction(formData);

      if (result.error) {
        setFeedback({ error: result.error, message: "" });
        return;
      }

      setMessages((currentMessages) => {
        if (currentMessages.some((message) => message.id === result.message.id)) {
          return currentMessages;
        }

        const nextMessages = [...currentMessages, result.message].slice(-100);
        messagesRef.current = nextMessages;
        return nextMessages;
      });
      formRef.current?.reset();
      socketRef.current?.emit("notify-message-created", gatheringId);
    } catch {
      setFeedback({ error: "메시지를 보내지 못했습니다.", message: "" });
    } finally {
      setIsSending(false);
    }
  }

  function handleMessageKeyDown(event) {
    if (
      event.key !== "Enter"
      || event.shiftKey
      || event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();

    if (!isSending) {
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <>
      <ToastMessage
        error={feedback.error}
        message={feedback.message}
        trigger={feedback}
      />

      {messages.length === 0 ? <EmptyState>첫 메시지를 남겨 보세요.</EmptyState> : (
        <div className="stack chat-list" aria-live="polite">
          {messages.map((message) => (
            <article key={message.id} data-mine={message.userId === currentUserId}>
              <p className="chat-meta">
                <strong>{message.authorName}</strong>
                <small>{dateTimeFormatter.format(new Date(message.createdAt))}</small>
              </p>
              <p>{message.content}</p>
            </article>
          ))}
        </div>
      )}

      <form ref={formRef} action={submitMessage}>
        <input type="hidden" name="gatheringId" value={gatheringId} />
        <label htmlFor="chat-content">메시지</label>
        <textarea
          id="chat-content"
          name="content"
          rows="3"
          maxLength="1000"
          aria-describedby="chat-content-help"
          onKeyDown={handleMessageKeyDown}
          required
        />
        <small id="chat-content-help">
          Enter로 보내고 Shift+Enter로 줄바꿈합니다.
        </small>
        <button type="submit" disabled={isSending}>
          {isSending ? "보내는 중..." : "보내기"}
        </button>
      </form>
    </>
  );
}
