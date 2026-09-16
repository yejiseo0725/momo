import assert from "node:assert/strict";
import test from "node:test";
import { seedDataStructure } from "../scripts/seeds.js";

test("문서에 정의된 모든 핵심 컬렉션을 시드 구조가 포함한다", () => {
  const collectionNames = Object.keys(seedDataStructure.collections);

  assert.deepEqual(collectionNames, [
    "users",
    "gatherings",
    "gatheringMembers",
    "challenges",
    "challengeFeeds",
    "schedules",
    "scheduleMembers",
    "cashBooks",
    "chatRooms",
    "chatMessages",
    "notifications",
  ]);
});

test("README의 카테고리와 시드 열거형이 일치한다", () => {
  assert.deepEqual(seedDataStructure.enums.category, [
    "운동",
    "공부",
    "공연/예술",
    "친목",
    "가족",
  ]);
});
