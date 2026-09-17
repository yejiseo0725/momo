"use client";

import Link from "next/link";
import { useState } from "react";
import { Chip } from "@heroui/react";

export default function NotificationLink({ hasUnreadNotifications }) {
  const [showUnreadMark, setShowUnreadMark] = useState(hasUnreadNotifications);

  return (
    <Link
      className="button button--ghost button--sm"
      href="/notifications"
      prefetch={false}
      onClick={() => setShowUnreadMark(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M10.268 21a2 2 0 0 0 3.464 0" />
        <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
      </svg>
      <span>알림</span>
      {showUnreadMark ? <Chip color="danger" size="sm">새 알림</Chip> : null}
    </Link>
  );
}
