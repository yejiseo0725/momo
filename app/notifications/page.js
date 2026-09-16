import Link from "next/link";
import { connection } from "next/server";

import EmptyState from "@/components/EmptyState";
import { getNotifications } from "@/lib/notifications";
import { requireSession } from "@/lib/session";
import { formatDateTime } from "@/lib/utils/documents";

export default async function NotificationsPage() {
  await connection();
  const session = await requireSession();
  const notifications = await getNotifications(session.user.id);

  return (
    <section>
      <h1>알림</h1>
      <p>알림 페이지를 열면 읽지 않은 알림이 모두 읽음 처리됩니다.</p>

      {notifications.length === 0 ? <EmptyState>도착한 알림이 없습니다.</EmptyState> : (
        <div className="stack">
          {notifications.map((notification) => (
            <article key={notification.id}>
              <header>
                <p><small>{notification.gatheringName} · {formatDateTime(notification.createdAt)}</small></p>
                <h2>{notification.type === "SCHEDULE_CREATED" ? "새 일정" : "새 챌린지"}</h2>
              </header>
              <p>{notification.message}</p>
              <footer><Link href={notification.href}>내용 보기</Link></footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
