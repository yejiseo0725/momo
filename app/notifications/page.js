import Link from "next/link";
import { connection } from "next/server";

import EmptyState from "@/components/EmptyState";
import ToastMessage from "@/components/ToastMessage";
import { getNotifications } from "@/lib/notifications";
import { requireSession } from "@/lib/session";
import { formatDateTime } from "@/lib/utils/documents";
import { getSingleSearchParam } from "@/lib/utils/validation";

export default async function NotificationsPage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const notifications = await getNotifications(session.user.id);

  return (
    <section>
      <ToastMessage
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <h1>알림</h1>

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
