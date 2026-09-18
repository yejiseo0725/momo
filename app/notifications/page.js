import { Card, Typography } from '@heroui/react';
import Link from 'next/link';
import { connection } from 'next/server';

import EmptyState from '@/components/EmptyState';
import HeroToast from '@/components/HeroToast';
import { getNotifications } from '@/lib/notifications';
import { requireSession } from '@/lib/session';
import { formatDateTime } from '@/lib/utils/documents';
import { getSingleSearchParam } from '@/lib/utils/validation';

export default async function NotificationsPage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const notifications = await getNotifications(session.user.id);

  return (
    <section className="flex flex-col gap-4">
      <HeroToast
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <Typography type="h1">알림</Typography>

      {notifications.length === 0 ? (
        <EmptyState>도착한 알림이 없습니다.</EmptyState>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <Card.Header>
                <Card.Description>
                  {notification.gatheringName} ·{' '}
                  {formatDateTime(notification.createdAt)}
                </Card.Description>
                <Card.Title>
                  {notification.type === 'SCHEDULE_CREATED'
                    ? '새 일정'
                    : '새 챌린지'}
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <p>{notification.message}</p>
              </Card.Content>
              <Card.Footer>
                <Link className="link" href={notification.href}>
                  내용 보기
                </Link>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
