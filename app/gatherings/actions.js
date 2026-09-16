"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { toObjectId } from "@/lib/database-helpers";
import {
  getGatheringMembership,
  requireGatheringMember,
  requireOwnedDocument,
} from "@/lib/gathering-access";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

function text(formData, name) {
  return String(formData.get(name) || "").trim();
}

function requireTextFields(values) {
  if (values.some((value) => !value)) {
    throw new Error("필수 항목을 모두 입력해 주세요.");
  }
}

function validateDateRange(startDate, endDate) {
  requireTextFields([startDate, endDate]);
  if (endDate < startDate) {
    throw new Error("종료일은 시작일보다 빠를 수 없습니다.");
  }
}

async function createNotifications({ gatheringId, actorUserId, type, targetId, message }) {
  const members = await db
    .collection("gatheringMembers")
    .find({ gatheringId, userId: { $ne: actorUserId } })
    .toArray();

  if (members.length === 0) {
    return;
  }

  await db.collection("notifications").insertMany(
    members.map((member) => ({
      userId: member.userId,
      actorUserId,
      gatheringId,
      type,
      targetId,
      message,
      isRead: false,
      createdAt: new Date(),
    })),
  );
}

export async function createGatheringAction(formData) {
  const session = await requireSession();
  const name = text(formData, "name");
  const region = text(formData, "region");
  const description = text(formData, "description");
  const category = text(formData, "category");
  const maxMemCount = Number(formData.get("maxMemCount"));
  const isPublic = formData.get("isPublic") === "true";

  requireTextFields([name, region, description]);
  if (!CATEGORIES.includes(category)) {
    throw new Error("카테고리를 선택해 주세요.");
  }
  if (!Number.isInteger(maxMemCount) || maxMemCount < 1 || maxMemCount > 300) {
    throw new Error("최대 인원은 1명부터 300명까지 입력할 수 있습니다.");
  }

  const now = new Date();
  const result = await db.collection("gatherings").insertOne({
    userId: session.user.id,
    name,
    region,
    description,
    imageUrl: null,
    category,
    maxMemCount,
    isPublic,
    createdAt: now,
    updatedAt: now,
  });
  const gatheringId = result.insertedId.toString();

  await Promise.all([
    db.collection("gatheringMembers").insertOne({
      gatheringId,
      userId: session.user.id,
      joinDate: now,
      role: "LEADER",
    }),
    db.collection("chatRooms").insertOne({ gatheringId, createdAt: now }),
  ]);

  redirect(`/gatherings/${gatheringId}`);
}

export async function updateGatheringAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  const objectId = toObjectId(gatheringId);
  const membership = await getGatheringMembership(gatheringId, session.user.id);

  if (!objectId || membership?.role !== "LEADER") {
    throw new Error("모임장만 모임을 수정할 수 있습니다.");
  }

  const name = text(formData, "name");
  const region = text(formData, "region");
  const description = text(formData, "description");
  const category = text(formData, "category");
  const maxMemCount = Number(formData.get("maxMemCount"));
  const isPublic = formData.get("isPublic") === "true";
  requireTextFields([name, region, description]);

  if (!CATEGORIES.includes(category) || !Number.isInteger(maxMemCount) || maxMemCount < 1 || maxMemCount > 300) {
    throw new Error("모임 정보를 확인해 주세요.");
  }

  const memberCount = await db.collection("gatheringMembers").countDocuments({ gatheringId });
  if (maxMemCount < memberCount) {
    throw new Error("최대 인원은 현재 인원보다 작을 수 없습니다.");
  }

  await db.collection("gatherings").updateOne(
    { _id: objectId },
    { $set: { name, region, description, category, maxMemCount, isPublic, updatedAt: new Date() } },
  );
  revalidatePath(`/gatherings/${gatheringId}`);
}

