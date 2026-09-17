import { randomBytes } from "node:crypto";

import { getDatabase } from "@/lib/mongodb";
import { getRegionCodesByKeyword, getRegionName } from "@/lib/regions";
import { getUserDisplayNames } from "@/lib/users";
import { parseObjectId, serializeDocument } from "@/lib/utils/documents";
import { escapeRegularExpression } from "@/lib/utils/validation";

export class GatheringError extends Error {
  constructor(message) {
    super(message);
    this.name = "GatheringError";
  }
}

export class GatheringCreationError extends Error {
  constructor(collectionName, cause) {
    super(`${collectionName} 저장 중 모임 생성에 실패했습니다.`, { cause });
    this.name = "GatheringCreationError";
    this.collectionName = collectionName;
  }
}

function createInviteToken() {
  return randomBytes(24).toString("base64url");
}

function serializeGathering(gathering) {
  const serializedGathering = serializeDocument(gathering);

  return {
    ...serializedGathering,
    regionCode: serializedGathering.region,
    region: getRegionName(serializedGathering.region),
  };
}

async function getMemberCounts(database, gatheringIds) {
  if (gatheringIds.length === 0) {
    return new Map();
  }

  const counts = await database.collection("gatheringMembers").aggregate([
    { $match: { gatheringId: { $in: gatheringIds } } },
    { $group: { _id: "$gatheringId", count: { $sum: 1 } } },
  ]).toArray();

  return new Map(counts.map((item) => [item._id, item.count]));
}

function addListDetailsToGathering(gathering, memberCounts, creatorNames) {
  const serializedGathering = serializeGathering(gathering);

  delete serializedGathering.inviteToken;

  return {
    ...serializedGathering,
    memberCount: memberCounts.get(serializedGathering.id) || 0,
    creatorName: creatorNames.get(serializedGathering.userId) || "알 수 없는 사용자",
  };
}

export async function getPublicGatherings({
  keyword = "",
  category = "",
  limit = 50,
  excludeUserId = "",
} = {}) {
  const database = await getDatabase();
  const query = { isPublic: true };

  if (excludeUserId) {
    const memberships = await database
      .collection("gatheringMembers")
      .find(
        { userId: excludeUserId },
        { projection: { _id: 0, gatheringId: 1 } },
      )
      .toArray();
    const joinedGatheringIds = memberships
      .map((membership) => parseObjectId(membership.gatheringId))
      .filter(Boolean);

    query.userId = { $ne: excludeUserId };

    if (joinedGatheringIds.length > 0) {
      query._id = { $nin: joinedGatheringIds };
    }
  }

  if (keyword) {
    const safeKeyword = escapeRegularExpression(keyword.slice(0, 100));
    const regionCodes = getRegionCodesByKeyword(keyword.slice(0, 100));
    query.$or = [
      { name: { $regex: safeKeyword, $options: "i" } },
      { description: { $regex: safeKeyword, $options: "i" } },
      { region: { $regex: safeKeyword, $options: "i" } },
    ];

    if (regionCodes.length > 0) {
      query.$or.push({ region: { $in: regionCodes } });
    }
  }

  if (category) {
    query.category = category;
  }

  const gatherings = await database
    .collection("gatherings")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  const gatheringIds = gatherings.map((gathering) => gathering._id.toString());
  const [memberCounts, creatorNames] = await Promise.all([
    getMemberCounts(database, gatheringIds),
    getUserDisplayNames(database, gatherings.map((gathering) => gathering.userId)),
  ]);

  return gatherings.map((gathering) => (
    addListDetailsToGathering(gathering, memberCounts, creatorNames)
  ));
}

export async function getJoinedGatherings(userId, limit = 50) {
  const database = await getDatabase();
  const memberships = await database
    .collection("gatheringMembers")
    .find({ userId })
    .sort({ joinDate: -1 })
    .limit(limit)
    .toArray();
  const objectIds = memberships
    .map((membership) => parseObjectId(membership.gatheringId))
    .filter(Boolean);

  if (objectIds.length === 0) {
    return [];
  }

  const gatherings = await database
    .collection("gatherings")
    .find({ _id: { $in: objectIds } })
    .toArray();
  const gatheringMap = new Map(
    gatherings.map((gathering) => [gathering._id.toString(), gathering]),
  );
  const [memberCounts, creatorNames] = await Promise.all([
    getMemberCounts(
      database,
      gatherings.map((gathering) => gathering._id.toString()),
    ),
    getUserDisplayNames(database, gatherings.map((gathering) => gathering.userId)),
  ]);

  return memberships
    .map((membership) => {
      const gathering = gatheringMap.get(membership.gatheringId);
      if (!gathering) {
        return null;
      }

      return {
        ...addListDetailsToGathering(gathering, memberCounts, creatorNames),
        role: membership.role,
      };
    })
    .filter(Boolean);
}

