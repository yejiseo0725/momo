import { connection } from "next/server";
import {
  createChallengeFeedAction,
  deleteChallengeAction,
  saveChallengeAction,
} from "@/app/gatherings/actions";
import { requireGatheringMember } from "@/lib/gathering-access";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export default async function ChallengesPage({ params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  await requireGatheringMember(id, session.user.id);
  const challenges = await db.collection("challenges").find({ gatheringId: id }).sort({ createdAt: -1 }).toArray();
  const challengeIds = challenges.map((challenge) => challenge._id.toString());
  const feeds = await db.collection("challengeFeeds").find({ challengeId: { $in: challengeIds } }).sort({ doneDate: -1 }).toArray();

  return (
    <>
      <h1>챌린지</h1>
      <details>
        <summary>새 챌린지 만들기</summary>
        <ChallengeForm gatheringId={id} />
      </details>
      {challenges.length === 0 ? <p>등록된 챌린지가 없습니다.</p> : challenges.map((challenge) => {
        const challengeId = challenge._id.toString();
        const challengeFeeds = feeds.filter((feed) => feed.challengeId === challengeId);
        return (
          <article key={challengeId}>
            <h2>{challenge.title}</h2>
            <p>{challenge.description}</p>
            <p><small>{challenge.startDate}부터 {challenge.endDate}까지 · {challenge.useImage ? "이미지 인증" : "텍스트 인증"}</small></p>
            {challenge.userId === session.user.id ? (
              <details>
                <summary>수정 또는 삭제</summary>
                <ChallengeForm gatheringId={id} challenge={challenge} />
                <form action={deleteChallengeAction}>
                  <input type="hidden" name="gatheringId" value={id} />
                  <input type="hidden" name="challengeId" value={challengeId} />
                  <button type="submit">삭제</button>
                </form>
              </details>
            ) : null}
            <details>
              <summary>오늘 인증하기</summary>
              <form action={createChallengeFeedAction}>
                <input type="hidden" name="gatheringId" value={id} />
                <input type="hidden" name="challengeId" value={challengeId} />
                <label htmlFor={`done-${challengeId}`}>인증일</label>
                <input id={`done-${challengeId}`} name="doneDate" type="date" required />
                {challenge.useImage ? (
                  <><label htmlFor={`image-${challengeId}`}>이미지 주소</label><input id={`image-${challengeId}`} name="imageUrl" type="url" required /></>
                ) : null}
                <label htmlFor={`feed-${challengeId}`}>인증 내용</label>
                <textarea id={`feed-${challengeId}`} name="description" required />
                <button type="submit">인증 남기기</button>
              </form>
            </details>
            <h3>인증 목록</h3>
            {challengeFeeds.length === 0 ? <p>아직 인증이 없습니다.</p> : (
              <ul>{challengeFeeds.map((feed) => <li key={feed._id.toString()}>{feed.doneDate} · {feed.description}{feed.imageUrl ? <> · <a href={feed.imageUrl}>이미지 보기</a></> : null}</li>)}</ul>
            )}
          </article>
        );
      })}
    </>
  );
}

function ChallengeForm({ gatheringId, challenge }) {
  return (
    <form action={saveChallengeAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {challenge ? <input type="hidden" name="challengeId" value={challenge._id.toString()} /> : null}
      <label htmlFor={`challenge-title-${challenge?._id || "new"}`}>제목</label>
      <input id={`challenge-title-${challenge?._id || "new"}`} name="title" defaultValue={challenge?.title} required />
      <label htmlFor={`challenge-description-${challenge?._id || "new"}`}>설명</label>
      <textarea id={`challenge-description-${challenge?._id || "new"}`} name="description" defaultValue={challenge?.description} required />
      <label><input type="checkbox" name="useImage" defaultChecked={challenge?.useImage} /> 인증 이미지 필수</label>
      <label>시작일 <input name="startDate" type="date" defaultValue={challenge?.startDate} required /></label>
      <label>종료일 <input name="endDate" type="date" defaultValue={challenge?.endDate} required /></label>
      <button type="submit">{challenge ? "수정" : "생성"}</button>
    </form>
  );
}
