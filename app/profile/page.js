import { Card, Chip, Typography } from '@heroui/react';

import EmptyState from '@/components/EmptyState';
import GatheringCard from '@/components/GatheringCard';
import HeroToast from '@/components/HeroToast';
import PlusIcon from '@/components/PlusIcon';
import UserAvatar from '@/components/UserAvatar';
import { getJoinedGatherings } from '@/lib/gatherings';
import { getRegionName } from '@/lib/regions';
import { requireSession } from '@/lib/session';
import { getUserRegion } from '@/lib/users';
import { getSingleSearchParam } from '@/lib/utils/validation';
import Link from 'next/link';
import { connection } from 'next/server';

export default async function ProfilePage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const gatherings = await getJoinedGatherings(session.user.id);
  const userRegionCode = await getUserRegion(session.user.id);
  const selectedCategories = Array.isArray(session.user.category)
    ? session.user.category
    : [];
  const displayName = session.user.nickname || session.user.name;

  return (
    <>
      <HeroToast
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <header className="flex items-center gap-3">
            <UserAvatar
              image={session.user.image}
              name={displayName}
              size="large"
            />
            <div>
              <Typography type="h1">마이페이지</Typography>
              <p>{displayName}</p>
            </div>
          </header>
          <Link href="/profile/edit" className="button button--primary">
            내 정보 수정
          </Link>
        </div>

        <Card>
          <Card.Header>
            <Card.Title>내 프로필 정보</Card.Title>
          </Card.Header>
          <Card.Content>
            <dl className="grid gap-3 sm:grid-cols-[10rem_1fr]">
              <dt className="font-medium">이름</dt>
              <dd>{session.user.name}</dd>
              <dt className="font-medium">성별</dt>
              <dd>{session.user.gender}</dd>
              <dt className="font-medium">닉네임</dt>
              <dd>{session.user.nickname}</dd>
              <dt className="font-medium">이메일</dt>
              <dd>{session.user.email}</dd>
              <dt className="font-medium">관심 카테고리</dt>
              <dd className="flex flex-wrap gap-2">
                {selectedCategories.length > 0
                  ? selectedCategories.map((category) => (
                      <Chip key={category}>{category}</Chip>
                    ))
                  : '없음'}
              </dd>
              <dt className="font-medium">지역</dt>
              <dd>{getRegionName(userRegionCode)}</dd>
              <dt className="font-medium">새 일정·챌린지 알림</dt>
              <dd>
                {session.user.notificationEnabled !== false
                  ? '받음'
                  : '받지 않음'}
              </dd>
            </dl>
          </Card.Content>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Typography type="h2">내 모임</Typography>
          <Link href="/gatherings/new" className="button button--primary">
            <PlusIcon />새 모임 만들기
          </Link>
        </div>

        {gatherings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
