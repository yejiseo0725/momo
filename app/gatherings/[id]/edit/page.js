import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import GatheringForm from "@/app/gatherings/GatheringForm";
import { getGatheringDetails } from "@/lib/gatherings";
import { requireSession } from "@/lib/session";
import { CATEGORIES } from "@/lib/utils/validation";

export default async function EditGatheringPage({ params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const details = await getGatheringDetails(id, session.user.id);

  if (!details) {
    notFound();
  }
  if (details.membership?.role !== "LEADER") {
    redirect(`/gatherings/${id}?error=${encodeURIComponent("모임장만 수정할 수 있습니다.")}`);
  }

  const { gathering } = details;

  return (
    <section>
      <h1>모임 수정</h1>
      <GatheringForm
        categories={CATEGORIES}
        gatheringId={id}
        initialValues={{
          name: gathering.name,
          region: gathering.region,
          description: gathering.description,
          maxMemCount: gathering.maxMemCount,
          category: gathering.category,
          visibility: gathering.isPublic ? "public" : "private",
        }}
        minimumMemberCount={Math.max(1, gathering.memberCount)}
        mode="edit"
      />
    </section>
  );
}
