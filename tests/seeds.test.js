"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildCollectionJsonSchema,
  collectionIndexes,
  hasSameIndexKeys,
  sampleIds,
  sampleUsers,
  seedDataStructure,
} = require("../scripts/seeds.js");

test("모든 애플리케이션 컬렉션은 JSON Schema로 변환된다", () => {
  const applicationCollections = Object.entries(seedDataStructure.collections)
    .filter(([, definition]) => !definition.managedBy)
    .map(([name]) => name);

  for (const collectionName of applicationCollections) {
    const schema = buildCollectionJsonSchema(collectionName);
    assert.equal(schema.bsonType, "object");
    assert.equal(schema.additionalProperties, false);
    assert.ok(schema.required.includes("_id"));
    assert.ok(collectionIndexes[collectionName].length > 0);
  }
});

test("gatheringMembers는 모임과 사용자 조합을 유일하게 제한한다", () => {
  const uniqueIndex = collectionIndexes.gatheringMembers.find(
    (index) => index.options.name === "gatheringMembers_gathering_user_unique",
  );

  assert.deepEqual(uniqueIndex.keys, { gatheringId: 1, userId: 1 });
  assert.equal(uniqueIndex.options.unique, true);
});

test("채팅 메시지는 방과 메시지 ID 기준 증분 조회 인덱스를 사용한다", () => {
  const cursorIndex = collectionIndexes.chatMessages.find(
    (index) => index.options.name === "chatMessages_room_id",
  );

  assert.deepEqual(cursorIndex.keys, { chatRoomId: 1, _id: 1 });
});

test("사용자 알림 수신 설정은 기본적으로 켜져 있다", () => {
  const notificationEnabled = seedDataStructure.collections.users.fields.notificationEnabled;

  assert.equal(notificationEnabled.type, "boolean");
  assert.equal(notificationEnabled.required, false);
  assert.equal(notificationEnabled.defaultValue, true);
});

test("모임 초대 토큰은 고유하고 기존 모임도 허용한다", () => {
  const gatheringSchema = buildCollectionJsonSchema("gatherings");
  const inviteTokenIndex = collectionIndexes.gatherings.find(
    (index) => index.options.name === "gatherings_inviteToken_unique",
  );

  assert.equal(gatheringSchema.properties.inviteToken.bsonType, "string");
  assert.equal(gatheringSchema.required.includes("inviteToken"), false);
  assert.deepEqual(inviteTokenIndex.keys, { inviteToken: 1 });
  assert.equal(inviteTokenIndex.options.unique, true);
  assert.equal(inviteTokenIndex.options.sparse, true);
});

test("챌린지 인증 이미지는 GridFS 파일 ID로 저장한다", () => {
  const challengeFeedSchema = buildCollectionJsonSchema("challengeFeeds");

  assert.equal(challengeFeedSchema.properties.imageId.bsonType.includes("string"), true);
  assert.equal(challengeFeedSchema.properties.imageId.bsonType.includes("null"), true);
  assert.equal(challengeFeedSchema.required.includes("imageId"), false);
});

test("인덱스 이름과 관계없이 필드와 정렬 순서가 같으면 기존 인덱스로 판단한다", () => {
  assert.equal(
    hasSameIndexKeys(
      { isPublic: 1, createdAt: -1 },
      { isPublic: 1, createdAt: -1 },
    ),
    true,
  );
  assert.equal(
    hasSameIndexKeys(
      { createdAt: -1, isPublic: 1 },
      { isPublic: 1, createdAt: -1 },
    ),
    false,
  );
});

test("날짜 전용 필드는 YYYY-MM-DD 패턴을 사용한다", () => {
  const scheduleSchema = buildCollectionJsonSchema("schedules");
  assert.equal(scheduleSchema.properties.startDate.pattern, "^\\d{4}-\\d{2}-\\d{2}$");
  assert.equal(scheduleSchema.properties.endDate.pattern, "^\\d{4}-\\d{2}-\\d{2}$");
});

test("모임 지역은 법정동 코드 또는 ONLINE만 허용한다", () => {
  const gatheringSchema = buildCollectionJsonSchema("gatherings");

  assert.equal(gatheringSchema.properties.region.pattern, "^(?:\\d{10}|ONLINE)$");
});

test("일정의 자유 입력 장소는 region이 아닌 location에 저장한다", () => {
  const scheduleSchema = buildCollectionJsonSchema("schedules");

  assert.equal(scheduleSchema.required.includes("location"), true);
  assert.equal(scheduleSchema.properties.location.bsonType, "string");
  assert.equal(scheduleSchema.properties.region, undefined);
});

test("예시 계정과 모임 ID는 반복 실행 가능한 고정값을 사용한다", () => {
  assert.deepEqual(
    sampleUsers.map((user) => user.email),
    ["leader@momo.local", "member@momo.local"],
  );
  assert.equal(sampleIds.studyGathering.toString(), "660000000000000000000001");
  assert.equal(sampleIds.runningGathering.toString(), "660000000000000000000002");
});
