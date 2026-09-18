import EmptyState from '@/components/EmptyState';
import GatheringCard from '@/components/GatheringCard';
import HeroToast from '@/components/HeroToast';
import PlusIcon from '@/components/PlusIcon';
import { getJoinedGatherings } from '@/lib/gatherings';
import { requireSession } from '@/lib/session';
import { getSingleSearchParam } from '@/lib/utils/validation';
import { Typography } from '@heroui/react';
import Link from 'next/link';
import { connection } from 'next/server';

export default async function MyGatheringsPage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const gatherings = await getJoinedGatherings(session.user.id);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Typography type="h1">내 모임</Typography>
          <Link href="/gatherings/new" className="button button--primary">
            <PlusIcon />모임 만들기
          </Link>
        </div>
      </div>
      <HeroToast message={getSingleSearchParam(query.message)} />

      {gatherings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gatherings.map((gathering) => (
            <GatheringCard key={gathering.id} gathering={gathering} />
          ))}
        </div>
      ) : (
        <EmptyState>가입한 모임이 없습니다.</EmptyState>
      )}
    </section>
  );
}
