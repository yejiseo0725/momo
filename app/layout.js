import Link from "next/link";
import "simpledotcss/simple.css";
import { logoutAction } from "@/app/actions/auth";
import { db } from "@/lib/mongodb";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "momo",
  description: "함께하는 모임 생활을 한곳에서 관리합니다.",
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  const unreadCount = session
    ? await db.collection("notifications").countDocuments({ userId: session.user.id, isRead: false })
    : 0;

  return (
    <html lang="ko">
      <body>
        <header>
          <nav aria-label="주요 메뉴">
            <Link href="/">momo</Link>
            {session ? (
              <>
                <Link href="/gatherings">모임 찾기</Link>
                <Link href="/mypage">마이페이지</Link>
                <Link href="/notifications">알림{unreadCount > 0 ? " ●" : ""}</Link>
                <form action={logoutAction}>
                  <button type="submit">로그아웃</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">로그인</Link>
                <Link href="/register">회원가입</Link>
              </>
            )}
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>momo · 모임의 순간을 함께 기록하세요.</p>
        </footer>
      </body>
    </html>
  );
}
