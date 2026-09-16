import { connection } from "next/server";

import { createGatheringAction } from "@/app/gatherings/actions";
import Message from "@/components/Message";
import { requireSession } from "@/lib/session";
import { CATEGORIES, getSingleSearchParam } from "@/lib/utils/validation";

export default async function NewGatheringPage({ searchParams }) {
  await connection();
  await requireSession();
  const query = await searchParams;

  return (
    <section>
      <h1>새 모임 만들기</h1>
      <p>모임을 만들면 모임장으로 자동 참여합니다.</p>
      <Message error={getSingleSearchParam(query.error)} />

      <form action={createGatheringAction}>
        <label htmlFor="name">모임명</label>
        <input id="name" name="name" type="text" maxLength="80" required />

        <label htmlFor="region">지역</label>
        <input id="region" name="region" type="text" maxLength="100" required />
        <small>온라인 모임은 “온라인”으로 입력해 주세요.</small>

        <label htmlFor="description">소개</label>
        <textarea id="description" name="description" rows="6" maxLength="1000" required />

        <label htmlFor="maxMemCount">최대 인원</label>
        <input id="maxMemCount" name="maxMemCount" type="number" min="1" max="300" required />

        <label htmlFor="category">카테고리</label>
        <select id="category" name="category" required defaultValue="">
          <option value="" disabled>선택해 주세요</option>
          {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>

        <fieldset>
          <legend>공개 여부</legend>
          <label><input type="radio" name="visibility" value="public" defaultChecked /> 공개 모임</label>
          <label><input type="radio" name="visibility" value="private" /> 비공개 모임</label>
        </fieldset>

        <button type="submit">모임 만들기</button>
      </form>
    </section>
  );
}
