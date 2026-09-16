import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { joinGatheringAction } from "@/app/gatherings/actions";
import { toObjectId } from "@/lib/database-helpers";
import { getGatheringMembership } from "@/lib/gathering-access";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export default async function InvitationPage({ params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) notFound();
  const [gathering, membership, memberCount] = await Promise.all([
    db.collection("gatherings").findOne({ _id: objectId }),
    getGatheringMembership(id, session.user.id),
    db.collection("gatheringMembers").countDocuments({ gatheringId: id }),
  ]);
  if (!gathering) notFound();
  if (membership) redirect(`/gatherings/${id}`);
  const isFull = memberCount >= gathering.maxMemCount;

  return (
    <>
      <h1>{gathering.name} 초대</h1>
      <p>{gathering.description}</p>
      <p>{gathering.region} · {gathering.category} · {memberCount}/{gathering.maxMemCount}명</p>
      <form action={joinGatheringAction}>
        <input type="hidden" name="gatheringId" value={id} />
        <input type="hidden" name="invitation" value="true" />
        <button type="submit" disabled={isFull}>{isFull ? "가입 마감" : "초대 수락"}</button>
      </form>
    </>
  );
}
