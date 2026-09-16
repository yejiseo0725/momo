import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { loginAction } from "@/app/auth-actions";
import Message from "@/components/Message";
import { getOptionalSession } from "@/lib/session";
import { getSingleSearchParam, isSafeInternalPath } from "@/lib/utils/validation";

export default async function LoginPage({ searchParams }) {
  await connection();
  const session = await getOptionalSession();
  if (session) {
    redirect("/");
  }

  const query = await searchParams;
  const error = getSingleSearchParam(query.error);
  const requestedNextPath = getSingleSearchParam(query.next);
  const nextPath = isSafeInternalPath(requestedNextPath) ? requestedNextPath : "/";

  return (
    <section>
      <h1>로그인</h1>
      <p>momo에서 내 모임으로 돌아가세요.</p>
      <Message error={error} />

      <form action={loginAction}>
        <input type="hidden" name="next" value={nextPath} />

        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" autoComplete="email" required />

        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          name="password"
          type="password"
          minLength="8"
          maxLength="128"
          autoComplete="current-password"
          required
        />

        <button type="submit">로그인</button>
      </form>

      <p>처음 오셨나요? <Link href="/signup">회원가입</Link></p>
    </section>
  );
}
