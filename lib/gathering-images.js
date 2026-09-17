import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { GridFSBucket } from "mongodb";

import { getDatabase } from "@/lib/mongodb";
import { parseObjectId } from "@/lib/utils/documents";

const bucketName = "gatheringImages";
const imageUrlPrefix = "/api/gathering-images/";
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

export class GatheringImageError extends Error {
  constructor(message) {
    super(message);
    this.name = "GatheringImageError";
  }
}

export function hasSelectedGatheringImage(file) {
  return file
    && typeof file === "object"
    && typeof file.arrayBuffer === "function"
    && typeof file.size === "number"
    && file.size > 0;
}

function getGatheringImageId(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.startsWith(imageUrlPrefix)) {
    return null;
  }

  return parseObjectId(imageUrl.slice(imageUrlPrefix.length));
}

export async function storeGatheringImage(file, metadata) {
  if (!hasSelectedGatheringImage(file)) {
    return null;
  }
  if (file.size > maximumImageSize) {
    throw new GatheringImageError("모임 이미지는 5MB 이하만 등록할 수 있습니다.");
  }

  const imageType = imageTypes[file.type];
  if (!imageType) {
    throw new GatheringImageError("모임 이미지는 JPG, PNG, WebP 파일만 등록할 수 있습니다.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!imageType.hasValidSignature(buffer)) {
    throw new GatheringImageError("올바른 모임 이미지 파일을 선택해 주세요.");
  }

  const database = await getDatabase();
  const bucket = new GridFSBucket(database, { bucketName });
  const uploadStream = bucket.openUploadStream(`gathering-image.${imageType.extension}`, {
    metadata: {
      ...metadata,
      contentType: file.type,
    },
  });

  await pipeline(Readable.from([buffer]), uploadStream);
  return `${imageUrlPrefix}${uploadStream.id.toString()}`;
}

export async function getGatheringImage(imageId) {
  const objectId = parseObjectId(imageId);
  if (!objectId) {
    return null;
  }

  const database = await getDatabase();
  const imageUrl = `${imageUrlPrefix}${objectId.toString()}`;
  const [file, gathering] = await Promise.all([
    database.collection(`${bucketName}.files`).findOne({ _id: objectId }),
    database.collection("gatherings").findOne(
      { imageUrl },
      { projection: { isPublic: 1 } },
    ),
  ]);

  if (!file || !gathering || !imageTypes[file.metadata?.contentType]) {
    return null;
  }

  const bucket = new GridFSBucket(database, { bucketName });
  return {
    contentType: file.metadata.contentType,
    gatheringId: gathering._id.toString(),
    isPublic: gathering.isPublic,
    length: file.length,
    stream: bucket.openDownloadStream(objectId),
  };
}

export async function deleteGatheringImage(imageUrl) {
  const objectId = getGatheringImageId(imageUrl);
  if (!objectId) {
    return;
  }

  const database = await getDatabase();
  const bucket = new GridFSBucket(database, { bucketName });
  await Promise.allSettled([bucket.delete(objectId)]);
}
