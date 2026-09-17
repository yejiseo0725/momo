import Link from "next/link";
import { connection } from "next/server";

import EmptyState from "@/components/EmptyState";
import GatheringCard from "@/components/GatheringCard";
import ToastMessage from "@/components/ToastMessage";
import UserAvatar from "@/components/UserAvatar";
import { getJoinedGatherings } from "@/lib/gatherings";
import { getRegionName } from "@/lib/regions";
import { requireSession } from "@/lib/session";
import { getUserRegion } from "@/lib/users";
import { getSingleSearchParam } from "@/lib/utils/validation";

export default async function ProfilePage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const gatherings = await getJoinedGatherings(session.user.id);
  const userRegionCode = await getUserRegion(session.user.id);
  const selectedCategories = Array.isArray(session.user.category) ? session.user.category : [];
  const displayName = session.user.nickname || session.user.name;

  return (
    <>
      <ToastMessage
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />

      <section>
        <div className="section-heading">
          <header className="profile-heading">
            <UserAvatar image={session.user.image} name={displayName} size="large" />
            <div>
              <h1>마이페이지</h1>
              <p>{displayName}</p>
            </div>
          </header>
          <Link href="/profile/edit" className="button">
            내 정보 수정
          </Link>
        </div>

        <h2>내 프로필 정보</h2>
        <dl>
          <dt>이름</dt>
          <dd>{session.user.name}</dd>
          <dt>성별</dt>
          <dd>{session.user.gender}</dd>
          <dt>닉네임</dt>
          <dd>{session.user.nickname}</dd>
          <dt>이메일</dt>
          <dd>{session.user.email}</dd>
          <dt>관심 카테고리</dt>
          <dd>{selectedCategories.length > 0 ? selectedCategories.join(", ") : "없음"}</dd>
          <dt>지역</dt>
          <dd>{getRegionName(userRegionCode)}</dd>
          <dt>새 일정·챌린지 알림</dt>
          <dd>{session.user.notificationEnabled !== false ? "받음" : "받지 않음"}</dd>
        </dl>
      </section>

      <section>
        <div className="section-heading">
          <h2>내 모임</h2>
          <Link href="/gatherings/new" className="button">
            새 모임 만들기
          </Link>
        </div>

        {gatherings.length > 0 ? (
          <div className="card-grid">
            {gatherings.map((gathering) => (
              <GatheringCard key={gathering.id} gathering={gathering} />
            ))}
          </div>
        ) : (
          <EmptyState>가입한 모임이 없습니다.</EmptyState>
        )}
      </section>
    </>
  );
}
