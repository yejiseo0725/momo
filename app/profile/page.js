import { connection } from "next/server";

import ProfileForm from "@/app/profile/ProfileForm";
import UserAvatar from "@/components/UserAvatar";
import { requireSession } from "@/lib/session";
import { CATEGORIES, GENDERS } from "@/lib/utils/validation";

export default async function ProfilePage() {
  await connection();
  const session = await requireSession();
  const selectedCategories = Array.isArray(session.user.category) ? session.user.category : [];
  const displayName = session.user.nickname || session.user.name;

  return (
    <section>
      <header className="profile-heading">
        <UserAvatar image={session.user.image} name={displayName} size="large" />
        <div>
          <h1>프로필</h1>
        </div>
      </header>
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
          notificationEnabled: session.user.notificationEnabled !== false,
        }}
      />
    </section>
  );
}
