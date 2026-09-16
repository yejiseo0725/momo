import { ObjectId } from "mongodb";
import { connection } from "next/server";
import { updateProfileAction } from "@/app/mypage/actions";
import GatheringCard from "@/components/gathering-card";
import { CATEGORIES, GENDERS } from "@/lib/constants";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export default async function MyPage() {
  await connection();
  const session = await requireSession();
  const memberships = await db.collection("gatheringMembers").find({ userId: session.user.id }).sort({ joinDate: -1 }).toArray();
  const gatheringIds = memberships.filter((item) => ObjectId.isValid(item.gatheringId)).map((item) => new ObjectId(item.gatheringId));
  const gatherings = await db.collection("gatherings").find({ _id: { $in: gatheringIds } }).toArray();

  return (
    <>
      <h1>마이페이지</h1>
      <section>
        <h2>프로필</h2>
        <p>이메일: {session.user.email}</p>
        <form action={updateProfileAction}>
          <label>이름 <input name="name" defaultValue={session.user.name} required /></label>
          <fieldset><legend>성별</legend>{GENDERS.map((gender) => <label key={gender}><input type="radio" name="gender" value={gender} defaultChecked={session.user.gender === gender} /> {gender}</label>)}</fieldset>
          <label>닉네임 <input name="nickname" defaultValue={session.user.nickname} required /></label>
          <fieldset><legend>관심 카테고리</legend>{CATEGORIES.map((category) => <label key={category}><input type="checkbox" name="category" value={category} defaultChecked={session.user.category?.includes(category)} /> {category}</label>)}</fieldset>
          <label>지역 <input name="region" defaultValue={session.user.region} required /></label>
          <button type="submit">프로필 수정</button>
        </form>
      </section>
      <section>
        <h2>내 모임</h2>
        {gatherings.length === 0 ? <p>가입한 모임이 없습니다.</p> : gatherings.map((gathering) => {
          const membership = memberships.find((item) => item.gatheringId === gathering._id.toString());
          return <GatheringCard key={gathering._id.toString()} gathering={gathering} leader={membership?.role === "LEADER"} />;
        })}
      </section>
    </>
  );
}
