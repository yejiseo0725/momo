"use client";

import Link from "next/link";
import { useState } from "react";

export default function NotificationLink({ hasUnreadNotifications }) {
  const [showUnreadMark, setShowUnreadMark] = useState(hasUnreadNotifications);

  return (
    <Link
      href="/notifications"
      prefetch={false}
      onClick={() => setShowUnreadMark(false)}
    >
      알림{showUnreadMark ? <span className="unread-mark"> ●</span> : null}
    </Link>
  );
}
