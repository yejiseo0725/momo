import { ObjectId } from "mongodb";

import { getDatabase } from "@/lib/mongodb";
import { isRegionCode } from "@/lib/regions";

export async function getUserRegion(userId) {
  if (!ObjectId.isValid(userId)) {
    return "";
  }

  const database = await getDatabase();
  const user = await database.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { region: 1 } },
  );

  return isRegionCode(user?.region) ? user.region : "";
}

export async function getUserDisplayNames(database, userIds) {
  const uniqueUserIds = [...new Set(userIds)];
  const objectIds = uniqueUserIds
    .filter((userId) => ObjectId.isValid(userId))
    .map((userId) => new ObjectId(userId));

  if (objectIds.length === 0) {
    return new Map();
  }

  const users = await database.collection("users").find(
    { _id: { $in: objectIds } },
    { projection: { name: 1, nickname: 1 } },
  ).toArray();

  return new Map(users.map((user) => [
    user._id.toString(),
    user.nickname || user.name || "알 수 없는 사용자",
  ]));
}
