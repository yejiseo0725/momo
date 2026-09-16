"use client";

import { useEffect } from "react";
import { markNotificationsReadAction } from "@/app/notifications/actions";

export default function MarkNotificationsRead({ hasUnread }) {
  useEffect(() => {
    if (hasUnread) {
      markNotificationsReadAction();
    }
  }, [hasUnread]);

  return null;
}
