import Link from "next/link";
import { ObjectId } from "mongodb";
import { connection } from "next/server";
import GatheringCard from "@/components/gathering-card";
import { db } from "@/lib/mongodb";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  await connection();
  const session = await getSession();

  if (session) {
    const memberships = await db
      .collection("gatheringMembers")
      .find({ userId: session.user.id })
      .limit(9)
      .toArray();
    const gatheringIds = memberships.map((membership) => membership.gatheringId);
    const gatheringObjectIds = gatheringIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    const joinedGatherings = await db
      .collection("gatherings")
      .find({ _id: { $in: gatheringObjectIds } })
      .sort({ createdAt: -1 })
      .toArray();
    const recommendedGatherings = await db
      .collection("gatherings")
      .find({ isPublic: true, _id: { $nin: gatheringObjectIds } })
      .sort({ createdAt: -1 })
      .limit(9)
      .toArray();

    return (
      <>
        <h1>{session.user.nickname}님, 반가워요.</h1>
        <section>
          <h2>내가 가입한 모임</h2>
          {joinedGatherings.length === 0 ? (
            <p>가입한 모임이 없습니다.</p>
          ) : (
            joinedGatherings.map((gathering) => (
              <GatheringCard
                key={gathering._id.toString()}
                gathering={gathering}
                leader={memberships.some(
                  (membership) => membership.gatheringId === gathering._id.toString() && membership.role === "LEADER",
                )}
              />
            ))
          )}
        </section>
        <section>
          <h2>추천 모임</h2>
          <p><Link href="/gatherings">더보기</Link></p>
          {recommendedGatherings.length === 0 ? <p>추천할 새 모임이 없습니다.</p> : recommendedGatherings.map((gathering) => (
            <GatheringCard key={gathering._id.toString()} gathering={gathering} />
          ))}
        </section>
      </>
    );
  }

  return (
    <>
      <h1>함께하는 시간을 모으는 곳, momo</h1>
      <p>모임 일정, 챌린지, 가계부와 대화를 한곳에서 관리하세요.</p>
      <p>
        <Link href="/register">회원가입</Link> 또는 <Link href="/login">로그인</Link>으로
        시작할 수 있습니다.
      </p>
    </>
  );
}
