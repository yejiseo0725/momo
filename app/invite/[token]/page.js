import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { joinGatheringByInvitationAction } from "@/app/gatherings/actions";
import Message from "@/components/Message";
import { getGatheringInvitation } from "@/lib/gatherings";
import { requireSession } from "@/lib/session";
import { getSingleSearchParam } from "@/lib/utils/validation";

export default async function GatheringInvitationPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { token } = await params;
  const query = await searchParams;
  const invitation = await getGatheringInvitation(token, session.user.id);

  if (!invitation) {
    notFound();
  }

  const { gathering, membership } = invitation;

  if (membership) {
    redirect(`/gatherings/${gathering.id}`);
  }

  const isFull = gathering.memberCount >= gathering.maxMemCount;

  return (
    <section>
      <p><strong>비공개 모임 초대</strong></p>
      <h1>{gathering.name}</h1>
      <p>{gathering.description}</p>
      <p className="meta-list">
        <span>{gathering.category}</span>
        <span>{gathering.region}</span>
        <span>{gathering.memberCount} / {gathering.maxMemCount}명</span>
      </p>
      <Message error={getSingleSearchParam(query.error)} />

      <form action={joinGatheringByInvitationAction}>
        <input type="hidden" name="inviteToken" value={token} />
        <button type="submit" disabled={isFull}>
          {isFull ? "가입 마감" : "초대받은 모임 가입하기"}
        </button>
      </form>
    </section>
  );
}
