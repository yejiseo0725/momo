import { db } from "@/lib/mongodb";
import { toObjectId } from "@/lib/database-helpers";

export async function getGatheringMembership(gatheringId, userId) {
  return db.collection("gatheringMembers").findOne({ gatheringId, userId });
}

export async function requireGatheringMember(gatheringId, userId) {
  const membership = await getGatheringMembership(gatheringId, userId);

  if (!membership) {
    throw new Error("모임 멤버만 이용할 수 있습니다.");
  }

  return membership;
}

export async function requireOwnedDocument(collectionName, documentId, userId) {
  const objectId = toObjectId(documentId);

  if (!objectId) {
    throw new Error("올바르지 않은 항목입니다.");
  }

  const document = await db.collection(collectionName).findOne({ _id: objectId });

  if (!document || document.userId !== userId) {
    throw new Error("작성자만 변경할 수 있습니다.");
  }

  return document;
}
