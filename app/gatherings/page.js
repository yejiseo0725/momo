import Link from "next/link";
import Form from "next/form";
import { connection } from "next/server";

import EmptyState from "@/components/EmptyState";
import GatheringCard from "@/components/GatheringCard";
import ToastMessage from "@/components/ToastMessage";
import { getPublicGatherings } from "@/lib/gatherings";
import { requireSession } from "@/lib/session";
import { CATEGORIES, getSingleSearchParam } from "@/lib/utils/validation";

export default async function GatheringsPage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const keyword = getSingleSearchParam(query.keyword).trim();
  const category = getSingleSearchParam(query.category);
  const selectedCategory = CATEGORIES.includes(category) ? category : "";
  const nearbyOnly = getSingleSearchParam(query.nearby) === "true";
  const gatherings = await getPublicGatherings({
    keyword,
    category: selectedCategory,
    excludeUserId: session.user.id,
    nearbyRegionCode: nearbyOnly ? session.user.region : "",
  });

  return (
    <>
      <ToastMessage
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <section>
        <div className="section-heading">
          <div>
            <h1>모임 찾기</h1>
            <p>공개된 모임을 최신순으로 둘러보세요.</p>
          </div>
          <Link href="/gatherings/new" className="button">새 모임 만들기</Link>
        </div>

        <Form action="/gatherings" className="compact-form">
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

          <label>
            <input
              name="nearby"
              type="checkbox"
              value="true"
              defaultChecked={nearbyOnly}
            /> 내 주변 모임
          </label>
          <small>내 지역과 같은 시군구의 모임과 온라인 모임을 함께 찾습니다.</small>

          <button type="submit">검색</button>
        </Form>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <h2>모임 {gatherings.length}개</h2>
            <p>이미 가입했거나 직접 만든 모임은 내 모임에서 확인할 수 있습니다.</p>
          </div>
          <Link href="/my-gatherings">내 모임 보기</Link>
        </div>
        {gatherings.length > 0 ? (
          <div className="card-grid">
            {gatherings.map((gathering) => (
              <GatheringCard key={gathering.id} gathering={gathering} />
            ))}
          </div>
        ) : (
          <EmptyState>조건에 맞는 가입 가능한 공개 모임이 없습니다.</EmptyState>
        )}
      </section>
    </>
  );
}
