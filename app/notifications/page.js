import Link from "next/link";
import { connection } from "next/server";
import MarkNotificationsRead from "@/app/notifications/mark-read";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export default async function NotificationsPage() {
  await connection();
  const session = await requireSession();
  const notifications = await db.collection("notifications").find({ userId: session.user.id }).sort({ createdAt: -1 }).toArray();

  return (
    <>
      <MarkNotificationsRead hasUnread={notifications.some((item) => !item.isRead)} />
      <h1>알림</h1>
      {notifications.length === 0 ? <p>알림이 없습니다.</p> : (
        <ul>{notifications.map((notification) => <li key={notification._id.toString()}><Link href={`/gatherings/${notification.gatheringId}`}>{notification.message}</Link> <small>{notification.createdAt.toLocaleString("ko-KR")}{notification.isRead ? "" : " · 새 알림"}</small></li>)}</ul>
      )}
    </>
  );
}
