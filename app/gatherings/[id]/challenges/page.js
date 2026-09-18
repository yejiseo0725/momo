import { Card, Chip, Typography } from '@heroui/react';

import ChallengeCreateModal from '@/app/gatherings/[id]/challenges/ChallengeCreateModal';
import ChallengeEditModal from '@/app/gatherings/[id]/challenges/ChallengeEditModal';
import ChallengeFeedModal from '@/app/gatherings/[id]/challenges/ChallengeFeedModal';
import EmptyState from '@/components/EmptyState';
import HeroToast from '@/components/HeroToast';
import { getChallenges } from '@/lib/challenges';
import { requireSession } from '@/lib/session';
import { getTodayDateOnly } from '@/lib/utils/documents';
import { getSingleSearchParam } from '@/lib/utils/validation';
import Image from 'next/image';
import { connection } from 'next/server';

function getLatestDoneDate(challengeEndDate, today) {
  return challengeEndDate < today ? challengeEndDate : today;
}

export default async function ChallengesPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const challenges = await getChallenges(id, session.user.id);
  const today = getTodayDateOnly();

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
              <Card.Title>{challenge.title}</Card.Title>
              <div className="flex flex-wrap gap-2">
                <Chip size="md">작성자 {challenge.authorName}</Chip>
                <Chip size="md">
                  이미지 {challenge.useImage ? '필수' : '선택'}
                </Chip>
              </div>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <p>{challenge.description}</p>

              <ChallengeFeedModal
                challengeId={challenge.id}
                defaultDate={getLatestDoneDate(challenge.endDate, today)}
                gatheringId={id}
                imageRequired={challenge.useImage}
                maximumDate={getLatestDoneDate(challenge.endDate, today)}
                minimumDate={challenge.startDate}
              />

              {challenge.userId === session.user.id ? (
                <ChallengeEditModal challenge={challenge} gatheringId={id} />
              ) : null}
            </Card.Content>

            <Card.Footer className="flex flex-col items-stretch gap-3">
              <Typography type="h3">인증 {challenge.feeds.length}개</Typography>
              {challenge.feeds.length === 0 ? (
                <p>아직 인증이 없습니다.</p>
              ) : (
                <ul className="grid gap-4">
                  {challenge.feeds.map((feed) => (
                    <li className="flex flex-col gap-2" key={feed.id}>
                      <strong>
                        {feed.doneDate} · {feed.authorName}
                      </strong>{' '}
                      — {feed.description}
                      {feed.imageId ? (
                        <Image
                          className="h-auto w-full max-w-lg rounded-medium"
                          src={`/api/challenge-feed-images/${feed.imageId}`}
                          alt={`${feed.authorName}님의 챌린지 인증 이미지`}
                          width={640}
                          height={480}
                          unoptimized
                        />
                      ) : null}
                      {!feed.imageId && feed.imageUrl ? (
                        <a
                          className="link"
                          href={feed.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          기존 이미지 링크
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Card.Footer>
          </Card>
        ))}
      </section>
    </>
  );
}
