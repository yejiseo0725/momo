import Link from "next/link";
import { connection } from "next/server";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  await connection();
  const session = await getSession();

  if (session) {
    return (
      <>
        <h1>{session.user.nickname}님, 반가워요.</h1>
        <p>가입한 모임과 새 모임을 한곳에서 확인할 수 있습니다.</p>
        <p>
          <Link href="/gatherings">모임 둘러보기</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>함께하는 시간을 모으는 곳, momo</h1>
      <p>모임 일정, 챌린지, 가계부와 대화를 한곳에서 관리하세요.</p>
      <p>
        <Link href="/register">회원가입</Link> 또는 <Link href="/login">로그인</Link>으로
        시작할 수 있습니다.
      </p>
    </>
  );
}
