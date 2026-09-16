import Link from "next/link";
import { connection } from "next/server";
import GatheringCard from "@/components/gathering-card";
import { CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { escapeRegularExpression } from "@/lib/utils/search";

export default async function GatheringsPage({ searchParams }) {
  await connection();
  await requireSession();
  const { keyword = "", category = "" } = await searchParams;
  const safeKeyword = typeof keyword === "string" ? keyword.trim() : "";
  const safeCategory = typeof category === "string" ? category : "";
  const filter = { isPublic: true };

  if (safeKeyword) {
    const searchPattern = new RegExp(escapeRegularExpression(safeKeyword), "i");
    filter.$or = [
      { name: searchPattern },
      { description: searchPattern },
      { region: searchPattern },
    ];
  }
  if (CATEGORIES.includes(safeCategory)) {
    filter.category = safeCategory;
  }

  const gatherings = await db
    .collection("gatherings")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <>
      <h1>모임 찾기</h1>
      <p><Link href="/gatherings/new">새 모임 만들기</Link></p>
      <form action="/gatherings" method="get">
        <label htmlFor="keyword">검색어</label>
        <input id="keyword" name="keyword" defaultValue={safeKeyword} placeholder="모임명, 소개, 지역" />
        <label htmlFor="category">카테고리</label>
        <select id="category" name="category" defaultValue={safeCategory}>
          <option value="">전체</option>
          {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
        </select>
        <button type="submit">검색</button>
      </form>
      {gatherings.length === 0 ? <p>조건에 맞는 모임이 없습니다.</p> : gatherings.map((gathering) => (
        <GatheringCard key={gathering._id.toString()} gathering={gathering} />
      ))}
    </>
  );
}
