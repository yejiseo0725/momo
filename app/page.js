import Link from "next/link";
import { connection } from "next/server";

import EmptyState from "@/components/EmptyState";
import GatheringCard from "@/components/GatheringCard";
import { getJoinedGatherings, getPublicGatherings } from "@/lib/gatherings";
import { getOptionalSession } from "@/lib/session";

export default async function HomePage() {
  await connection();
  const session = await getOptionalSession();

  if (!session) {
    return (
      <>
        <section>
          <p><strong>함께 시작하고, 꾸준히 이어가세요.</strong></p>
          <h1>우리의 모임을 한곳에서 관리하는 momo</h1>
          <p>
            관심사가 같은 사람을 만나고 챌린지, 일정, 가계부와 대화를
            하나의 모임 안에서 이어갈 수 있습니다.
          </p>
          <p className="actions">
            <Link href="/signup" className="button">회원가입</Link>
            <Link href="/login" className="button">로그인</Link>
          </p>
        </section>

        <section>
          <h2>모임을 오래 이어가는 데 필요한 것</h2>
          <div className="card-grid">
            <article>
              <h3>함께하는 챌린지</h3>
              <p>같은 목표를 정하고 멤버들과 매일의 실천을 기록합니다.</p>
            </article>
            <article>
              <h3>놓치지 않는 일정</h3>
              <p>모임 일정을 달력에서 확인하고 참여 여부를 남깁니다.</p>
            </article>
            <article>
              <h3>투명한 가계부</h3>
              <p>모임의 수입과 지출을 기록하고 합계를 함께 확인합니다.</p>
            </article>
          </div>
        </section>
      </>
    );
  }

  let joinedGatherings = [];
  let recommendedGatherings = [];
  let databaseError = false;

  try {
    [joinedGatherings, recommendedGatherings] = await Promise.all([
      getJoinedGatherings(session.user.id, 9),
      getPublicGatherings({ limit: 9 }),
    ]);
  } catch {
    databaseError = true;
  }

  return (
    <>
      <section>
        <h1>{session.user.nickname || session.user.name}님, 반가워요.</h1>
        <p>오늘도 함께할 모임의 소식을 확인해 보세요.</p>
      </section>

      {databaseError ? (
        <p className="notice error-notice" role="alert">
          MongoDB에 연결하지 못했습니다. 환경 변수와 데이터베이스 실행 상태를 확인해 주세요.
        </p>
      ) : null}

      <section>
        <div className="section-heading">
          <h2>내가 참여한 모임</h2>
          <Link href="/my-gatherings">전체 보기</Link>
        </div>
        {joinedGatherings.length > 0 ? (
          <div className="card-grid">
            {joinedGatherings.map((gathering) => (
              <GatheringCard key={gathering.id} gathering={gathering} />
            ))}
          </div>
        ) : (
          <EmptyState>가입한 모임이 없습니다.</EmptyState>
        )}
      </section>

      <section>
        <div className="section-heading">
          <h2>추천 모임</h2>
          <Link href="/gatherings">더보기</Link>
        </div>
        {recommendedGatherings.length > 0 ? (
          <div className="card-grid">
            {recommendedGatherings.map((gathering) => (
              <GatheringCard key={gathering.id} gathering={gathering} />
            ))}
          </div>
        ) : (
          <EmptyState>아직 공개된 모임이 없습니다.</EmptyState>
        )}
      </section>
    </>
  );
}
