import { Typography } from '@heroui/react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import GatheringForm from '@/app/gatherings/GatheringForm';
import HeroToast from '@/components/HeroToast';
import { getGatheringDetails } from '@/lib/gatherings';
import { redirectWithError } from '@/lib/redirects';
import { requireSession } from '@/lib/session';
import { CATEGORIES, getSingleSearchParam } from '@/lib/utils/validation';

export default async function EditGatheringPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const details = await getGatheringDetails(id, session.user.id);

  if (!details) {
    notFound();
  }
  if (details.membership?.role !== 'LEADER') {
    redirectWithError(`/gatherings/${id}`, '모임장만 수정할 수 있습니다.');
  }

  const { gathering } = details;

  return (
    <section className="flex flex-col gap-4">
      <HeroToast
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <Typography type="h1">모임 수정</Typography>
      <GatheringForm
        categories={CATEGORIES}
        gatheringId={id}
        initialValues={{
          name: gathering.name,
          region: gathering.regionCode,
          regionName: gathering.region,
          description: gathering.description,
          imageUrl: gathering.imageUrl || null,
          maxMemCount: gathering.maxMemCount,
          category: gathering.category,
          visibility: gathering.isPublic ? 'public' : 'private',
        }}
        minimumMemberCount={Math.max(1, gathering.memberCount)}
        mode="edit"
      />
    </section>
  );
}
