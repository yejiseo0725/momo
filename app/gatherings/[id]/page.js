import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  joinGatheringAction,
  leaveGatheringAction,
  updateGatheringAction,
} from "@/app/gatherings/actions";
import { CATEGORIES } from "@/lib/constants";
import { toObjectId, userIdCandidates } from "@/lib/database-helpers";
import { getGatheringMembership } from "@/lib/gathering-access";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export default async function GatheringHomePage({ params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) notFound();

  const [gathering, membership, memberCount, members] = await Promise.all([
    db.collection("gatherings").findOne({ _id: objectId }),
    getGatheringMembership(id, session.user.id),
    db.collection("gatheringMembers").countDocuments({ gatheringId: id }),
    db.collection("gatheringMembers").find({ gatheringId: id }).sort({ joinDate: 1 }).toArray(),
  ]);
  if (!gathering) notFound();

  const userKeys = members.flatMap((member) => userIdCandidates(member.userId));
  const users = await db.collection("users").find({ _id: { $in: userKeys } }).toArray();
  const userById = new Map(users.map((user) => [user._id.toString(), user]));
  const isFull = memberCount >= gathering.maxMemCount;

  return (
    <>
      <h1>{gathering.name}</h1>
      <p>{gathering.description}</p>
      <dl>
        <dt>카테고리</dt><dd>{gathering.category}</dd>
        <dt>지역</dt><dd>{gathering.region}</dd>
        <dt>인원</dt><dd>{memberCount}/{gathering.maxMemCount}명</dd>
        <dt>공개 여부</dt><dd>{gathering.isPublic ? "공개" : "비공개"}</dd>
      </dl>

      {!membership ? (
        <form action={joinGatheringAction}>
          <input type="hidden" name="gatheringId" value={id} />
          <button type="submit" disabled={isFull}>{isFull ? "가입 마감" : "가입하기"}</button>
        </form>
      ) : membership.role === "MEMBER" ? (
        <form action={leaveGatheringAction}>
          <input type="hidden" name="gatheringId" value={id} />
          <button type="submit">모임 탈퇴</button>
        </form>
      ) : null}

      {membership?.role === "LEADER" ? (
        <>
          {!gathering.isPublic ? <p>초대 주소: <a href={`/invite/${id}`}>/invite/{id}</a></p> : null}
          <details>
            <summary>모임 정보 수정</summary>
            <form action={updateGatheringAction}>
            <input type="hidden" name="gatheringId" value={id} />
            <label htmlFor="edit-name">모임명</label>
            <input id="edit-name" name="name" defaultValue={gathering.name} required />
            <label htmlFor="edit-region">지역</label>
            <input id="edit-region" name="region" defaultValue={gathering.region} required />
            <label htmlFor="edit-description">소개</label>
            <textarea id="edit-description" name="description" defaultValue={gathering.description} required />
            <label htmlFor="edit-max">최대 인원</label>
            <input id="edit-max" name="maxMemCount" type="number" min={memberCount} max="300" defaultValue={gathering.maxMemCount} required />
            <label htmlFor="edit-category">카테고리</label>
            <select id="edit-category" name="category" defaultValue={gathering.category}>
              {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
            <fieldset>
              <legend>공개 여부</legend>
              <label><input type="radio" name="isPublic" value="true" defaultChecked={gathering.isPublic} /> 공개</label>
              <label><input type="radio" name="isPublic" value="false" defaultChecked={!gathering.isPublic} /> 비공개</label>
            </fieldset>
            <button type="submit">수정하기</button>
            </form>
          </details>
        </>
      ) : null}

      <section>
        <h2>멤버</h2>
        <ul>
          {members.map((member) => {
            const user = userById.get(member.userId);
            return <li key={member._id.toString()}>{user?.nickname || user?.name || "멤버"}{member.role === "LEADER" ? " (모임장)" : ""}</li>;
          })}
        </ul>
      </section>
    </>
  );
}
