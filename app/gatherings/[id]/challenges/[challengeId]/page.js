import { Chip, Typography } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import ChallengeEditModal from '@/app/gatherings/[id]/challenges/ChallengeEditModal';
import ChallengeFeedModal from '@/app/gatherings/[id]/challenges/ChallengeFeedModal';
import HeroToast from '@/components/HeroToast';
import UserInfo from '@/components/UserInfo';
import { getChallengeDetails } from '@/lib/challenges';
import { requireSession } from '@/lib/session';
import { getTodayDateOnly } from '@/lib/utils/documents';
import { getSingleSearchParam } from '@/lib/utils/validation';

function getLatestDoneDate(challengeEndDate, today) {
  return challengeEndDate < today ? challengeEndDate : today;
}

export default async function ChallengeDetailsPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id, challengeId } = await params;
  const query = await searchParams;
  const details = await getChallengeDetails(challengeId, id, session.user.id);

  if (!details) {
    notFound();
  }

  const { challenge, feeds } = details;
  const isAuthor = challenge.userId === session.user.id;
  const today = getTodayDateOnly();

  return (
    <>
      <HeroToast
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />

      <section className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-6">
        <p>
          <Link className="link" href={`/gatherings/${id}/challenges`}>
            ← 챌린지 목록
          </Link>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Typography type="h1">{challenge.title}</Typography>
          <div className="flex flex-wrap items-center gap-2">
            <ChallengeFeedModal
              challengeId={challenge.id}
              defaultDate={getLatestDoneDate(challenge.endDate, today)}
              gatheringId={id}
              imageRequired={challenge.useImage}
              maximumDate={getLatestDoneDate(challenge.endDate, today)}
              minimumDate={challenge.startDate}
            />
            {isAuthor ? (
              <ChallengeEditModal challenge={challenge} gatheringId={id} />
            ) : null}
          </div>
        </div>

        <p className="text-foreground/80">{challenge.description}</p>

        <div className="border-t border-border pt-4">
          <dl className="grid gap-3 sm:grid-cols-[6rem_1fr]">
            <dt className="text-sm font-medium text-muted">기간</dt>
            <dd>
              {challenge.startDate} – {challenge.endDate}
            </dd>
            <dt className="text-sm font-medium text-muted">인증 방식</dt>
            <dd>
              <Chip
                size="md"
                className={
                  challenge.useImage
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-tertiary text-tertiary-foreground font-semibold'
                }
              >
                {challenge.useImage ? '이미지 인증' : '텍스트 인증'}
              </Chip>
            </dd>
            <dt className="text-sm font-medium text-muted">작성자</dt>
            <dd>
              <UserInfo name={challenge.authorName} image={challenge.authorImage} />
            </dd>
            <dt className="text-sm font-medium text-muted">인증 현황</dt>
            <dd>총 {feeds.length}회 인증됨</dd>
          </dl>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Typography type="h2">실천 인증 {feeds.length}개</Typography>
        {feeds.length === 0 ? (
          <p className="text-foreground/70">
            아직 등록된 인증이 없습니다. 첫 번째로 실천을 인증해 보세요!
          </p>
        ) : (
          <ul className="grid gap-4">
            {feeds.map((feed) => (
              <li
                key={feed.id}
                className="flex flex-col gap-2 rounded-large border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between text-sm text-foreground/80">
                  <UserInfo name={feed.authorName} image={feed.authorImage} />
                  <time dateTime={feed.doneDate}>{feed.doneDate}</time>
                </div>
                <p>{feed.description}</p>
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
      </section>
    </>
  );
}
