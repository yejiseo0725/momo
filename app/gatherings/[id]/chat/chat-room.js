"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function ChatRoom({ gatheringId, initialMessages, userId }) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io({ path: "/socket.io" });
    socketRef.current = socket;

    socket.on("connect_error", (socketError) => {
      setError(socketError.message || "채팅 서버에 연결하지 못했습니다.");
    });
    socket.on("chat:message", (message) => {
      setMessages((currentMessages) => [...currentMessages, message]);
    });
    socket.emit("chat:join", { gatheringId }, (result) => {
      setError(result.error || "");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gatheringId]);

  function sendMessage(event) {
    event.preventDefault();
    setError("");

    socketRef.current?.emit(
      "chat:send",
      { gatheringId, content },
      (result) => {
        if (result.error) {
          setError(result.error);
          return;
        }
        setContent("");
      },
    );
  }

  return (
    <>
      <h2>단체 채팅</h2>
      {error ? <p role="alert">{error}</p> : null}
      {messages.length === 0 ? (
        <p>아직 메시지가 없습니다. 첫 메시지를 남겨 보세요.</p>
      ) : (
        <ul aria-live="polite">
          {messages.map((message) => (
            <li key={message.id}>
              <strong>{message.userId === userId ? "나" : message.nickname}</strong>
              {" "}
              <small>{new Date(message.createdAt).toLocaleString("ko-KR")}</small>
              <p>{message.content}</p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={sendMessage}>
        <label htmlFor="chat-content">메시지</label>
        <textarea
          id="chat-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={1000}
          required
        />
        <button type="submit">보내기</button>
      </form>
    </>
  );
}
