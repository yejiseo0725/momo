import { ObjectId } from "mongodb";

export function parseObjectId(value) {
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    return null;
  }

  return new ObjectId(value);
}

export function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

export function serializeDocument(document) {
  if (!document) {
    return null;
  }

  const serializedDocument = {};

  for (const [key, value] of Object.entries(document)) {
    if (key === "_id") {
      serializedDocument.id = value.toString();
    } else if (value instanceof Date) {
      serializedDocument[key] = value.toISOString();
    } else {
      serializedDocument[key] = value;
    }
  }

  return serializedDocument;
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
