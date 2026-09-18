import { Typography } from "@heroui/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import LoginForm from "@/app/login/LoginForm";
import { getOptionalSession } from "@/lib/session";
import { getSingleSearchParam, isSafeInternalPath } from "@/lib/utils/validation";

export default async function LoginPage({ searchParams }) {
  await connection();
  const session = await getOptionalSession();
  if (session) {
    redirect("/");
  }

  const query = await searchParams;
  const requestedNextPath = getSingleSearchParam(query.next);
  const nextPath = isSafeInternalPath(requestedNextPath) ? requestedNextPath : "/";

  return (
    <section className="flex flex-col gap-4">
      <Typography type="h1">로그인</Typography>
      <p>momo에서 내 모임으로 돌아가세요.</p>
      <LoginForm nextPath={nextPath} />

      <p>처음 오셨나요? <Link className="link" href="/signup">회원가입</Link></p>
    </section>
  );
}
