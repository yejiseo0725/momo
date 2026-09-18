import './globals.css';

import { Toast, Typography } from '@heroui/react';

import NotificationLink from '@/app/NotificationLink';
import UserAvatar from '@/components/UserAvatar';
import { getUnreadNotificationCount } from '@/lib/notifications';
import { getOptionalSession } from '@/lib/session';
import Link from 'next/link';

export const metadata = {
  title: 'momo',
  description: '함께 시작하고 꾸준히 이어가는 모임 서비스',
};

async function SiteNavigation() {
  const session = await getOptionalSession();
  let unreadCount = 0;

  if (session) {
    try {
      unreadCount = await getUnreadNotificationCount(session.user.id);
    } catch {
      unreadCount = 0;
    }
  }

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label="주요 메뉴"
    >
      <Link className="link" href="/">
        <Typography type="h4">MoMo</Typography>
      </Link>

      {session ? (
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Link className="button button--ghost button--sm" href="/gatherings">
            모임 찾기
          </Link>
          <Link
            className="button button--ghost button--sm"
            href="/my-gatherings"
          >
            내 모임
          </Link>
          <Link className="button button--ghost button--sm" href="/profile">
            <span className="flex items-center gap-2">
              <UserAvatar
                image={session.user.image}
                name={session.user.nickname || session.user.name}
              />
              <span>{session.user.nickname || session.user.name}</span>
            </span>
          </Link>
          <NotificationLink hasUnreadNotifications={unreadCount > 0} />
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Link className="button button--ghost button--sm" href="/login">
            로그인
          </Link>
          <Link className="button button--primary button--sm" href="/signup">
            회원가입
          </Link>
        </div>
      )}
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html
      className="light"
      data-theme="light"
      lang="ko"
      data-scroll-behavior="smooth"
    >
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-background text-foreground font-sans">
        <Toast.Provider placement="top end" />
        <header className="border-b border-border bg-surface">
          <div className="mx-auto w-full max-w-5xl px-4 py-3">
            <SiteNavigation />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto w-full max-w-5xl px-4 py-6">
            <Typography color="muted" type="body-sm">
              momo · 함께할 사람과 오래 이어지는 모임
            </Typography>
          </div>
        </footer>
      </body>
    </html>
  );
}
