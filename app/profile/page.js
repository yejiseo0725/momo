import { connection } from "next/server";

import { updateProfileAction } from "@/app/auth-actions";
import Message from "@/components/Message";
import UserAvatar from "@/components/UserAvatar";
import { requireSession } from "@/lib/session";
import { CATEGORIES, GENDERS, getSingleSearchParam } from "@/lib/utils/validation";

export default async function ProfilePage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const selectedCategories = Array.isArray(session.user.category) ? session.user.category : [];
  const displayName = session.user.nickname || session.user.name;

  return (
    <section>
      <header className="profile-heading">
        <UserAvatar image={session.user.image} name={displayName} size="large" />
        <div>
          <h1>프로필</h1>
          <p>이메일과 비밀번호를 제외한 기본 정보를 수정할 수 있습니다.</p>
        </div>
      </header>
      <Message
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />

      <form action={updateProfileAction}>
        <label htmlFor="email">이메일</label>
        <input id="email" type="email" value={session.user.email} disabled />

        <label htmlFor="name">이름</label>
        <input id="name" name="name" type="text" defaultValue={session.user.name} maxLength="50" required />

        <fieldset>
          <legend>성별</legend>
          {GENDERS.map((gender) => (
            <label key={gender}>
              <input
                type="radio"
                name="gender"
                value={gender}
                defaultChecked={session.user.gender === gender}
                required
              /> {gender}
            </label>
          ))}
        </fieldset>

        <label htmlFor="nickname">닉네임</label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          defaultValue={session.user.nickname}
          maxLength="30"
          required
        />

        <fieldset>
          <legend>관심 카테고리</legend>
          {CATEGORIES.map((category) => (
            <label key={category}>
              <input
                type="checkbox"
                name="category"
                value={category}
                defaultChecked={selectedCategories.includes(category)}
              /> {category}
            </label>
          ))}
        </fieldset>

        <label htmlFor="region">지역</label>
        <input
          id="region"
          name="region"
          type="text"
          defaultValue={session.user.region}
          maxLength="100"
          required
        />

        <button type="submit">프로필 저장</button>
      </form>
    </section>
  );
}
