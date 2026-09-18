import { Card, Chip, Disclosure, Typography } from "@heroui/react";
import { connection } from "next/server";
import Image from "next/image";

import {
  deleteChallengeAction,
} from "@/app/gatherings/[id]/challenges/actions";
import ChallengeFeedForm from "@/app/gatherings/[id]/challenges/ChallengeFeedForm";
import ChallengeForm from "@/app/gatherings/[id]/challenges/ChallengeForm";
import ActionButtonForm from "@/components/ActionButtonForm";
import EmptyState from "@/components/EmptyState";
import ToastMessage from "@/components/ToastMessage";
import { getChallenges } from "@/lib/challenges";
import { requireSession } from "@/lib/session";
import { getTodayDateOnly } from "@/lib/utils/documents";
import { getSingleSearchParam } from "@/lib/utils/validation";

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
      <ToastMessage
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <section className="flex flex-col gap-4">
        <Typography type="h1">챌린지</Typography>
        <p>모임 멤버와 함께할 목표를 만들고 실천을 인증하세요.</p>
        <Disclosure>
          <Disclosure.Heading>
            <Disclosure.Trigger>
              새 챌린지 만들기
              <Disclosure.Indicator />
            </Disclosure.Trigger>
          </Disclosure.Heading>
          <Disclosure.Content>
            <ChallengeForm
              gatheringId={id}
              initialValues={{
                title: "",
                description: "",
                useImage: false,
                startDate: "",
                endDate: "",
              }}
              mode="create"
            />
          </Disclosure.Content>
        </Disclosure>
      </section>

      <section className="grid gap-4">
        {challenges.length === 0 ? <EmptyState>등록된 챌린지가 없습니다.</EmptyState> : null}
        {challenges.map((challenge) => (
          <Card key={challenge.id}>
            <Card.Header>
              <Card.Description>{challenge.startDate} – {challenge.endDate}</Card.Description>
              <Card.Title>{challenge.title}</Card.Title>
              <div className="flex flex-wrap gap-2">
                <Chip size="sm">작성자 {challenge.authorName}</Chip>
                <Chip size="sm">이미지 {challenge.useImage ? "필수" : "선택"}</Chip>
              </div>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <p>{challenge.description}</p>

              <Disclosure>
                <Disclosure.Heading>
                  <Disclosure.Trigger>
                    실천 인증하기
                    <Disclosure.Indicator />
                  </Disclosure.Trigger>
                </Disclosure.Heading>
                <Disclosure.Content>
                  <ChallengeFeedForm
                    challengeId={challenge.id}
                    defaultDate={getLatestDoneDate(challenge.endDate, today)}
                    gatheringId={id}
                    imageRequired={challenge.useImage}
                    maximumDate={getLatestDoneDate(challenge.endDate, today)}
                    minimumDate={challenge.startDate}
                  />
                </Disclosure.Content>
              </Disclosure>

              {challenge.userId === session.user.id ? (
                <Disclosure>
                  <Disclosure.Heading>
                    <Disclosure.Trigger>
                      챌린지 수정
                      <Disclosure.Indicator />
                    </Disclosure.Trigger>
                  </Disclosure.Heading>
                  <Disclosure.Content>
                    <div className="flex flex-col gap-4">
                      <ChallengeForm
                        challengeId={challenge.id}
                        gatheringId={id}
                        initialValues={{
                          title: challenge.title,
                          description: challenge.description,
                          useImage: challenge.useImage,
                          startDate: challenge.startDate,
                          endDate: challenge.endDate,
                        }}
                        mode="edit"
                      />
                      <ActionButtonForm
                        action={deleteChallengeAction}
                        fields={{ gatheringId: id, challengeId: challenge.id }}
                        label="챌린지 삭제"
                        pendingLabel="삭제하는 중..."
                        variant="danger"
                      />
                    </div>
                  </Disclosure.Content>
                </Disclosure>
              ) : null}
            </Card.Content>

            <Card.Footer className="flex flex-col items-stretch gap-3">
              <Typography type="h3">인증 {challenge.feeds.length}개</Typography>
              {challenge.feeds.length === 0 ? <p>아직 인증이 없습니다.</p> : (
                <ul className="grid gap-4">
                  {challenge.feeds.map((feed) => (
                    <li className="flex flex-col gap-2" key={feed.id}>
                      <strong>{feed.doneDate} · {feed.authorName}</strong> — {feed.description}
                      {feed.imageId ? (
                        <Image
                          className="h-auto w-full max-w-lg"
                          src={`/api/challenge-feed-images/${feed.imageId}`}
                          alt={`${feed.authorName}님의 챌린지 인증 이미지`}
                          width={640}
                          height={480}
                          unoptimized
                        />
                      ) : null}
                      {!feed.imageId && feed.imageUrl ? (
                        <a className="link" href={feed.imageUrl} target="_blank" rel="noreferrer">
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
