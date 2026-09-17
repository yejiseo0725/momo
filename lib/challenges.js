import {
  ChallengeImageError,
  deleteChallengeImages,
  hasSelectedChallengeImage,
  storeChallengeImage,
} from "@/lib/challenge-images";
import { GatheringError, requireGatheringMember } from "@/lib/gatherings";
import { getDatabase } from "@/lib/mongodb";
import { createGatheringNotifications } from "@/lib/notifications";
import { getUserDisplayNames } from "@/lib/users";
import { getTodayDateOnly, parseObjectId, serializeDocument } from "@/lib/utils/documents";

export class ChallengeError extends Error {
  constructor(message) {
    super(message);
    this.name = "ChallengeError";
  }
}

async function getChallengeForAuthor(database, challengeId, gatheringId, userId) {
  const objectId = parseObjectId(challengeId);
  if (!objectId) {
    throw new ChallengeError("존재하지 않는 챌린지입니다.");
  }

  const challenge = await database.collection("challenges").findOne({
    _id: objectId,
    gatheringId,
  });

  if (!challenge) {
    throw new ChallengeError("존재하지 않는 챌린지입니다.");
  }
  if (challenge.userId !== userId) {
    throw new ChallengeError("챌린지 작성자만 수정하거나 삭제할 수 있습니다.");
  }

  return challenge;
}

export async function getChallenges(gatheringId, userId) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const challenges = await database
    .collection("challenges")
    .find({ gatheringId })
    .sort({ createdAt: -1 })
    .toArray();
  const challengeIds = challenges.map((challenge) => challenge._id.toString());
  const feeds = challengeIds.length > 0
    ? await database
      .collection("challengeFeeds")
      .find({ challengeId: { $in: challengeIds } })
      .sort({ doneDate: -1, createdAt: -1 })
      .toArray()
    : [];
  const displayNames = await getUserDisplayNames(
    database,
    [...challenges.map((challenge) => challenge.userId), ...feeds.map((feed) => feed.userId)],
  );
  const feedsByChallenge = new Map();

  for (const feed of feeds) {
    const currentFeeds = feedsByChallenge.get(feed.challengeId) || [];
    currentFeeds.push({
      ...serializeDocument(feed),
      authorName: displayNames.get(feed.userId) || "알 수 없는 사용자",
    });
    feedsByChallenge.set(feed.challengeId, currentFeeds);
  }

  return challenges.map((challenge) => {
    const serializedChallenge = serializeDocument(challenge);
    return {
      ...serializedChallenge,
      authorName: displayNames.get(challenge.userId) || "알 수 없는 사용자",
      feeds: feedsByChallenge.get(serializedChallenge.id) || [],
    };
  });
}

export async function createChallenge(gatheringId, userId, input) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const now = new Date();
  const result = await database.collection("challenges").insertOne({
    gatheringId,
    userId,
    title: input.title,
    description: input.description,
    useImage: input.useImage,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: now,
    updatedAt: now,
  });

  await createGatheringNotifications({
    gatheringId,
    actorUserId: userId,
    type: "CHALLENGE_CREATED",
    targetId: result.insertedId.toString(),
    message: "새 챌린지를 등록했습니다.",
  });
}

export async function updateChallenge(challengeId, gatheringId, userId, input) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const challenge = await getChallengeForAuthor(database, challengeId, gatheringId, userId);

  await database.collection("challenges").updateOne(
    { _id: challenge._id },
    {
      $set: {
        title: input.title,
        description: input.description,
        useImage: input.useImage,
        startDate: input.startDate,
        endDate: input.endDate,
        updatedAt: new Date(),
      },
    },
  );
}

export async function deleteChallenge(challengeId, gatheringId, userId) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const challenge = await getChallengeForAuthor(database, challengeId, gatheringId, userId);
  const feeds = await database
    .collection("challengeFeeds")
    .find({ challengeId }, { projection: { imageId: 1 } })
    .toArray();

  await database.collection("challengeFeeds").deleteMany({ challengeId });
  await database.collection("challenges").deleteOne({ _id: challenge._id });
  await deleteChallengeImages(feeds.map((feed) => feed.imageId));
}

export async function createChallengeFeed(challengeId, gatheringId, userId, input) {
  try {
    await requireGatheringMember(gatheringId, userId);
  } catch (error) {
    if (error instanceof GatheringError) {
      throw new ChallengeError(error.message);
    }
    throw error;
  }

  const database = await getDatabase();
  const objectId = parseObjectId(challengeId);
  const challenge = objectId
    ? await database.collection("challenges").findOne({ _id: objectId, gatheringId })
    : null;

  if (!challenge) {
    throw new ChallengeError("존재하지 않는 챌린지입니다.");
  }
  if (input.doneDate > getTodayDateOnly()) {
    throw new ChallengeError("미래 날짜로는 챌린지를 인증할 수 없습니다.");
  }
  if (input.doneDate < challenge.startDate || input.doneDate > challenge.endDate) {
    throw new ChallengeError("챌린지 기간 안의 인증 날짜를 선택해 주세요.");
  }
  if (challenge.useImage && !hasSelectedChallengeImage(input.imageFile)) {
    throw new ChallengeError("이 챌린지는 인증 이미지 파일이 필요합니다.");
  }

  const now = new Date();
  let imageId = null;

  try {
    imageId = await storeChallengeImage(input.imageFile, {
      challengeId,
      gatheringId,
      userId,
    });
  } catch (error) {
    if (error instanceof ChallengeImageError) {
      throw new ChallengeError(error.message);
    }
    throw error;
  }

  try {
    await database.collection("challengeFeeds").insertOne({
      challengeId,
      userId,
      doneDate: input.doneDate,
      imageId,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    await deleteChallengeImages([imageId]);
    throw error;
  }
}