export async function joinGatheringAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  const objectId = toObjectId(gatheringId);

  if (!objectId) {
    throw new Error("올바르지 않은 모임입니다.");
  }

  const gathering = await db.collection("gatherings").findOne({ _id: objectId });
  const hasInvitation = formData.get("invitation") === "true";
  if (!gathering || (!gathering.isPublic && !hasInvitation)) {
    throw new Error("가입할 수 없는 모임입니다.");
  }

  const memberCount = await db.collection("gatheringMembers").countDocuments({ gatheringId });
  if (memberCount >= gathering.maxMemCount) {
    throw new Error("가입이 마감된 모임입니다.");
  }

  await db.collection("gatheringMembers").updateOne(
    { gatheringId, userId: session.user.id },
    { $setOnInsert: { joinDate: new Date(), role: "MEMBER" } },
    { upsert: true },
  );
  if (hasInvitation) {
    redirect(`/gatherings/${gatheringId}`);
  }
  revalidatePath(`/gatherings/${gatheringId}`);
}

export async function leaveGatheringAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  const membership = await getGatheringMembership(gatheringId, session.user.id);

  if (!membership || membership.role === "LEADER") {
    throw new Error("모임장은 모임에서 탈퇴할 수 없습니다.");
  }

  await db.collection("gatheringMembers").deleteOne({ gatheringId, userId: session.user.id });
  redirect("/gatherings");
}

export async function saveChallengeAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  await requireGatheringMember(gatheringId, session.user.id);
  const title = text(formData, "title");
  const description = text(formData, "description");
  const startDate = text(formData, "startDate");
  const endDate = text(formData, "endDate");
  const useImage = formData.get("useImage") === "on";
  requireTextFields([title, description]);
  validateDateRange(startDate, endDate);
  const now = new Date();
  const challengeId = text(formData, "challengeId");

  if (challengeId) {
    const challenge = await requireOwnedDocument("challenges", challengeId, session.user.id);
    if (challenge.gatheringId !== gatheringId) throw new Error("올바르지 않은 챌린지입니다.");
    await db.collection("challenges").updateOne(
      { _id: challenge._id },
      { $set: { title, description, useImage, startDate, endDate, updatedAt: now } },
    );
  } else {
    const result = await db.collection("challenges").insertOne({
      gatheringId, userId: session.user.id, title, description, useImage, startDate, endDate, createdAt: now, updatedAt: now,
    });
    await createNotifications({
      gatheringId,
      actorUserId: session.user.id,
      type: "CHALLENGE_CREATED",
      targetId: result.insertedId.toString(),
      message: `새 챌린지 '${title}'이 등록되었습니다.`,
    });
  }
  revalidatePath(`/gatherings/${gatheringId}/challenges`);
}

export async function deleteChallengeAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  const challenge = await requireOwnedDocument("challenges", text(formData, "challengeId"), session.user.id);
  if (challenge.gatheringId !== gatheringId) throw new Error("올바르지 않은 챌린지입니다.");
  await db.collection("challenges").deleteOne({ _id: challenge._id });
  revalidatePath(`/gatherings/${gatheringId}/challenges`);
}

export async function createChallengeFeedAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  await requireGatheringMember(gatheringId, session.user.id);
  const challengeId = text(formData, "challengeId");
  const challenge = await db.collection("challenges").findOne({
    _id: toObjectId(challengeId),
    gatheringId,
  });
  if (!challenge) throw new Error("챌린지를 찾을 수 없습니다.");
  const description = text(formData, "description");
  const doneDate = text(formData, "doneDate");
  const imageUrl = text(formData, "imageUrl") || null;
  requireTextFields([description, doneDate]);
  if (challenge.useImage && !imageUrl) throw new Error("인증 이미지 주소를 입력해 주세요.");
  const now = new Date();
  await db.collection("challengeFeeds").insertOne({
    challengeId,
    userId: session.user.id,
    doneDate,
    imageUrl,
    description,
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath(`/gatherings/${gatheringId}/challenges`);
}

export async function saveScheduleAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  await requireGatheringMember(gatheringId, session.user.id);
  const title = text(formData, "title");
  const description = text(formData, "description");
  const startDate = text(formData, "startDate");
  const endDate = text(formData, "endDate");
  const region = text(formData, "region");
  requireTextFields([title, description, region]);
  validateDateRange(startDate, endDate);
  const now = new Date();
  const scheduleId = text(formData, "scheduleId");

  if (scheduleId) {
    const schedule = await requireOwnedDocument("schedules", scheduleId, session.user.id);
    if (schedule.gatheringId !== gatheringId) throw new Error("올바르지 않은 일정입니다.");
    await db.collection("schedules").updateOne(
      { _id: schedule._id },
      { $set: { title, description, startDate, endDate, region, updatedAt: now } },
    );
  } else {
    const result = await db.collection("schedules").insertOne({
      gatheringId, userId: session.user.id, title, description, startDate, endDate, region, createdAt: now, updatedAt: now,
    });
    await db.collection("scheduleMembers").insertOne({ scheduleId: result.insertedId.toString(), userId: session.user.id });
    await createNotifications({
      gatheringId,
      actorUserId: session.user.id,
      type: "SCHEDULE_CREATED",
      targetId: result.insertedId.toString(),
      message: `새 일정 '${title}'이 등록되었습니다.`,
    });
  }
  revalidatePath(`/gatherings/${gatheringId}/schedules`);
}

