import { ObjectId } from "mongodb";

export function toObjectId(value) {
  if (!ObjectId.isValid(value)) {
    return null;
  }

  return new ObjectId(value);
}

export function userIdCandidates(userId) {
  const candidates = [userId];

  if (ObjectId.isValid(userId)) {
    candidates.push(new ObjectId(userId));
  }

  return candidates;
}
