import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import SignupForm from "@/app/signup/SignupForm";
import { getOptionalSession } from "@/lib/session";
import { CATEGORIES } from "@/lib/utils/validation";

export default async function SignupPage() {
  await connection();
  const session = await getOptionalSession();
  if (session) {
    redirect("/");
  }

  return (
    <section>
      <h1>회원가입</h1>
      <p>모임에서 사용할 기본 정보를 입력해 주세요.</p>
      <SignupForm categories={CATEGORIES} />

      <p>이미 계정이 있나요? <Link href="/login">로그인</Link></p>
    </section>
  );
}