export async function getGatheringMembership(gatheringId, userId) {
  const database = await getDatabase();
  const membership = await database.collection("gatheringMembers").findOne({
    gatheringId,
    userId,
  });
  return serializeDocument(membership);
}

export async function requireGatheringMember(gatheringId, userId) {
  const membership = await getGatheringMembership(gatheringId, userId);

  if (!membership) {
    throw new GatheringError("이 기능은 모임 멤버만 이용할 수 있습니다.");
  }

  return membership;
}

export async function requireGatheringLeader(gatheringId, userId) {
  const membership = await requireGatheringMember(gatheringId, userId);

  if (membership.role !== "LEADER") {
    throw new GatheringError("모임장만 수정할 수 있습니다.");
  }

  return membership;
}

export async function getGatheringDetails(gatheringId, currentUserId) {
  const objectId = parseObjectId(gatheringId);

  if (!objectId) {
    return null;
  }

  const database = await getDatabase();
  const gathering = await database.collection("gatherings").findOne({ _id: objectId });

  if (!gathering) {
    return null;
  }

  const members = await database
    .collection("gatheringMembers")
    .find({ gatheringId })
    .sort({ role: 1, joinDate: 1 })
    .toArray();
  const membership = members.find((member) => member.userId === currentUserId) || null;

  if (!gathering.isPublic && !membership) {
    return null;
  }

  const userNames = await getUserDisplayNames(database, members.map((member) => member.userId));
  const serializedGathering = serializeGathering(gathering);

  if (gathering.isPublic) {
    delete serializedGathering.inviteToken;
  }

  return {
    gathering: {
      ...serializedGathering,
      memberCount: members.length,
    },
    membership: serializeDocument(membership),
    members: members.map((member) => ({
      ...serializeDocument(member),
      displayName: userNames.get(member.userId) || "알 수 없는 사용자",
    })),
  };
}

export async function getGatheringInvitation(inviteToken, currentUserId) {
  if (typeof inviteToken !== "string" || inviteToken.length < 32 || inviteToken.length > 100) {
    return null;
  }

  const database = await getDatabase();
  const gathering = await database.collection("gatherings").findOne({
    inviteToken,
    isPublic: false,
  });

  if (!gathering) {
    return null;
  }

  const gatheringId = gathering._id.toString();
  const [memberCount, membership] = await Promise.all([
    database.collection("gatheringMembers").countDocuments({ gatheringId }),
    database.collection("gatheringMembers").findOne({
      gatheringId,
      userId: currentUserId,
    }),
  ]);
  const serializedGathering = serializeGathering(gathering);

  delete serializedGathering.inviteToken;

  return {
    gathering: {
      ...serializedGathering,
      memberCount,
    },
    membership: serializeDocument(membership),
  };
}

export async function createGathering(userId, input) {
  const database = await getDatabase();
  const now = new Date();
  const gathering = {
    userId,
    inviteToken: createInviteToken(),
    name: input.name,
    region: input.region,
    description: input.description,
    imageUrl: null,
    category: input.category,
    maxMemCount: input.maxMemCount,
    isPublic: input.isPublic,
    createdAt: now,
    updatedAt: now,
  };
  let result;

  try {
    result = await database.collection("gatherings").insertOne(gathering);
  } catch (error) {
    throw new GatheringCreationError("gatherings", error);
  }

  const gatheringId = result.insertedId.toString();
  let failedCollection = "gatheringMembers";

  try {
    await database.collection("gatheringMembers").insertOne({
      gatheringId,
      userId,
      joinDate: now,
      role: "LEADER",
    });
    failedCollection = "chatRooms";
    await database.collection("chatRooms").insertOne({
      gatheringId,
      createdAt: now,
    });
  } catch (error) {
    try {
      await database.collection("gatheringMembers").deleteMany({ gatheringId });
      await database.collection("chatRooms").deleteMany({ gatheringId });
      await database.collection("gatherings").deleteOne({ _id: result.insertedId });
    } catch (rollbackError) {
      console.error(
        `[createGathering] ${failedCollection} 실패 후 롤백하지 못했습니다.`,
        rollbackError,
      );
    }

    throw new GatheringCreationError(failedCollection, error);
  }

  return gatheringId;
}

