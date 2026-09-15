"use strict";

const { MongoClient } = require("mongodb");

const CATEGORY_VALUES = ["운동", "공부", "공연/예술", "친목", "가족"];

// 챌린지, 일정, 가계부의 날짜에는 시간이 없으므로 YYYY-MM-DD 문자열로 저장한다.
const DATE_ONLY_PATTERN = "^\\d{4}-\\d{2}-\\d{2}$";

// 이 파일은 컬렉션, 검증 규칙, 인덱스만 설정한다.
// 예시 데이터 삽입과 기존 데이터 삭제는 하지 않는다.
// Better Auth가 관리하는 사용자, 세션, 계정, 인증 컬렉션은 여기서 만들지 않는다.
// 아래 컬렉션의 userId, ownerId, authorId는 Better Auth 사용자 ID를 문자열로 저장한다.
// 작성자 권한, 모임 정원, 알림 대상처럼 여러 컬렉션을 함께 확인해야 하는 규칙은
// 나중에 Server Action에서 다시 검증한다.
const collectionDefinitions = [
  {
    name: "profiles",
    schema: {
      bsonType: "object",
      additionalProperties: false,
      required: [
        "_id",
        "userId",
        "name",
        "gender",
        "nickname",
        "interestCategories",
        "region",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        userId: {
          bsonType: "string",
          minLength: 1,
        },
        name: {
          bsonType: "string",
          minLength: 1,
        },
        gender: {
          enum: ["남성", "여성"],
        },
        nickname: {
          bsonType: "string",
          minLength: 1,
        },
        interestCategories: {
          bsonType: "array",
          minItems: 1,
          uniqueItems: true,
          items: {
            enum: CATEGORY_VALUES,
          },
        },
        region: {
          bsonType: "string",
          minLength: 1,
        },
        createdAt: {
          bsonType: "date",
        },
        updatedAt: {
          bsonType: "date",
        },
      },
    },
    indexes: [
      {
        keys: { userId: 1 },
        options: { name: "profiles_userId_unique", unique: true },
      },
    ],
  },
  {
    name: "meetings",
    schema: {
      bsonType: "object",
      additionalProperties: false,
      required: [
        "_id",
        "ownerId",
        "name",
        "region",
        "introduction",
        "imageUrl",
        "isPublic",
        "maxMembers",
        "category",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        ownerId: {
          bsonType: "string",
          minLength: 1,
        },
        name: {
          bsonType: "string",
          minLength: 1,
        },
        region: {
          bsonType: "string",
          minLength: 1,
        },
        introduction: {
          bsonType: "string",
          minLength: 1,
        },
        imageUrl: {
          bsonType: "string",
          minLength: 1,
        },
        isPublic: {
          bsonType: "bool",
        },
        maxMembers: {
          bsonType: ["int", "long", "double", "decimal"],
          minimum: 1,
          maximum: 300,
          multipleOf: 1,
        },
        category: {
          enum: CATEGORY_VALUES,
        },
        inviteCode: {
          bsonType: "string",
          minLength: 1,
        },
        createdAt: {
          bsonType: "date",
        },
        updatedAt: {
          bsonType: "date",
        },
      },
    },
    indexes: [
      {
        keys: { isPublic: 1, createdAt: -1 },
        options: { name: "meetings_public_createdAt" },
      },
      {
        keys: { category: 1, isPublic: 1, createdAt: -1 },
        options: { name: "meetings_category_public_createdAt" },
      },
      {
        keys: { region: 1, isPublic: 1, createdAt: -1 },
        options: { name: "meetings_region_public_createdAt" },
      },
      {
        keys: { ownerId: 1, createdAt: -1 },
        options: { name: "meetings_owner_createdAt" },
      },
      {
        keys: { inviteCode: 1 },
        options: {
          name: "meetings_inviteCode_unique",
          unique: true,
          sparse: true,
        },
      },
      {
        keys: { name: "text", introduction: "text", region: "text" },
        options: {
          name: "meetings_keyword_search",
          default_language: "none",
        },
      },
    ],
  },
  {
    name: "meetingMembers",
    schema: {
      bsonType: "object",
      additionalProperties: false,
      required: ["_id", "meetingId", "userId", "role", "joinedAt"],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        meetingId: {
          bsonType: "string",
          minLength: 1,
        },
        userId: {
          bsonType: "string",
          minLength: 1,
        },
        role: {
          enum: ["owner", "member"],
        },
        joinedAt: {
          bsonType: "date",
        },
      },
    },
    indexes: [
      {
        keys: { meetingId: 1, userId: 1 },
        options: {
          name: "meetingMembers_meeting_user_unique",
          unique: true,
        },
      },
      {
        keys: { userId: 1, joinedAt: -1 },
        options: { name: "meetingMembers_user_joinedAt" },
      },
      {
        keys: { meetingId: 1, role: 1 },
        options: { name: "meetingMembers_meeting_role" },
      },
    ],
  },
  {
    name: "challenges",
    schema: {
      bsonType: "object",
      additionalProperties: false,
      required: [
        "_id",
        "meetingId",
        "authorId",
        "title",
        "description",
        "requiresImage",
        "startDate",
        "endDate",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        meetingId: {
          bsonType: "string",
          minLength: 1,
        },
        authorId: {
          bsonType: "string",
          minLength: 1,
        },
        title: {
          bsonType: "string",
          minLength: 1,
        },
        description: {
          bsonType: "string",
          minLength: 1,
        },
        requiresImage: {
          bsonType: "bool",
        },
        startDate: {
          bsonType: "string",
          pattern: DATE_ONLY_PATTERN,
        },
        endDate: {
          bsonType: "string",
          pattern: DATE_ONLY_PATTERN,
        },
        createdAt: {
          bsonType: "date",
        },
        updatedAt: {
          bsonType: "date",
        },
      },
    },
    indexes: [
      {
        keys: { meetingId: 1, startDate: 1, endDate: 1 },
        options: { name: "challenges_meeting_period" },
      },
      {
        keys: { authorId: 1, createdAt: -1 },
        options: { name: "challenges_author_createdAt" },
      },
    ],
  },
  {
    name: "challengeVerifications",
    schema: {
      bsonType: "object",
      additionalProperties: false,
      required: ["_id", "challengeId", "userId", "createdAt"],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        challengeId: {
          bsonType: "string",
          minLength: 1,
        },
        userId: {
          bsonType: "string",
          minLength: 1,
        },
        imageUrl: {
          bsonType: "string",
          minLength: 1,
        },
        createdAt: {
          bsonType: "date",
        },
      },
    },
    indexes: [
      {
        keys: { challengeId: 1, createdAt: -1 },
        options: { name: "challengeVerifications_challenge_createdAt" },
      },
      {
        keys: { userId: 1, createdAt: -1 },
        options: { name: "challengeVerifications_user_createdAt" },
      },
    ],
  },
  {
    name: "schedules",
    schema: {
      bsonType: "object",
      additionalProperties: false,
      required: [
        "_id",
        "meetingId",
        "authorId",
        "title",
        "description",
        "startDate",
        "endDate",
        "location",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        meetingId: {
          bsonType: "string",
          minLength: 1,
        },
        authorId: {
          bsonType: "string",
          minLength: 1,
        },
        title: {
          bsonType: "string",
          minLength: 1,
        },
        description: {
          bsonType: "string",
          minLength: 1,
        },
        startDate: {
          bsonType: "string",
          pattern: DATE_ONLY_PATTERN,
        },
        endDate: {
          bsonType: "string",
          pattern: DATE_ONLY_PATTERN,
        },
        location: {
          bsonType: "string",
          minLength: 1,
        },
        createdAt: {
          bsonType: "date",
        },
        updatedAt: {
          bsonType: "date",
        },
      },
    },
    indexes: [
      {
        keys: { meetingId: 1, startDate: 1, endDate: 1 },
        options: { name: "schedules_meeting_period" },
      },
      {
        keys: { authorId: 1, createdAt: -1 },
        options: { name: "schedules_author_createdAt" },
      },
    ],
  },
  {
    name: "scheduleParticipants",
    schema: {
      bsonType: "object",
      additionalProperties: false,
      required: [
        "_id",
        "scheduleId",
        "userId",
        "isParticipating",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        scheduleId: {
          bsonType: "string",
          minLength: 1,
        },
        userId: {
          bsonType: "string",
          minLength: 1,
        },
        isParticipating: {
          bsonType: "bool",
        },
        createdAt: {
          bsonType: "date",
        },
        updatedAt: {
          bsonType: "date",
        },
      },
    },
    indexes: [
      {
        keys: { scheduleId: 1, userId: 1 },
        options: {
          name: "scheduleParticipants_schedule_user_unique",
          unique: true,
        },
      },
      {
        keys: { userId: 1, updatedAt: -1 },
        options: { name: "scheduleParticipants_user_updatedAt" },
      },
    ],
  },
  {
    name: "ledgerEntries",
    schema: {
      bsonType: "object",
      additionalProperties: false,
      required: [
        "_id",
        "meetingId",
        "authorId",
        "type",
        "description",
        "amount",
        "date",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        meetingId: {
          bsonType: "string",
          minLength: 1,
        },
        authorId: {
          bsonType: "string",
          minLength: 1,
        },
        type: {
          enum: ["수입", "지출"],
        },
        description: {
          bsonType: "string",
          minLength: 1,
        },
        amount: {
          bsonType: ["int", "long", "double", "decimal"],
          minimum: 0,
        },
        date: {
          bsonType: "string",
          pattern: DATE_ONLY_PATTERN,
        },
        memo: {
          bsonType: "string",
        },
        createdAt: {
          bsonType: "date",
        },
        updatedAt: {
          bsonType: "date",
        },
      },
    },
    indexes: [
      {
        keys: { meetingId: 1, date: 1 },
        options: { name: "ledgerEntries_meeting_date" },
      },
      {
        keys: { authorId: 1, createdAt: -1 },
        options: { name: "ledgerEntries_author_createdAt" },
      },
    ],
  },
  {
    name: "notifications",
    schema: {
      bsonType: "object",
      additionalProperties: false,
      required: [
        "_id",
        "recipientUserId",
        "actorUserId",
        "meetingId",
        "type",
        "targetId",
        "isRead",
        "createdAt",
      ],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        recipientUserId: {
          bsonType: "string",
          minLength: 1,
        },
        actorUserId: {
          bsonType: "string",
          minLength: 1,
        },
        meetingId: {
          bsonType: "string",
          minLength: 1,
        },
        type: {
          enum: ["schedule_created", "challenge_created"],
        },
        targetId: {
          bsonType: "string",
          minLength: 1,
        },
        isRead: {
          bsonType: "bool",
        },
        createdAt: {
          bsonType: "date",
        },
      },
    },
    indexes: [
      {
        keys: { recipientUserId: 1, isRead: 1, createdAt: -1 },
        options: { name: "notifications_recipient_read_createdAt" },
      },
      {
        keys: { meetingId: 1, createdAt: -1 },
        options: { name: "notifications_meeting_createdAt" },
      },
    ],
  },
  {
    name: "chatMessages",
    schema: {
      bsonType: "object",
      additionalProperties: false,
      required: ["_id", "meetingId", "authorId", "content", "createdAt"],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        meetingId: {
          bsonType: "string",
          minLength: 1,
        },
        authorId: {
          bsonType: "string",
          minLength: 1,
        },
        content: {
          bsonType: "string",
          minLength: 1,
        },
        createdAt: {
          bsonType: "date",
        },
      },
    },
    indexes: [
      {
        keys: { meetingId: 1, createdAt: -1 },
        options: { name: "chatMessages_meeting_createdAt" },
      },
    ],
  },
];

