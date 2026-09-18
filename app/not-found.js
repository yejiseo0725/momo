import { Typography } from "@heroui/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col gap-4">
      <Typography type="h1">페이지를 찾을 수 없습니다.</Typography>
      <p>주소가 올바른지 확인해 주세요.</p>
      <Link className="button button--primary" href="/">홈으로 돌아가기</Link>
    </section>
  );
}
