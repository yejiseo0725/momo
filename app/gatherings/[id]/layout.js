import GatheringNavigation from '@/app/gatherings/[id]/GatheringNavigation';
import { getGatheringDetails } from '@/lib/gatherings';
import { requireSession } from '@/lib/session';
import { Typography } from '@heroui/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

export default async function GatheringLayout({ children, params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const details = await getGatheringDetails(id, session.user.id);

  if (!details) {
    notFound();
  }

  return (
    <div className="gathering-layout-container grid gap-8 md:grid-cols-[12rem_minmax(0,1fr)] md:items-start">
      <aside
        className="gathering-layout-aside md:sticky md:top-4 md:self-start"
        aria-label={`${details.gathering.name} 메뉴`}
      >
        <div className="flex flex-col gap-4">
          <Link href={`/gatherings/${id}`} className="link">
            <Typography type="h1">{details.gathering.name}</Typography>
          </Link>
          {details.membership ? <GatheringNavigation gatheringId={id} /> : null}
        </div>
      </aside>
      <div className="gathering-layout-content min-w-0 flex flex-col gap-8">{children}</div>
    </div>
  );
}
