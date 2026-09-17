import Link from "next/link";
import { connection } from "next/server";

import ProfileForm from "@/app/profile/ProfileForm";
import ToastMessage from "@/components/ToastMessage";
import UserAvatar from "@/components/UserAvatar";
import { getRegionName } from "@/lib/regions";
import { requireSession } from "@/lib/session";
import { CATEGORIES, GENDERS, getSingleSearchParam } from "@/lib/utils/validation";

export default async function EditProfilePage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const selectedCategories = Array.isArray(session.user.category) ? session.user.category : [];
  const displayName = session.user.nickname || session.user.name;

  return (
    <section>
      <ToastMessage
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <div className="section-heading">
        <header className="profile-heading">
          <UserAvatar image={session.user.image} name={displayName} size="large" />
          <div>
            <h1>내 정보 수정</h1>
          </div>
        </header>
        <Link href="/profile">마이페이지로 돌아가기</Link>
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
          region: session.user.region,
          regionName: getRegionName(session.user.region),
          notificationEnabled: session.user.notificationEnabled !== false,
        }}
      />
    </section>
  );
}
