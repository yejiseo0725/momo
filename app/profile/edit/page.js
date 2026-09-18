import { Typography } from '@heroui/react';
import Link from 'next/link';
import { connection } from 'next/server';

import ProfileForm from '@/app/profile/ProfileForm';
import HeroToast from '@/components/HeroToast';
import UserInfo from '@/components/UserInfo';
import { getRegionName } from '@/lib/regions';
import { requireSession } from '@/lib/session';
import { getUserRegion } from '@/lib/users';
import {
  CATEGORIES,
  GENDERS,
  getSingleSearchParam,
} from '@/lib/utils/validation';

export default async function EditProfilePage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const userRegionCode = await getUserRegion(session.user.id);
  const selectedCategories = Array.isArray(session.user.category)
    ? session.user.category
    : [];
  const displayName = session.user.nickname || session.user.name;

  return (
    <section className="flex flex-col gap-4">
      <HeroToast
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <header className="flex flex-col gap-1">
          <Typography type="h1">내 정보 수정</Typography>
          <UserInfo
            image={session.user.image}
            name={displayName}
            size="lg"
          />
        </header>
        <Link className="link" href="/profile">
          마이페이지로 돌아가기
        </Link>
      </div>
      <ProfileForm
        categories={CATEGORIES}
        email={session.user.email}
        genders={GENDERS}
        initialValues={{
          image: session.user.image,
          name: session.user.name,
          gender: session.user.gender,
          nickname: session.user.nickname,
          categories: selectedCategories,
          region: userRegionCode,
          regionName: userRegionCode ? getRegionName(userRegionCode) : '',
          notificationEnabled: session.user.notificationEnabled !== false,
        }}
      />
    </section>
  );
}
