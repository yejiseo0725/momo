import Link from "next/link";

export default function NotFound() {
  return (
    <section>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <p>주소가 올바른지 확인해 주세요.</p>
      <Link href="/">홈으로 돌아가기</Link>
    </section>
  );
}
