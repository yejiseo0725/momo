import Link from "next/link";
import { connection } from "next/server";

import EmptyState from "@/components/EmptyState";
import GatheringCard from "@/components/GatheringCard";
import { getPublicGatherings } from "@/lib/gatherings";
import { requireSession } from "@/lib/session";
import { CATEGORIES, getSingleSearchParam } from "@/lib/utils/validation";

export default async function GatheringsPage({ searchParams }) {
  await connection();
  await requireSession();
  const query = await searchParams;
  const keyword = getSingleSearchParam(query.keyword).trim();
  const category = getSingleSearchParam(query.category);
  const selectedCategory = CATEGORIES.includes(category) ? category : "";
  const gatherings = await getPublicGatherings({
    keyword,
    category: selectedCategory,
  });

  return (
    <>
      <section>
        <div className="section-heading">
          <div>
            <h1>모임 찾기</h1>
            <p>공개된 모임을 최신순으로 둘러보세요.</p>
          </div>
          <Link href="/gatherings/new" className="button">새 모임 만들기</Link>
        </div>

        <form method="get" className="compact-form">
          <label htmlFor="keyword">키워드</label>
          <input
            id="keyword"
            name="keyword"
            type="search"
            defaultValue={keyword}
            placeholder="모임명, 소개, 지역"
            maxLength="100"
          />

          <label htmlFor="category">카테고리</label>
          <select id="category" name="category" defaultValue={selectedCategory}>
            <option value="">전체</option>
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <button type="submit">검색</button>
        </form>
      </section>

      <section>
        <h2>모임 {gatherings.length}개</h2>
        {gatherings.length > 0 ? (
          <div className="card-grid">
            {gatherings.map((gathering) => (
              <GatheringCard key={gathering.id} gathering={gathering} />
            ))}
          </div>
        ) : (
          <EmptyState>조건에 맞는 공개 모임이 없습니다.</EmptyState>
        )}
      </section>
    </>
  );
}
