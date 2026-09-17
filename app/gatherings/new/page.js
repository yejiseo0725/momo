import { connection } from "next/server";

import GatheringForm from "@/app/gatherings/GatheringForm";
import { requireSession } from "@/lib/session";
import { CATEGORIES } from "@/lib/utils/validation";

export default async function NewGatheringPage() {
  await connection();
  await requireSession();

  return (
    <section>
      <h1>새 모임 만들기</h1>
      <GatheringForm
        categories={CATEGORIES}
        initialValues={{
          name: "",
          region: "",
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
