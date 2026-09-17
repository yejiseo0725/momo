import { Typography } from "@heroui/react";
import { connection } from "next/server";

import GatheringForm from "@/app/gatherings/GatheringForm";
import ToastMessage from "@/components/ToastMessage";
import { requireSession } from "@/lib/session";
import { CATEGORIES, getSingleSearchParam } from "@/lib/utils/validation";

export default async function NewGatheringPage({ searchParams }) {
  await connection();
  await requireSession();
  const query = await searchParams;

  return (
    <section className="flex flex-col gap-4">
      <ToastMessage
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <Typography type="h1">새 모임 만들기</Typography>
      <GatheringForm
        categories={CATEGORIES}
        initialValues={{
          name: "",
          region: "",
          regionName: "",
          description: "",
          maxMemCount: "",
          category: "",
          visibility: "public",
        }}
        mode="create"
      />
    </section>
  );
}
