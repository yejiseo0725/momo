import { Button, Card, Chip, Typography } from "@heroui/react";
import Image from "next/image";
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
      <section className="flex flex-col gap-4">
        <div className="mr-auto w-full max-w-[600px] overflow-hidden">
          <Image
            className="h-full w-full object-cover"
            src={gathering.imageUrl || "/gathering-default.svg"}
            alt={gathering.imageUrl
              ? `${gathering.name} 모임 이미지`
              : "모임 기본 이미지"}
            width={600}
            height={400}
            unoptimized
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip>{gathering.category}</Chip>
          <Chip>{gathering.region}</Chip>
        </div>
        <Typography type="h1">{gathering.name}</Typography>
        <p>{gathering.description}</p>
        <div className="flex flex-wrap gap-2">
          <Chip>{gathering.memberCount} / {gathering.maxMemCount}명</Chip>
          <Chip>{gathering.isPublic ? "공개 모임" : "비공개 모임"}</Chip>
          <Chip>{formatDate(gathering.createdAt)} 개설</Chip>
        </div>
        <ToastMessage
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        <div className="flex flex-wrap items-center gap-2">
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
            <Link href={`/gatherings/${id}/edit`} className="button button--primary">모임 수정</Link>
          ) : null}

          {membership?.role === "MEMBER" ? (
            <form action={leaveGatheringAction}>
              <input type="hidden" name="gatheringId" value={id} />
              <Button type="submit" variant="danger-soft">모임 탈퇴</Button>
            </form>
          ) : null}
        </div>

        {!gathering.isPublic && membership && gathering.inviteToken ? (
          <InviteButton inviteToken={gathering.inviteToken} />
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <Typography type="h2">멤버 {members.length}명</Typography>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id}>
              <Card.Content>
                <div className="flex items-center justify-between gap-2">
                  <span>{member.displayName}</span>
                  <Chip size="sm">{member.role === "LEADER" ? "모임장" : "멤버"}</Chip>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
