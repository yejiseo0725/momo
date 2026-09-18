import { Chip, Typography } from '@heroui/react';

import InviteButton from '@/app/gatherings/[id]/InviteButton';
import LeaveGatheringButton from '@/app/gatherings/[id]/LeaveGatheringButton';
import { joinGatheringAction } from '@/app/gatherings/actions';
import ActionButtonForm from '@/components/ActionButtonForm';
import HeroToast from '@/components/HeroToast';
import UserInfo from '@/components/UserInfo';
import { getGatheringDetails } from '@/lib/gatherings';
import { requireSession } from '@/lib/session';
import { formatDate } from '@/lib/utils/documents';
import { getSingleSearchParam } from '@/lib/utils/validation';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

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
        <div className="relative isolate aspect-[4/3] min-h-48 w-full max-w-[400px] mx-auto overflow-hidden rounded-[28px] border border-border bg-surface">
          <Image
            className="z-0 object-cover object-top"
            src={gathering.imageUrl || '/placeholder-image.png'}
            alt={
              gathering.imageUrl
                ? `${gathering.name} 모임 이미지`
                : '모임 기본 이미지'
            }
            fill
            loading="eager"
            unoptimized
          />
        </div>

        {/* 카테고리부터 모임에 초대까지 하나의 Surface */}
        <div className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-6">
          <div className="flex flex-wrap gap-2">
            <Chip className="bg-accent-sky text-primary font-medium">
              {gathering.category}
            </Chip>
          </div>
          <Typography type="h1">{gathering.name}</Typography>
          <div className="flex flex-wrap gap-2">
            <Chip>{gathering.isPublic ? '공개 모임' : '비공개 모임'}</Chip>
            <Chip
              className={
                isFull ? 'bg-warning text-warning-foreground font-semibold' : ''
              }
            >
              {isFull
                ? '정원 마감'
                : `${gathering.memberCount} / ${gathering.maxMemCount}명`}
            </Chip>
          </div>
          <p className="text-sm text-foreground/60">{gathering.region}</p>
          <p className="text-sm text-foreground/60">
            {formatDate(gathering.createdAt)} 개설
          </p>
          <p>{gathering.description}</p>
          <HeroToast
            error={getSingleSearchParam(query.error)}
            message={getSingleSearchParam(query.message)}
          />

          {/* 버튼 행: 초대(왼쪽) / 가입하기+수정(오른쪽) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              {!gathering.isPublic && membership && gathering.inviteToken ? (
                <InviteButton inviteToken={gathering.inviteToken} />
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!membership ? (
                <ActionButtonForm
                  action={joinGatheringAction}
                  disabled={isFull}
                  fields={{ gatheringId: id }}
                  label={isFull ? '가입 마감' : '가입하기'}
                  pendingLabel="가입하는 중..."
                />
              ) : null}
              {membership?.role === 'LEADER' ? (
                <Link
                  href={`/gatherings/${id}/edit`}
                  className="button button--primary"
                >
                  모임 수정
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Typography type="h2">멤버 {members.length}명</Typography>
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <UserInfo
                image={member.image}
                name={member.displayName}
              >
                <Chip
                  size="md"
                  className={
                    member.role === 'LEADER'
                      ? 'bg-accent-pink text-white font-semibold'
                      : 'bg-accent-sky text-primary font-medium'
                  }
                >
                  {member.role === 'LEADER' ? '모임장' : '멤버'}
                </Chip>
              </UserInfo>
            </div>
          ))}
        </div>
      </section>

      {membership?.role === 'MEMBER' ? (
        <div className="flex justify-end border-t border-border pt-4">
          <LeaveGatheringButton gatheringId={id} />
        </div>
      ) : null}
    </>
  );
}