export async function updateGathering(gatheringId, userId, input) {
  await requireGatheringLeader(gatheringId, userId);
  const objectId = parseObjectId(gatheringId);

  if (!objectId) {
    throw new GatheringError("존재하지 않는 모임입니다.");
  }

  const database = await getDatabase();
  const gathering = await database.collection("gatherings").findOne(
    { _id: objectId, userId },
    { projection: { inviteToken: 1 } },
  );

  if (!gathering) {
    throw new GatheringError("수정할 모임을 찾지 못했습니다.");
  }

  const updateFields = {
    name: input.name,
    region: input.region,
    description: input.description,
    category: input.category,
    maxMemCount: input.maxMemCount,
    isPublic: input.isPublic,
    updatedAt: new Date(),
  };

  if (!gathering.inviteToken) {
    updateFields.inviteToken = createInviteToken();
  }

  const result = await database.collection("gatherings").updateOne(
    { _id: objectId, userId },
    { $set: updateFields },
  );

  if (result.matchedCount === 0) {
    throw new GatheringError("수정할 모임을 찾지 못했습니다.");
  }
}

async function addGatheringMember(database, gathering, userId) {
  const gatheringId = gathering._id.toString();
  const existingMembership = await database.collection("gatheringMembers").findOne({
    gatheringId,
    userId,
  });

  if (existingMembership) {
    return gatheringId;
  }

  const memberCount = await database.collection("gatheringMembers").countDocuments({ gatheringId });
  if (memberCount >= gathering.maxMemCount) {
    throw new GatheringError("모임 정원이 가득 찼습니다.");
  }

  await database.collection("gatheringMembers").insertOne({
    gatheringId,
    userId,
    joinDate: new Date(),
    role: "MEMBER",
  });

  return gatheringId;
}

export async function joinGathering(gatheringId, userId) {
  const objectId = parseObjectId(gatheringId);

  if (!objectId) {
    throw new GatheringError("존재하지 않는 모임입니다.");
  }

  const database = await getDatabase();
  const gathering = await database.collection("gatherings").findOne({ _id: objectId });

  if (!gathering) {
    throw new GatheringError("존재하지 않는 모임입니다.");
  }

  if (!gathering.isPublic) {
    throw new GatheringError("비공개 모임은 초대 URL로만 가입할 수 있습니다.");
  }

  await addGatheringMember(database, gathering, userId);
}

export async function joinGatheringByInvitation(inviteToken, userId) {
  if (typeof inviteToken !== "string" || inviteToken.length < 32 || inviteToken.length > 100) {
    throw new GatheringError("유효하지 않은 초대 URL입니다.");
  }

  const database = await getDatabase();
  const gathering = await database.collection("gatherings").findOne({
    inviteToken,
    isPublic: false,
  });

  if (!gathering) {
    throw new GatheringError("유효하지 않은 초대 URL입니다.");
  }

  return addGatheringMember(database, gathering, userId);
}

export async function leaveGathering(gatheringId, userId) {
  const membership = await requireGatheringMember(gatheringId, userId);

  if (membership.role === "LEADER") {
    throw new GatheringError("모임장은 모임을 탈퇴할 수 없습니다.");
  }

  const database = await getDatabase();
  const schedules = await database
    .collection("schedules")
    .find({ gatheringId }, { projection: { _id: 1 } })
    .toArray();
  const scheduleIds = schedules.map((schedule) => schedule._id.toString());

  if (scheduleIds.length > 0) {
    await database.collection("scheduleMembers").deleteMany({
      scheduleId: { $in: scheduleIds },
      userId,
    });
  }

  await database.collection("notifications").deleteMany({ gatheringId, userId });
  await database.collection("gatheringMembers").deleteOne({ gatheringId, userId });
}
