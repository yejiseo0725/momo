import { connection } from "next/server";

import {
  createChallengeFeedAction,
  deleteChallengeAction,
  updateChallengeAction,
} from "@/app/gatherings/[id]/challenges/actions";
import CreateChallengeForm from "@/app/gatherings/[id]/challenges/CreateChallengeForm";
import EmptyState from "@/components/EmptyState";
import Message from "@/components/Message";
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
      <section>
        <h1>챌린지</h1>
        <p>모임 멤버와 함께할 목표를 만들고 실천을 인증하세요.</p>
        <Message
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        <details>
          <summary>새 챌린지 만들기</summary>
          <CreateChallengeForm gatheringId={id} />
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
              <form action={createChallengeFeedAction}>
                <input type="hidden" name="gatheringId" value={id} />
                <input type="hidden" name="challengeId" value={challenge.id} />
                <label htmlFor={`done-${challenge.id}`}>인증일</label>
                <input
                  id={`done-${challenge.id}`}
                  name="doneDate"
                  type="date"
                  min={challenge.startDate}
                  max={getLatestDoneDate(challenge.endDate, today)}
                  defaultValue={getLatestDoneDate(challenge.endDate, today)}
                  required
                />
                <label htmlFor={`feed-${challenge.id}`}>인증 내용</label>
                <textarea id={`feed-${challenge.id}`} name="description" maxLength="500" required />
                <label htmlFor={`image-${challenge.id}`}>이미지 링크 {challenge.useImage ? "(필수)" : "(선택)"}</label>
                <input
                  id={`image-${challenge.id}`}
                  name="imageUrl"
                  type="url"
                  required={challenge.useImage}
                />
                <button type="submit">인증 남기기</button>
              </form>
            </details>

            {challenge.userId === session.user.id ? (
              <details>
                <summary>챌린지 수정</summary>
                <form action={updateChallengeAction}>
                  <input type="hidden" name="gatheringId" value={id} />
                  <input type="hidden" name="challengeId" value={challenge.id} />
                  <label>제목<input name="title" defaultValue={challenge.title} maxLength="100" required /></label>
                  <label>설명<textarea name="description" defaultValue={challenge.description} maxLength="1000" required /></label>
                  <label>
                    <input type="checkbox" name="useImage" defaultChecked={challenge.useImage} /> 이미지 링크 필수
                  </label>
                  <label>시작일<input name="startDate" type="date" defaultValue={challenge.startDate} required /></label>
                  <label>종료일<input name="endDate" type="date" defaultValue={challenge.endDate} required /></label>
                  <button type="submit">수정 저장</button>
                </form>
                <form action={deleteChallengeAction}>
                  <input type="hidden" name="gatheringId" value={id} />
                  <input type="hidden" name="challengeId" value={challenge.id} />
                  <button type="submit">챌린지 삭제</button>
                </form>
              </details>
            ) : null}

            <footer>
              <h3>인증 {challenge.feeds.length}개</h3>
              {challenge.feeds.length === 0 ? <p>아직 인증이 없습니다.</p> : (
                <ul>
                  {challenge.feeds.map((feed) => (
                    <li key={feed.id}>
                      <strong>{feed.doneDate} · {feed.authorName}</strong> — {feed.description}
                      {feed.imageUrl ? <> · <a href={feed.imageUrl} target="_blank" rel="noreferrer">이미지 링크</a></> : null}
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