export async function deleteScheduleAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  const schedule = await requireOwnedDocument("schedules", text(formData, "scheduleId"), session.user.id);
  if (schedule.gatheringId !== gatheringId) throw new Error("올바르지 않은 일정입니다.");
  const scheduleId = schedule._id.toString();
  await Promise.all([
    db.collection("schedules").deleteOne({ _id: schedule._id }),
    db.collection("scheduleMembers").deleteMany({ scheduleId }),
  ]);
  revalidatePath(`/gatherings/${gatheringId}/schedules`);
}

export async function toggleScheduleAttendanceAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  const scheduleId = text(formData, "scheduleId");
  await requireGatheringMember(gatheringId, session.user.id);
  const schedule = await db.collection("schedules").findOne({ _id: toObjectId(scheduleId), gatheringId });
  if (!schedule) throw new Error("일정을 찾을 수 없습니다.");
  const filter = { scheduleId, userId: session.user.id };
  const attending = await db.collection("scheduleMembers").findOne(filter);
  if (attending) await db.collection("scheduleMembers").deleteOne(filter);
  else await db.collection("scheduleMembers").insertOne(filter);
  revalidatePath(`/gatherings/${gatheringId}/schedules/${scheduleId}`);
}

export async function saveCashBookAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  await requireGatheringMember(gatheringId, session.user.id);
  const title = text(formData, "title");
  const type = text(formData, "type");
  const date = text(formData, "date");
  const memo = text(formData, "memo") || null;
  const amount = Number(formData.get("amount"));
  requireTextFields([title, date]);
  if (!Number.isFinite(amount) || amount < 1 || !["INCOME", "SPENDING"].includes(type)) {
    throw new Error("가계부 내역을 확인해 주세요.");
  }
  const now = new Date();
  const cashBookId = text(formData, "cashBookId");
  if (cashBookId) {
    const cashBook = await requireOwnedDocument("cashBooks", cashBookId, session.user.id);
    if (cashBook.gatheringId !== gatheringId) throw new Error("올바르지 않은 내역입니다.");
    await db.collection("cashBooks").updateOne(
      { _id: cashBook._id },
      { $set: { title, type, date, memo, amount, updatedAt: now } },
    );
  } else {
    await db.collection("cashBooks").insertOne({
      gatheringId, userId: session.user.id, title, type, date, memo, amount, createdAt: now, updatedAt: now,
    });
  }
  revalidatePath(`/gatherings/${gatheringId}/cashbook`);
}

export async function deleteCashBookAction(formData) {
  const session = await requireSession();
  const gatheringId = text(formData, "gatheringId");
  const cashBook = await requireOwnedDocument("cashBooks", text(formData, "cashBookId"), session.user.id);
  if (cashBook.gatheringId !== gatheringId) throw new Error("올바르지 않은 내역입니다.");
  await db.collection("cashBooks").deleteOne({ _id: cashBook._id });
  revalidatePath(`/gatherings/${gatheringId}/cashbook`);
}
