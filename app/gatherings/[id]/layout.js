import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { getGatheringDetails } from "@/lib/gatherings";
import { requireSession } from "@/lib/session";

export default async function GatheringLayout({ children, params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const details = await getGatheringDetails(id, session.user.id);

  if (!details) {
    notFound();
  }

  return (
    <>
      <nav className="gathering-nav" aria-label={`${details.gathering.name} 메뉴`}>
        <Link href={`/gatherings/${id}`}><strong>{details.gathering.name}</strong></Link>
        {details.membership ? (
          <>
            <Link href={`/gatherings/${id}/challenges`}>챌린지</Link>
            <Link href={`/gatherings/${id}/schedules`}>일정</Link>
            <Link href={`/gatherings/${id}/cash-books`}>가계부</Link>
            <Link href={`/gatherings/${id}/chat`}>채팅</Link>
          </>
        ) : null}
      </nav>
      {children}
    </>
  );
}
