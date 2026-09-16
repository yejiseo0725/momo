import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import {
  joinGatheringAction,
  leaveGatheringAction,
} from "@/app/gatherings/actions";
import Message from "@/components/Message";
import { getGatheringDetails } from "@/lib/gatherings";
import { requireSession } from "@/lib/session";
import { formatDate } from "@/lib/utils/documents";
import { getSingleSearchParam } from "@/lib/utils/validation";

export default async function GatheringHomePage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const details = await getGatheringDetails(id, session.user.id);

  if (!details) {
    notFound();
  }

  const { gathering, membership, members } = details;
  const isFull = gathering.memberCount >= gathering.maxMemCount;

  return (
    <>
      <section>
        <p><strong>{gathering.category}</strong> · {gathering.region}</p>
        <h1>{gathering.name}</h1>
        <p>{gathering.description}</p>
        <p className="meta-list">
          <span>{gathering.memberCount} / {gathering.maxMemCount}명</span>
          <span>{gathering.isPublic ? "공개 모임" : "비공개 모임"}</span>
          <span>{formatDate(gathering.createdAt)} 개설</span>
        </p>
        <Message
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        <div className="actions">
          {!membership ? (
            <form action={joinGatheringAction}>
              <input type="hidden" name="gatheringId" value={id} />
              <button type="submit" disabled={isFull}>
                {isFull ? "가입 마감" : "가입하기"}
              </button>
            </form>
          ) : null}

          {membership?.role === "LEADER" ? (
            <Link href={`/gatherings/${id}/edit`} className="button">모임 수정</Link>
          ) : null}

          {membership?.role === "MEMBER" ? (
            <form action={leaveGatheringAction}>
              <input type="hidden" name="gatheringId" value={id} />
              <button type="submit">모임 탈퇴</button>
            </form>
          ) : null}
        </div>
      </section>

      <section>
        <h2>멤버 {members.length}명</h2>
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {member.displayName}
              {member.role === "LEADER" ? <span className="leader-mark"> · 모임장 ★</span> : " · 멤버"}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
