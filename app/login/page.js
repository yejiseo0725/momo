import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { loginAction } from "@/app/actions/auth";
import { getSession } from "@/lib/session";

export default async function LoginPage({ searchParams }) {
  await connection();
  const session = await getSession();
  const { error } = await searchParams;

  if (session) {
    redirect("/");
  }

  return (
    <>
      <h1>로그인</h1>
      {error ? <p role="alert">{error}</p> : null}
      <form action={loginAction}>
        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" autoComplete="email" required />

        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />

        <button type="submit">로그인</button>
      </form>
      <p>
        아직 계정이 없다면 <Link href="/register">회원가입</Link>을 진행해 주세요.
      </p>
    </>
  );
}
