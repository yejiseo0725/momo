"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export async function markNotificationsReadAction() {
  const session = await requireSession();
  await db.collection("notifications").updateMany(
    { userId: session.user.id, isRead: false },
    { $set: { isRead: true } },
  );
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
