import { Card, Chip, Typography } from '@heroui/react';
import Link from 'next/link';
import { connection } from 'next/server';

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
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Typography type="h1">챌린지</Typography>
          <ChallengeCreateModal gatheringId={id} />
        </div>
        <p>모임 멤버와 함께할 목표를 만들고 실천을 인증하세요.</p>
      </section>

      <section className="grid gap-4">
        {challenges.length === 0 ? (
          <EmptyState>등록된 챌린지가 없습니다.</EmptyState>
        ) : null}
        {challenges.map((challenge) => (
          <Card key={challenge.id}>
            <Card.Header>
              <Card.Description>
                {challenge.startDate} – {challenge.endDate}
              </Card.Description>
              <Card.Title>
                <Link
                  className="link font-bold text-lg"
                  href={`/gatherings/${id}/challenges/${challenge.id}`}
                >
                  {challenge.title}
                </Link>
              </Card.Title>
              <div className="flex flex-wrap gap-2">
                <Chip size="md">작성자 {challenge.authorName}</Chip>
                <Chip size="md">
                  이미지 {challenge.useImage ? '필수' : '선택'}
                </Chip>
                <Chip size="md">
                  인증 {challenge.feedCount ?? challenge.feeds?.length ?? 0}개
                </Chip>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="line-clamp-2">{challenge.description}</p>
            </Card.Content>
            <Card.Footer className="flex justify-end">
              <Link
                className="button button--outline"
                href={`/gatherings/${id}/challenges/${challenge.id}`}
              >
                자세히 보기
              </Link>
            </Card.Footer>
          </Card>
        ))}
      </section>
    </>
  );
}
