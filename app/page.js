import { Alert, Card, Typography } from '@heroui/react';
import Link from 'next/link';
import { connection } from 'next/server';

import EmptyState from '@/components/EmptyState';
import GatheringCard from '@/components/GatheringCard';
import HeroToast from '@/components/HeroToast';
import { getJoinedGatherings, getPublicGatherings } from '@/lib/gatherings';
import { getOptionalSession } from '@/lib/session';
import { getSingleSearchParam } from '@/lib/utils/validation';

export default async function HomePage({ searchParams }) {
  await connection();
  const query = await searchParams;
  const session = await getOptionalSession();
  const redirectToast = (
    <HeroToast
      error={getSingleSearchParam(query.error)}
      message={getSingleSearchParam(query.message)}
    />
  );

  if (!session) {
    return (
      <>
        {redirectToast}
        <section className="flex flex-col gap-4">
          <Typography color="muted" weight="semibold">
            함께 시작하고, 꾸준히 이어가세요.
          </Typography>
          <Typography type="h1">
            우리의 모임을 한곳에서 관리하는 momo
          </Typography>
          <p>
            관심사가 같은 사람을 만나고 챌린지, 일정, 가계부와 대화를 하나의
            모임 안에서 이어갈 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/signup" className="button button--primary">
              회원가입
            </Link>
            <Link href="/login" className="button button--outline">
              로그인
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <Typography type="h2">모임을 오래 이어가는 데 필요한 것</Typography>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <Card.Header>
                <Card.Title>함께하는 챌린지</Card.Title>
              </Card.Header>
              <Card.Content>
                <p>같은 목표를 정하고 멤버들과 매일의 실천을 기록합니다.</p>
              </Card.Content>
            </Card>
            <Card>
              <Card.Header>
                <Card.Title>놓치지 않는 일정</Card.Title>
              </Card.Header>
              <Card.Content>
                <p>모임 일정을 달력에서 확인하고 공유합니다.</p>
              </Card.Content>
            </Card>
            <Card>
              <Card.Header>
                <Card.Title>투명한 가계부</Card.Title>
              </Card.Header>
              <Card.Content>
                <p>모임의 수입과 지출을 기록하고 합계를 함께 확인합니다.</p>
              </Card.Content>
            </Card>
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
      getPublicGatherings({ limit: 9, excludeUserId: session.user.id }),
    ]);
  } catch {
    databaseError = true;
  }

  return (
    <>
      {redirectToast}
      <section className="flex flex-col gap-2 rounded-[28px] border border-border bg-surface p-6">
        <Typography type="h1">
          {session.user.nickname || session.user.name}님, 반가워요.
        </Typography>
        <p className="text-sm text-foreground/70">
          오늘도 함께할 모임의 소식을 확인해 보세요.
        </p>
      </section>

      {databaseError ? (
        <Alert status="danger" role="alert">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              MongoDB에 연결하지 못했습니다. 환경 변수와 데이터베이스 실행
              상태를 확인해 주세요.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Typography type="h2">내가 참여한 모임</Typography>
          <Link className="link" href="/my-gatherings">
            전체 보기
          </Link>
        </div>
        {joinedGatherings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {joinedGatherings.map((gathering) => (
              <GatheringCard key={gathering.id} gathering={gathering} />
            ))}
          </div>
        ) : (
          <EmptyState>가입한 모임이 없습니다.</EmptyState>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Typography type="h2">추천 모임</Typography>
          <Link className="link" href="/gatherings">
            더보기
          </Link>
        </div>
        {recommendedGatherings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedGatherings.map((gathering) => (
              <GatheringCard key={gathering.id} gathering={gathering} />
            ))}
          </div>
        ) : (
          <EmptyState>추천할 가입 가능한 공개 모임이 없습니다.</EmptyState>
        )}
      </section>
    </>
  );
}
