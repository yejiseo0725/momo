"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

export default function RealtimeChatListener({ gatheringId }) {
  useEffect(() => {
    const socket = io({ path: "/socket.io" });
    socket.emit("join-gathering", gatheringId);
    socket.on("message-created", (event) => {
      if (event?.gatheringId === gatheringId) {
        window.location.reload();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [gatheringId]);

  return null;
}
