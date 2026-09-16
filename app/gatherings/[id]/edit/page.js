import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { updateGatheringAction } from "@/app/gatherings/actions";
import Message from "@/components/Message";
import { getGatheringDetails } from "@/lib/gatherings";
import { requireSession } from "@/lib/session";
import { CATEGORIES, getSingleSearchParam } from "@/lib/utils/validation";

export default async function EditGatheringPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const details = await getGatheringDetails(id, session.user.id);

  if (!details) {
    notFound();
  }
  if (details.membership?.role !== "LEADER") {
    redirect(`/gatherings/${id}?error=${encodeURIComponent("모임장만 수정할 수 있습니다.")}`);
  }

  const { gathering } = details;

  return (
    <section>
      <h1>모임 수정</h1>
      <Message error={getSingleSearchParam(query.error)} />

      <form action={updateGatheringAction}>
        <input type="hidden" name="gatheringId" value={id} />

        <label htmlFor="name">모임명</label>
        <input id="name" name="name" type="text" defaultValue={gathering.name} maxLength="80" required />

        <label htmlFor="region">지역</label>
        <input id="region" name="region" type="text" defaultValue={gathering.region} maxLength="100" required />

        <label htmlFor="description">소개</label>
        <textarea
          id="description"
          name="description"
          rows="6"
          defaultValue={gathering.description}
          maxLength="1000"
          required
        />

        <label htmlFor="maxMemCount">최대 인원</label>
        <input
          id="maxMemCount"
          name="maxMemCount"
          type="number"
          min={Math.max(1, gathering.memberCount)}
          max="300"
          defaultValue={gathering.maxMemCount}
          required
        />

        <label htmlFor="category">카테고리</label>
        <select id="category" name="category" defaultValue={gathering.category} required>
          {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>

        <fieldset>
          <legend>공개 여부</legend>
          <label>
            <input type="radio" name="visibility" value="public" defaultChecked={gathering.isPublic} /> 공개 모임
          </label>
          <label>
            <input type="radio" name="visibility" value="private" defaultChecked={!gathering.isPublic} /> 비공개 모임
          </label>
        </fieldset>

        <button type="submit">수정 내용 저장</button>
      </form>
    </section>
  );
}
