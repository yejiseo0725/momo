import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { GridFSBucket } from "mongodb";

import { getDatabase } from "@/lib/mongodb";
import { parseObjectId } from "@/lib/utils/documents";

const bucketName = "challengeFeedImages";
const maximumImageSize = 5 * 1024 * 1024;
const imageTypes = {
  "image/jpeg": {
    extension: "jpg",
    hasValidSignature(buffer) {
      return buffer.length >= 3
        && buffer[0] === 0xff
        && buffer[1] === 0xd8
        && buffer[2] === 0xff;
    },
  },
  "image/png": {
    extension: "png",
    hasValidSignature(buffer) {
      const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      return buffer.length >= pngSignature.length
        && buffer.subarray(0, pngSignature.length).equals(pngSignature);
    },
  },
  "image/webp": {
    extension: "webp",
    hasValidSignature(buffer) {
      return buffer.length >= 12
        && buffer.toString("ascii", 0, 4) === "RIFF"
        && buffer.toString("ascii", 8, 12) === "WEBP";
    },
  },
};

export class ChallengeImageError extends Error {
  constructor(message) {
    super(message);
    this.name = "ChallengeImageError";
  }
}

export function hasSelectedChallengeImage(file) {
  return file
    && typeof file === "object"
    && typeof file.arrayBuffer === "function"
    && typeof file.size === "number"
    && file.size > 0;
}

export async function storeChallengeImage(file, metadata) {
  if (!hasSelectedChallengeImage(file)) {
    return null;
  }
  if (file.size > maximumImageSize) {
    throw new ChallengeImageError("인증 이미지는 5MB 이하만 등록할 수 있습니다.");
  }

  const imageType = imageTypes[file.type];
  if (!imageType) {
    throw new ChallengeImageError("인증 이미지는 JPG, PNG, WebP 파일만 등록할 수 있습니다.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!imageType.hasValidSignature(buffer)) {
    throw new ChallengeImageError("올바른 이미지 파일을 선택해 주세요.");
  }

  const database = await getDatabase();
  const bucket = new GridFSBucket(database, { bucketName });
  const uploadStream = bucket.openUploadStream(`challenge-image.${imageType.extension}`, {
    metadata: {
      ...metadata,
      contentType: file.type,
    },
  });

  await pipeline(Readable.from([buffer]), uploadStream);
  return uploadStream.id.toString();
}

export async function getChallengeImage(imageId) {
  const objectId = parseObjectId(imageId);
  if (!objectId) {
    return null;
  }

  const database = await getDatabase();
  const [file, feed] = await Promise.all([
    database.collection(`${bucketName}.files`).findOne({ _id: objectId }),
    database.collection("challengeFeeds").findOne({ imageId }),
  ]);

  if (!file || !feed || !imageTypes[file.metadata?.contentType]) {
    return null;
  }

  const gatheringId = file.metadata?.gatheringId;
  if (typeof gatheringId !== "string") {
    return null;
  }

  const bucket = new GridFSBucket(database, { bucketName });
  return {
    contentType: file.metadata.contentType,
    gatheringId,
    length: file.length,
    stream: bucket.openDownloadStream(objectId),
  };
}

export async function deleteChallengeImages(imageIds) {
  const objectIds = [...new Set(imageIds)]
    .map((imageId) => parseObjectId(imageId))
    .filter(Boolean);

  if (objectIds.length === 0) {
    return;
  }

  const database = await getDatabase();
  const bucket = new GridFSBucket(database, { bucketName });
  await Promise.allSettled(objectIds.map((objectId) => bucket.delete(objectId)));
}
