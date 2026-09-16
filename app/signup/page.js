import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { signupAction } from "@/app/auth-actions";
import Message from "@/components/Message";
import { getOptionalSession } from "@/lib/session";
import { CATEGORIES, getSingleSearchParam } from "@/lib/utils/validation";

export default async function SignupPage({ searchParams }) {
  await connection();
  const session = await getOptionalSession();
  if (session) {
    redirect("/");
  }

  const query = await searchParams;
  const error = getSingleSearchParam(query.error);

  return (
    <section>
      <h1>회원가입</h1>
      <p>모임에서 사용할 기본 정보를 입력해 주세요.</p>
      <Message error={error} />

      <form action={signupAction}>
        <label htmlFor="name">이름</label>
        <input id="name" name="name" type="text" maxLength="50" required />

        <fieldset>
          <legend>성별</legend>
          <label><input type="radio" name="gender" value="남성" required /> 남성</label>
          <label><input type="radio" name="gender" value="여성" required /> 여성</label>
        </fieldset>

        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" autoComplete="email" required />

        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          name="password"
          type="password"
          minLength="8"
          maxLength="128"
          autoComplete="new-password"
          required
        />
        <small>8자 이상 입력해 주세요.</small>

        <label htmlFor="nickname">닉네임</label>
        <input id="nickname" name="nickname" type="text" maxLength="30" required />

        <fieldset>
          <legend>관심 카테고리</legend>
          {CATEGORIES.map((category) => (
            <label key={category}>
              <input type="checkbox" name="category" value={category} /> {category}
            </label>
          ))}
        </fieldset>

        <label htmlFor="region">지역</label>
        <input id="region" name="region" type="text" maxLength="100" required />

        <button type="submit">가입하기</button>
      </form>

      <p>이미 계정이 있나요? <Link href="/login">로그인</Link></p>
    </section>
  );
}
