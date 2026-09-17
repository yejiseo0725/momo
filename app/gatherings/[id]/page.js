import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import {
  joinGatheringAction,
  leaveGatheringAction,
} from "@/app/gatherings/actions";
import InviteButton from "@/app/gatherings/[id]/InviteButton";
import ActionButtonForm from "@/components/ActionButtonForm";
import ToastMessage from "@/components/ToastMessage";
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
        <ToastMessage
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        <div className="actions">
          {!membership ? (
            <ActionButtonForm
              action={joinGatheringAction}
              disabled={isFull}
              fields={{ gatheringId: id }}
              label={isFull ? "가입 마감" : "가입하기"}
              pendingLabel="가입하는 중..."
            />
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

        {!gathering.isPublic && membership && gathering.inviteToken ? (
          <InviteButton inviteToken={gathering.inviteToken} />
        ) : null}
      </section>

      <section>
        <h2>멤버 {members.length}명</h2>
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {member.displayName}
              {member.role === "LEADER" ? (
                <span className="leader-mark">
                  · 모임장
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                    <path d="M5 21h14" />
                  </svg>
                </span>
              ) : " · 멤버"}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
