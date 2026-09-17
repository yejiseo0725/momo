import Link from "next/link";
import { connection } from "next/server";

import EmptyState from "@/components/EmptyState";
import GatheringCard from "@/components/GatheringCard";
import ToastMessage from "@/components/ToastMessage";
import { getJoinedGatherings } from "@/lib/gatherings";
import { requireSession } from "@/lib/session";
import { getSingleSearchParam } from "@/lib/utils/validation";

export default async function MyGatheringsPage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const gatherings = await getJoinedGatherings(session.user.id);

  return (
    <section>
      <div className="section-heading">
        <div>
          <h1>내 모임</h1>
        </div>
        <Link href="/gatherings/new" className="button">새 모임 만들기</Link>
      </div>
      <ToastMessage message={getSingleSearchParam(query.message)} />

      {gatherings.length > 0 ? (
        <div className="card-grid">
          {gatherings.map((gathering) => (
            <GatheringCard key={gathering.id} gathering={gathering} />
          ))}
        </div>
      ) : (
        <EmptyState>가입한 모임이 없습니다.</EmptyState>
      )}
    </section>
  );
}
