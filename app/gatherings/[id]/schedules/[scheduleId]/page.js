import { notFound } from "next/navigation";
import { connection } from "next/server";
import { toggleScheduleAttendanceAction } from "@/app/gatherings/actions";
import { toObjectId, userIdCandidates } from "@/lib/database-helpers";
import { requireGatheringMember } from "@/lib/gathering-access";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export default async function ScheduleDetailPage({ params }) {
  await connection();
  const session = await requireSession();
  const { id, scheduleId } = await params;
  await requireGatheringMember(id, session.user.id);
  const schedule = await db.collection("schedules").findOne({ _id: toObjectId(scheduleId), gatheringId: id });
  if (!schedule) notFound();
  const attendees = await db.collection("scheduleMembers").find({ scheduleId }).toArray();
  const users = await db.collection("users").find({ _id: { $in: attendees.flatMap((item) => userIdCandidates(item.userId)) } }).toArray();
  const userById = new Map(users.map((user) => [user._id.toString(), user]));
  const attending = attendees.some((item) => item.userId === session.user.id);

  return (
    <>
      <h1>{schedule.title}</h1>
      <p>{schedule.description}</p>
      <dl><dt>날짜</dt><dd>{schedule.startDate}부터 {schedule.endDate}까지</dd><dt>장소</dt><dd>{schedule.region}</dd></dl>
      <form action={toggleScheduleAttendanceAction}>
        <input type="hidden" name="gatheringId" value={id} />
        <input type="hidden" name="scheduleId" value={scheduleId} />
        <button type="submit">{attending ? "참여 취소" : "참여하기"}</button>
      </form>
      <h2>참여 멤버</h2>
      {attendees.length === 0 ? <p>참여자가 없습니다.</p> : <ul>{attendees.map((item) => <li key={item._id.toString()}>{userById.get(item.userId)?.nickname || "멤버"}</li>)}</ul>}
    </>
  );
}
