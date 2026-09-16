import { connection } from "next/server";
import { createGatheringAction } from "@/app/gatherings/actions";
import { CATEGORIES } from "@/lib/constants";
import { requireSession } from "@/lib/session";

export default async function NewGatheringPage() {
  await connection();
  await requireSession();

  return (
    <>
      <h1>새 모임 만들기</h1>
      <form action={createGatheringAction}>
        <label htmlFor="name">모임명</label>
        <input id="name" name="name" required />
        <label htmlFor="region">지역</label>
        <input id="region" name="region" placeholder="온라인 모임은 온라인 입력" required />
        <label htmlFor="description">소개</label>
        <textarea id="description" name="description" required />
        <label htmlFor="maxMemCount">최대 인원</label>
        <input id="maxMemCount" name="maxMemCount" type="number" min="1" max="300" required />
        <label htmlFor="category">카테고리</label>
        <select id="category" name="category" required>
          {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>
        <fieldset>
          <legend>공개 여부와 가입 방식</legend>
          <label><input type="radio" name="isPublic" value="true" defaultChecked /> 공개 모임</label>
          <label><input type="radio" name="isPublic" value="false" /> 비공개 모임</label>
        </fieldset>
        <button type="submit">모임 만들기</button>
      </form>
    </>
  );
}
