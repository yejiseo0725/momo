import "simpledotcss/simple.css";
import "./globals.css";

import Link from "next/link";

import NotificationLink from "@/app/NotificationLink";
import { logoutAction } from "@/app/auth-actions";
import { getOptionalSession } from "@/lib/session";
import { getUnreadNotificationCount } from "@/lib/notifications";

export const metadata = {
  title: "momo",
  description: "함께 시작하고 꾸준히 이어가는 모임 서비스",
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
    <nav className="site-nav" aria-label="주요 메뉴">
      <ul>
        <li>
          <Link href="/">
            <strong>momo</strong>
          </Link>
        </li>
      </ul>

      {session ? (
        <ul>
          <li><Link href="/gatherings">모임 찾기</Link></li>
          <li><Link href="/my-gatherings">내 모임</Link></li>
          <li>
            <NotificationLink hasUnreadNotifications={unreadCount > 0} />
          </li>
          <li><Link href="/profile">{session.user.nickname || session.user.name}</Link></li>
          <li>
            <form action={logoutAction} className="inline-form">
              <button type="submit">로그아웃</button>
            </form>
          </li>
        </ul>
      ) : (
        <ul>
          <li><Link href="/login">로그인</Link></li>
          <li><Link href="/signup">회원가입</Link></li>
        </ul>
      )}
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <header>
          <SiteNavigation />
        </header>
        <main>{children}</main>
        <footer>
          <p>momo · 함께할 사람과 오래 이어지는 모임</p>
        </footer>
      </body>
    </html>
  );
}
