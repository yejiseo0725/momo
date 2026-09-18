import { Typography } from '@heroui/react';
import { connection } from 'next/server';

import ChallengeCard from '@/app/gatherings/[id]/challenges/ChallengeCard';
import ChallengeCreateModal from '@/app/gatherings/[id]/challenges/ChallengeCreateModal';
import EmptyState from '@/components/EmptyState';
import HeroToast from '@/components/HeroToast';
import { getChallenges } from '@/lib/challenges';
import { requireSession } from '@/lib/session';
import { getSingleSearchParam } from '@/lib/utils/validation';

export default async function ChallengesPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const challenges = await getChallenges(id, session.user.id);

  return (
    <>
      <HeroToast
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <section className="flex flex-col gap-2 rounded-[28px] border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Typography type="h1">챌린지</Typography>
          <ChallengeCreateModal gatheringId={id} />
        </div>
        <p className="text-sm text-foreground/70">
          모임 멤버와 함께할 목표를 만들고 실천을 인증하세요.
        </p>
      </section>

      <section className="grid gap-4">
        {challenges.length === 0 ? (
          <EmptyState>등록된 챌린지가 없습니다.</EmptyState>
        ) : null}
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            gatheringId={id}
          />
        ))}
      </section>
    </>
  );
}