async function createOrUpdateCollection(database, definition) {
  const collectionExists = await database
    .listCollections({ name: definition.name }, { nameOnly: true })
    .hasNext();

  const validationOptions = {
    validator: {
      $jsonSchema: definition.schema,
    },
    validationLevel: "strict",
    validationAction: "error",
  };

  if (collectionExists) {
    await database.command({
      collMod: definition.name,
      ...validationOptions,
    });
    console.log(`[갱신] ${definition.name} 컬렉션 검증 규칙`);
  } else {
    await database.createCollection(definition.name, validationOptions);
    console.log(`[생성] ${definition.name} 컬렉션`);
  }

  const collection = database.collection(definition.name);

  for (const index of definition.indexes) {
    await collection.createIndex(index.keys, index.options);
  }

  console.log(`[확인] ${definition.name} 컬렉션 인덱스`);
}

async function initializeDatabaseStructure() {
  const mongoUri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB_NAME;

  if (!mongoUri) {
    throw new Error("MONGODB_URI 환경 변수가 필요합니다.");
  }

  if (!databaseName) {
    throw new Error("MONGODB_DB_NAME 환경 변수가 필요합니다.");
  }

  const client = new MongoClient(mongoUri, {
    appName: "momo-database-structure",
  });

  try {
    await client.connect();
    const database = client.db(databaseName);

    for (const definition of collectionDefinitions) {
      await createOrUpdateCollection(database, definition);
    }

    console.log("데이터 삽입 없이 MongoDB 구조 초기화를 완료했습니다.");
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  initializeDatabaseStructure().catch((error) => {
    console.error("MongoDB 구조 초기화에 실패했습니다.", error);
    process.exitCode = 1;
  });
}

module.exports = {
  CATEGORY_VALUES,
  collectionDefinitions,
  createOrUpdateCollection,
  initializeDatabaseStructure,
};
