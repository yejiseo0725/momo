import { Button, Chip, Typography } from "@heroui/react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { joinGatheringByInvitationAction } from "@/app/gatherings/actions";
import ToastMessage from "@/components/ToastMessage";
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
    <section className="flex flex-col gap-4">
      <Typography color="muted" weight="semibold">비공개 모임 초대</Typography>
      <Typography type="h1">{gathering.name}</Typography>
      <p>{gathering.description}</p>
      <div className="flex flex-wrap gap-2">
        <Chip>{gathering.category}</Chip>
        <Chip>{gathering.region}</Chip>
        <Chip>{gathering.memberCount} / {gathering.maxMemCount}명</Chip>
      </div>
      <ToastMessage error={getSingleSearchParam(query.error)} />

      <form action={joinGatheringByInvitationAction}>
        <input type="hidden" name="inviteToken" value={token} />
        <Button type="submit" isDisabled={isFull}>
          {isFull ? "가입 마감" : "초대받은 모임 가입하기"}
        </Button>
      </form>
    </section>
  );
}
