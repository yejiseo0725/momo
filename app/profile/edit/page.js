import { Typography } from "@heroui/react";
import Link from "next/link";
import { connection } from "next/server";

import ProfileForm from "@/app/profile/ProfileForm";
import ToastMessage from "@/components/ToastMessage";
import UserAvatar from "@/components/UserAvatar";
import { getRegionName } from "@/lib/regions";
import { requireSession } from "@/lib/session";
import { getUserRegion } from "@/lib/users";
import { CATEGORIES, GENDERS, getSingleSearchParam } from "@/lib/utils/validation";

export default async function EditProfilePage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const userRegionCode = await getUserRegion(session.user.id);
  const selectedCategories = Array.isArray(session.user.category) ? session.user.category : [];
  const displayName = session.user.nickname || session.user.name;

  return (
    <section className="flex flex-col gap-4">
      <ToastMessage
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <header className="flex items-center gap-3">
          <UserAvatar image={session.user.image} name={displayName} size="large" />
          <div>
            <Typography type="h1">내 정보 수정</Typography>
          </div>
        </header>
        <Link className="link" href="/profile">마이페이지로 돌아가기</Link>
      </div>
      <ProfileForm
        categories={CATEGORIES}
        email={session.user.email}
        genders={GENDERS}
        initialValues={{
          name: session.user.name,
          gender: session.user.gender,
          nickname: session.user.nickname,
          categories: selectedCategories,
          region: userRegionCode,
          regionName: userRegionCode ? getRegionName(userRegionCode) : "",
          notificationEnabled: session.user.notificationEnabled !== false,
        }}
      />
    </section>
  );
}
