import Link from "next/link";
import { notFound } from "next/navigation";
import { toObjectId } from "@/lib/database-helpers";
import { getGatheringMembership } from "@/lib/gathering-access";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export default async function GatheringLayout({ children, params }) {
  const session = await requireSession();
  const { id } = await params;
  const objectId = toObjectId(id);
  const [gathering, membership] = await Promise.all([
    objectId ? db.collection("gatherings").findOne({ _id: objectId }) : null,
    getGatheringMembership(id, session.user.id),
  ]);

  if (!gathering || (!gathering.isPublic && !membership)) {
    notFound();
  }

  return (
    <>
      <nav aria-label={`${gathering.name} 메뉴`}>
        <Link href={`/gatherings/${id}`}>홈</Link>
        {membership ? (
          <>
            <Link href={`/gatherings/${id}/challenges`}>챌린지</Link>
            <Link href={`/gatherings/${id}/schedules`}>일정</Link>
            <Link href={`/gatherings/${id}/cashbook`}>가계부</Link>
            <Link href={`/gatherings/${id}/chat`}>채팅</Link>
          </>
        ) : null}
      </nav>
      {children}
    </>
  );
}
