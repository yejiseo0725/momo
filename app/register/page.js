import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { registerAction } from "@/app/actions/auth";
import { CATEGORIES, GENDERS } from "@/lib/constants";
import { getSession } from "@/lib/session";

export default async function RegisterPage({ searchParams }) {
  await connection();
  const session = await getSession();
  const { error } = await searchParams;

  if (session) {
    redirect("/");
  }

  return (
    <>
      <h1>회원가입</h1>
      {error ? <p role="alert">{error}</p> : null}
      <form action={registerAction}>
        <label htmlFor="name">이름</label>
        <input id="name" name="name" autoComplete="name" required />

        <fieldset>
          <legend>성별</legend>
          {GENDERS.map((gender) => (
            <label key={gender}>
              <input type="radio" name="gender" value={gender} required /> {gender}
            </label>
          ))}
        </fieldset>

        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" autoComplete="email" required />

        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <label htmlFor="nickname">닉네임</label>
        <input id="nickname" name="nickname" required />

        <fieldset>
          <legend>관심 카테고리</legend>
          {CATEGORIES.map((category) => (
            <label key={category}>
              <input type="checkbox" name="category" value={category} /> {category}
            </label>
          ))}
        </fieldset>

        <label htmlFor="region">지역</label>
        <input id="region" name="region" placeholder="예: 서울 마포구" required />

        <button type="submit">가입하기</button>
      </form>
      <p>
        이미 계정이 있다면 <Link href="/login">로그인</Link>해 주세요.
      </p>
    </>
  );
}
