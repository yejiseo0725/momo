import { connection } from "next/server";
import Image from "next/image";

import {
  deleteChallengeAction,
} from "@/app/gatherings/[id]/challenges/actions";
import ChallengeFeedForm from "@/app/gatherings/[id]/challenges/ChallengeFeedForm";
import ChallengeForm from "@/app/gatherings/[id]/challenges/ChallengeForm";
import ActionButtonForm from "@/components/ActionButtonForm";
import EmptyState from "@/components/EmptyState";
import { getChallenges } from "@/lib/challenges";
import { requireSession } from "@/lib/session";
import { getTodayDateOnly } from "@/lib/utils/documents";

function getLatestDoneDate(challengeEndDate, today) {
  return challengeEndDate < today ? challengeEndDate : today;
}

export default async function ChallengesPage({ params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const challenges = await getChallenges(id, session.user.id);
  const today = getTodayDateOnly();

  return (
    <>
      <section>
        <h1>챌린지</h1>
        <p>모임 멤버와 함께할 목표를 만들고 실천을 인증하세요.</p>
        <details>
          <summary>새 챌린지 만들기</summary>
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
        </details>
      </section>

      <section className="stack">
        {challenges.length === 0 ? <EmptyState>등록된 챌린지가 없습니다.</EmptyState> : null}
        {challenges.map((challenge) => (
          <article key={challenge.id}>
            <header>
              <p><small>{challenge.startDate} – {challenge.endDate}</small></p>
              <h2>{challenge.title}</h2>
              <p>작성자 {challenge.authorName} · 이미지 {challenge.useImage ? "필수" : "선택"}</p>
            </header>
            <p>{challenge.description}</p>

            <details>
              <summary>실천 인증하기</summary>
              <ChallengeFeedForm
                challengeId={challenge.id}
                defaultDate={getLatestDoneDate(challenge.endDate, today)}
                gatheringId={id}
                imageRequired={challenge.useImage}
                maximumDate={getLatestDoneDate(challenge.endDate, today)}
                minimumDate={challenge.startDate}
              />
            </details>

            {challenge.userId === session.user.id ? (
              <details>
                <summary>챌린지 수정</summary>
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
                />
              </details>
            ) : null}

            <footer>
              <h3>인증 {challenge.feeds.length}개</h3>
              {challenge.feeds.length === 0 ? <p>아직 인증이 없습니다.</p> : (
                <ul>
                  {challenge.feeds.map((feed) => (
                    <li key={feed.id}>
                      <strong>{feed.doneDate} · {feed.authorName}</strong> — {feed.description}
                      {feed.imageId ? (
                        <Image
                          className="challenge-feed-image"
                          src={`/api/challenge-feed-images/${feed.imageId}`}
                          alt={`${feed.authorName}님의 챌린지 인증 이미지`}
                          width={640}
                          height={480}
                          unoptimized
                        />
                      ) : null}
                      {!feed.imageId && feed.imageUrl ? (
                        <> · <a href={feed.imageUrl} target="_blank" rel="noreferrer">기존 이미지 링크</a></>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </footer>
          </article>
        ))}
      </section>
    </>
  );
}
