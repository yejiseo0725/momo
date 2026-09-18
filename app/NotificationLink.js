'use client';

import { Badge } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';

export default function NotificationLink({ hasUnreadNotifications }) {
  const [showUnreadMark, setShowUnreadMark] = useState(hasUnreadNotifications);

  return (
    <Link
      /* 20px 아이콘 + 완전한 원형 버튼 */
      className="relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-foreground/8"
      href="/notifications"
      prefetch={false}
      onClick={() => setShowUnreadMark(false)}
      aria-label="알림"
    >
      <Badge.Anchor>
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M10.268 21a2 2 0 0 0 3.464 0" />
          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
        </svg>
        {showUnreadMark ? (
          <Badge
            color="danger"
            size="sm"
            shape="circle"
            classNames={{ badge: 'min-w-2 h-2 p-0 border-0' }}
          />
        ) : null}
      </Badge.Anchor>
    </Link>
  );
}
