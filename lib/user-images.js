import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { GridFSBucket } from "mongodb";

import { getDatabase } from "@/lib/mongodb";
import { parseObjectId } from "@/lib/utils/documents";

const bucketName = "userImages";
const imageUrlPrefix = "/api/user-images/";
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

export class UserImageError extends Error {
  constructor(message) {
    super(message);
    this.name = "UserImageError";
  }
}

export function hasSelectedUserImage(file) {
  return file
    && typeof file === "object"
    && typeof file.arrayBuffer === "function"
    && typeof file.size === "number"
    && file.size > 0;
}

function getUserImageId(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.startsWith(imageUrlPrefix)) {
    return null;
  }

  return parseObjectId(imageUrl.slice(imageUrlPrefix.length));
}

export async function storeUserImage(file, metadata) {
  if (!hasSelectedUserImage(file)) {
    return null;
  }
  if (file.size > maximumImageSize) {
    throw new UserImageError("프로필 이미지는 5MB 이하만 등록할 수 있습니다.");
  }

  const imageType = imageTypes[file.type];
  if (!imageType) {
    throw new UserImageError("프로필 이미지는 JPG, PNG, WebP 파일만 등록할 수 있습니다.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!imageType.hasValidSignature(buffer)) {
    throw new UserImageError("올바른 프로필 이미지 파일을 선택해 주세요.");
  }

  const database = await getDatabase();
  const bucket = new GridFSBucket(database, { bucketName });
  const uploadStream = bucket.openUploadStream(`user-image.${imageType.extension}`, {
    metadata: {
      ...metadata,
      contentType: file.type,
    },
  });

  await pipeline(Readable.from([buffer]), uploadStream);
  return `${imageUrlPrefix}${uploadStream.id.toString()}`;
}

export async function getUserImage(imageId) {
  const objectId = parseObjectId(imageId);
  if (!objectId) {
    return null;
  }

  const database = await getDatabase();
  const imageUrl = `${imageUrlPrefix}${objectId.toString()}`;
  const [file, user] = await Promise.all([
    database.collection(`${bucketName}.files`).findOne({ _id: objectId }),
    database.collection("users").findOne(
      { image: imageUrl },
      { projection: { _id: 1 } },
    ),
  ]);

  if (!file || !user || !imageTypes[file.metadata?.contentType]) {
    return null;
  }

  const bucket = new GridFSBucket(database, { bucketName });
  return {
    contentType: file.metadata.contentType,
    length: file.length,
    stream: bucket.openDownloadStream(objectId),
  };
}

export async function deleteUserImage(imageUrl) {
  const objectId = getUserImageId(imageUrl);
  if (!objectId) {
    return;
  }

  const database = await getDatabase();
  const bucket = new GridFSBucket(database, { bucketName });
  await Promise.allSettled([bucket.delete(objectId)]);
}
