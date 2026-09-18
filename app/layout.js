import './globals.css';

import { Toast, Typography } from '@heroui/react';

import NotificationLink from '@/app/NotificationLink';
import UserInfo from '@/components/UserInfo';
import { getUnreadNotificationCount } from '@/lib/notifications';
import { getOptionalSession } from '@/lib/session';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: '모모 - 모두의 모임, 모임을 관리해보세요',
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
      <Link
        className="flex items-center gap-2"
        href="/"
        aria-label="MoMo 홈으로 이동"
      >
        <Image
          src="/symbol.png"
          alt="MoMo"
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 object-contain"
          priority
        />
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="font-bold text-foreground">모모 - 모두의 모임</span>
          <span className="text-sm font-normal text-foreground/60">
            모임을 관리해보세요
          </span>
        </div>
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
          <NotificationLink hasUnreadNotifications={unreadCount > 0} />
          <Link className="button button--ghost button--sm" href="/profile">
            <UserInfo
              image={session.user.image}
              name={session.user.nickname || session.user.name}
            />
          </Link>
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
        <header className="sticky top-0 z-50 border-b border-border/60 bg-surface/90 backdrop-blur-md backdrop-saturate-150">
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
