"use strict";

const { MongoClient, ObjectId } = require("mongodb");

// 컬렉션 검증 규칙을 만들 때 사용하는 데이터 구조다.
// 이 객체의 모든 값은 JSON으로 직렬화할 수 있다.
const seedDataStructure = {
  "conventions": {
    "primaryKey": "MongoDB ObjectId",
    "foreignKey": "참조 대상 ObjectId 또는 Better Auth user.id의 문자열 값",
    "dateOnly": "YYYY-MM-DD 문자열",
    "timestamp": "MongoDB Date"
  },

  "enums": {
    "gender": ["남성", "여성"],
    "category": ["운동", "공부", "공연/예술", "친목", "가족"],
    "gatheringRole": ["LEADER", "MEMBER"],
    "cashBookType": ["INCOME", "SPENDING"],
    "notificationType": ["SCHEDULE_CREATED", "CHALLENGE_CREATED"]
  },

  "collections": {
    "users": {
      "managedBy": "better-auth",
      "fields": {
        "id": {
          "type": "string",
          "required": true,
          "managedBy": "better-auth"
        },
        "name": {
          "type": "string",
          "required": true,
          "managedBy": "better-auth"
        },
        "email": {
          "type": "string",
          "format": "email",
          "required": true,
          "unique": true,
          "managedBy": "better-auth"
        },
        "emailVerified": {
          "type": "boolean",
          "required": true,
          "managedBy": "better-auth"
        },
        "image": {
          "type": "string",
          "format": "url",
          "required": false,
          "nullable": true,
          "managedBy": "better-auth"
        },
        "createdAt": {
          "type": "Date",
          "required": true,
          "managedBy": "better-auth"
        },
        "updatedAt": {
          "type": "Date",
          "required": true,
          "managedBy": "better-auth"
        },
        "gender": {
          "type": "string",
          "required": true,
          "enumRef": "gender",
          "betterAuthAdditionalField": true
        },
        "nickname": {
          "type": "string",
          "required": true,
          "betterAuthAdditionalField": true
        },
        "region": {
          "type": "string",
          "required": true,
          "betterAuthAdditionalField": true
        },
        "category": {
          "type": "string[]",
          "required": true,
          "minimumItems": 1,
          "uniqueItems": true,
          "enumRef": "category",
          "betterAuthAdditionalField": true
        }
      },
      "rules": [
        "비밀번호는 users가 아니라 Better Auth의 account 데이터에서 관리한다.",
        "Better Auth가 관리하는 기본 필드는 애플리케이션에서 직접 생성하지 않는다."
      ]
    },

    "gatherings": {
      "fields": {
        "_id": {
          "type": "ObjectId",
          "required": true,
          "generatedBy": "mongodb"
        },
        "userId": {
          "type": "string",
          "required": true,
          "references": "users.id",
          "description": "모임을 생성한 사용자"
        },
        "name": {
          "type": "string",
          "required": true
        },
        "region": {
          "type": "string",
          "required": true,
          "description": "온라인 모임은 '온라인'으로 저장"
        },
        "description": {
          "type": "string",
          "required": true
        },
        "imageUrl": {
          "type": "string",
          "format": "url",
          "required": false,
          "nullable": true
        },
        "category": {
          "type": "string",
          "required": true,
          "enumRef": "category"
        },
        "maxMemCount": {
          "type": "integer",
          "required": true,
          "minimum": 1,
          "maximum": 300
        },
        "isPublic": {
          "type": "boolean",
          "required": true
        },
        "createdAt": {
          "type": "Date",
          "required": true
        },
        "updatedAt": {
          "type": "Date",
          "required": true
        }
      },
      "rules": [
        "userId는 같은 모임의 gatheringMembers에서 LEADER인 userId와 일치해야 한다.",
        "비공개 모임은 목록에 노출하지 않고 초대 링크를 통한 접근만 허용한다."
      ]
    },

    "gatheringMembers": {
      "fields": {
        "_id": {
          "type": "ObjectId",
          "required": true,
          "generatedBy": "mongodb"
        },
        "gatheringId": {
          "type": "string",
          "required": true,
          "references": "gatherings._id"
        },
        "userId": {
          "type": "string",
          "required": true,
          "references": "users.id"
        },
        "joinDate": {
          "type": "Date",
          "required": true
        },
        "role": {
          "type": "string",
          "required": true,
          "enumRef": "gatheringRole"
        }
      },
      "rules": [
        "gatheringId와 userId의 조합은 중복될 수 없다.",
        "각 gatheringId에는 LEADER 역할이 정확히 한 명만 존재해야 한다.",
        "사용자의 내 모임 목록은 별도 중복 저장 없이 이 컬렉션에서 userId로 조회한다."
      ]
    },

    "challenges": {
      "fields": {
        "_id": {
          "type": "ObjectId",
          "required": true,
          "generatedBy": "mongodb"
        },
        "gatheringId": {
          "type": "string",
          "required": true,
          "references": "gatherings._id"
        },
        "userId": {
          "type": "string",
          "required": true,
          "references": "users.id",
          "description": "챌린지 작성자"
        },
        "title": {
          "type": "string",
          "required": true
        },
        "description": {
          "type": "string",
          "required": true
        },
        "useImage": {
          "type": "boolean",
          "required": true,
          "description": "인증 이미지 필수 여부"
        },
        "startDate": {
          "type": "string",
          "format": "YYYY-MM-DD",
          "required": true
        },
        "endDate": {
          "type": "string",
          "format": "YYYY-MM-DD",
          "required": true
        },
        "createdAt": {
          "type": "Date",
          "required": true
        },
        "updatedAt": {
          "type": "Date",
          "required": true
        }
      },
      "rules": [
        "작성자는 해당 모임의 멤버여야 한다.",
        "수정과 삭제는 작성자만 할 수 있다.",
        "endDate는 startDate보다 빠를 수 없다."
      ]
    },

    "challengeFeeds": {
      "fields": {
        "_id": {
          "type": "ObjectId",
          "required": true,
          "generatedBy": "mongodb"
        },
        "challengeId": {
          "type": "string",
          "required": true,
          "references": "challenges._id"
        },
        "userId": {
          "type": "string",
          "required": true,
          "references": "users.id",
          "description": "챌린지 인증 작성자"
        },
        "doneDate": {
          "type": "string",
          "format": "YYYY-MM-DD",
          "required": true
        },
        "imageUrl": {
          "type": "string",
          "format": "url",
          "required": false,
          "nullable": true,
          "requiredWhen": "연결된 challenge의 useImage가 true인 경우"
        },
        "description": {
          "type": "string",
          "required": true
        },
        "createdAt": {
          "type": "Date",
          "required": true
        },
        "updatedAt": {
          "type": "Date",
          "required": true
        }
      },
      "rules": [
        "작성자는 챌린지가 속한 모임의 멤버여야 한다."
      ]
    },

    "schedules": {
      "fields": {
        "_id": {
          "type": "ObjectId",
          "required": true,
          "generatedBy": "mongodb"
        },
        "gatheringId": {
          "type": "string",
          "required": true,
          "references": "gatherings._id"
        },
        "userId": {
          "type": "string",
          "required": true,
          "references": "users.id",
          "description": "일정 작성자"
        },
        "title": {
          "type": "string",
          "required": true
        },
        "description": {
          "type": "string",
          "required": true
        },
        "startDate": {
          "type": "string",
          "format": "YYYY-MM-DD",
          "required": true
        },
        "endDate": {
          "type": "string",
          "format": "YYYY-MM-DD",
          "required": true
        },
        "region": {
          "type": "string",
          "required": true,
          "description": "일정 장소"
        },
        "createdAt": {
          "type": "Date",
          "required": true
        },
        "updatedAt": {
          "type": "Date",
          "required": true
        }
      },
      "rules": [
        "작성자는 해당 모임의 멤버여야 한다.",
        "일정 생성 시 작성자를 scheduleMembers에 함께 추가한다.",
        "수정과 삭제는 작성자만 할 수 있다.",
        "endDate는 startDate보다 빠를 수 없다."
      ]
    },

    "scheduleMembers": {
      "fields": {
        "_id": {
          "type": "ObjectId",
          "required": true,
          "generatedBy": "mongodb"
        },
        "scheduleId": {
          "type": "string",
          "required": true,
          "references": "schedules._id"
        },
        "userId": {
          "type": "string",
          "required": true,
          "references": "users.id"
        }
      },
      "rules": [
        "scheduleId와 userId의 조합은 중복될 수 없다.",
        "컬렉션에 문서가 존재하면 해당 사용자가 일정에 참여하는 것으로 판단한다."
      ]
    },

    "cashBooks": {
      "fields": {
        "_id": {
          "type": "ObjectId",
          "required": true,
          "generatedBy": "mongodb"
        },
        "gatheringId": {
          "type": "string",
          "required": true,
          "references": "gatherings._id"
        },
        "userId": {
          "type": "string",
          "required": true,
          "references": "users.id",
          "description": "가계부 내역 작성자"
        },
        "amount": {
          "type": "number",
          "required": true,
          "minimum": 1
        },
        "type": {
          "type": "string",
          "required": true,
          "enumRef": "cashBookType"
        },
        "title": {
          "type": "string",
          "required": true
        },
        "date": {
          "type": "string",
          "format": "YYYY-MM-DD",
          "required": true
        },
        "memo": {
          "type": "string",
          "required": false,
          "nullable": true
        },
        "createdAt": {
          "type": "Date",
          "required": true
        },
        "updatedAt": {
          "type": "Date",
          "required": true
        }
      },
      "rules": [
        "작성자는 해당 모임의 멤버여야 한다.",
        "수정과 삭제는 작성자만 할 수 있다."
      ]
    },

    "chatRooms": {
      "fields": {
        "_id": {
          "type": "ObjectId",
          "required": true,
          "generatedBy": "mongodb"
        },
        "gatheringId": {
          "type": "string",
          "required": true,
          "unique": true,
          "references": "gatherings._id"
        },
        "createdAt": {
          "type": "Date",
          "required": true
        }
      },
      "rules": [
        "각 모임에는 채팅방이 하나만 존재한다."
      ]
    },

    "chatMessages": {
      "fields": {
        "_id": {
          "type": "ObjectId",
          "required": true,
          "generatedBy": "mongodb"
        },
        "chatRoomId": {
          "type": "string",
          "required": true,
          "references": "chatRooms._id"
        },
        "userId": {
          "type": "string",
          "required": true,
          "references": "users.id",
          "description": "메시지 작성자"
        },
        "content": {
          "type": "string",
          "required": true
        },
        "createdAt": {
          "type": "Date",
          "required": true
        }
      },
      "rules": [
        "메시지 작성자는 채팅방이 속한 모임의 멤버여야 한다."
      ]
    },

    "notifications": {
      "fields": {
        "_id": {
          "type": "ObjectId",
          "required": true,
          "generatedBy": "mongodb"
        },
        "userId": {
          "type": "string",
          "required": true,
          "references": "users.id",
          "description": "알림 수신자"
        },
        "actorUserId": {
          "type": "string",
          "required": true,
          "references": "users.id",
          "description": "알림을 발생시킨 사용자"
        },
        "gatheringId": {
          "type": "string",
          "required": true,
          "references": "gatherings._id"
        },
        "type": {
          "type": "string",
          "required": true,
          "enumRef": "notificationType"
        },
        "targetId": {
          "type": "string",
          "required": true,
          "referencesByType": {
            "SCHEDULE_CREATED": "schedules._id",
            "CHALLENGE_CREATED": "challenges._id"
          }
        },
        "message": {
          "type": "string",
          "required": true
        },
        "isRead": {
          "type": "boolean",
          "required": true,
          "defaultValue": false
        },
        "createdAt": {
          "type": "Date",
          "required": true
        }
      },
      "rules": [
        "새 일정과 새 챌린지 알림은 작성자를 제외한 모든 모임 멤버에게 생성한다.",
        "알림 목록을 조회하면 해당 사용자의 읽지 않은 알림을 읽음 처리한다."
      ]
    }
  }
};

const sampleIds = {
  studyGathering: new ObjectId("660000000000000000000001"),
  runningGathering: new ObjectId("660000000000000000000002"),
  studyChallenge: new ObjectId("660000000000000000000011"),
  studyFeed: new ObjectId("660000000000000000000021"),
  studySchedule: new ObjectId("660000000000000000000031"),
  studyCashBook: new ObjectId("660000000000000000000041"),
  studyChatRoom: new ObjectId("660000000000000000000051"),
  runningChatRoom: new ObjectId("660000000000000000000052"),
  studyMessage: new ObjectId("660000000000000000000061"),
  studyNotification: new ObjectId("660000000000000000000091"),
};

const sampleUsers = [
  {
    name: "모모 리더",
    email: "leader@momo.local",
    gender: "여성",
    nickname: "모임지기",
    region: "서울 마포구",
    category: ["공부", "친목"],
  },
  {
    name: "모모 멤버",
    email: "member@momo.local",
    gender: "남성",
    nickname: "함께해요",
    region: "서울 서대문구",
    category: ["운동", "공부"],
  },
];

const collectionIndexes = {
  gatherings: [
    { keys: { isPublic: 1, createdAt: -1 }, options: { name: "gatherings_public_createdAt" } },
    { keys: { category: 1, isPublic: 1, createdAt: -1 }, options: { name: "gatherings_category_public_createdAt" } },
    { keys: { userId: 1, createdAt: -1 }, options: { name: "gatherings_user_createdAt" } },
  ],
  gatheringMembers: [
    { keys: { gatheringId: 1, userId: 1 }, options: { name: "gatheringMembers_gathering_user_unique", unique: true } },
    { keys: { userId: 1, joinDate: -1 }, options: { name: "gatheringMembers_user_joinDate" } },
    { keys: { gatheringId: 1, role: 1 }, options: { name: "gatheringMembers_gathering_role" } },
  ],
  challenges: [
    { keys: { gatheringId: 1, startDate: 1, endDate: 1 }, options: { name: "challenges_gathering_period" } },
    { keys: { userId: 1, createdAt: -1 }, options: { name: "challenges_user_createdAt" } },
  ],
  challengeFeeds: [
    { keys: { challengeId: 1, doneDate: -1 }, options: { name: "challengeFeeds_challenge_doneDate" } },
    { keys: { userId: 1, createdAt: -1 }, options: { name: "challengeFeeds_user_createdAt" } },
  ],
  schedules: [
    { keys: { gatheringId: 1, startDate: 1, endDate: 1 }, options: { name: "schedules_gathering_period" } },
    { keys: { userId: 1, createdAt: -1 }, options: { name: "schedules_user_createdAt" } },
  ],
  scheduleMembers: [
    { keys: { scheduleId: 1, userId: 1 }, options: { name: "scheduleMembers_schedule_user_unique", unique: true } },
    { keys: { userId: 1 }, options: { name: "scheduleMembers_user" } },
  ],
  cashBooks: [
    { keys: { gatheringId: 1, date: -1 }, options: { name: "cashBooks_gathering_date" } },
    { keys: { userId: 1, createdAt: -1 }, options: { name: "cashBooks_user_createdAt" } },
  ],
  chatRooms: [
    { keys: { gatheringId: 1 }, options: { name: "chatRooms_gathering_unique", unique: true } },
  ],
  chatMessages: [
    { keys: { chatRoomId: 1, createdAt: -1 }, options: { name: "chatMessages_room_createdAt" } },
  ],
  notifications: [
    { keys: { userId: 1, isRead: 1, createdAt: -1 }, options: { name: "notifications_user_read_createdAt" } },
    { keys: { gatheringId: 1, createdAt: -1 }, options: { name: "notifications_gathering_createdAt" } },
  ],
};

function getBsonType(field) {
  const typeMap = {
    ObjectId: "objectId",
    string: "string",
    "string[]": "array",
    integer: ["int", "long", "double", "decimal"],
    number: ["int", "long", "double", "decimal"],
    boolean: "bool",
    Date: "date",
  };
  const bsonType = typeMap[field.type];

  if (!bsonType) {
    throw new Error(`지원하지 않는 seed 필드 타입입니다: ${field.type}`);
  }

  if (!field.nullable) {
    return bsonType;
  }

  return Array.isArray(bsonType) ? [...bsonType, "null"] : [bsonType, "null"];
}

function buildFieldSchema(field) {
  const schema = {
    bsonType: getBsonType(field),
  };

  if (field.type === "string" && !field.nullable) {
    schema.minLength = 1;
  }

  if (field.type === "string[]") {
    schema.items = { bsonType: "string" };
    if (field.minimumItems) {
      schema.minItems = field.minimumItems;
    }
    if (field.uniqueItems) {
      schema.uniqueItems = true;
    }
    if (field.enumRef) {
      schema.items.enum = seedDataStructure.enums[field.enumRef];
    }
  }

  if (field.enumRef && field.type !== "string[]") {
    schema.enum = seedDataStructure.enums[field.enumRef];
  }

  if (field.format === "YYYY-MM-DD") {
    schema.pattern = "^\\d{4}-\\d{2}-\\d{2}$";
  }

  if (typeof field.minimum === "number") {
    schema.minimum = field.minimum;
  }

  if (typeof field.maximum === "number") {
    schema.maximum = field.maximum;
  }

  if (field.type === "integer") {
    schema.multipleOf = 1;
  }

  return schema;
}

function buildCollectionJsonSchema(collectionName) {
  const collection = seedDataStructure.collections[collectionName];

  if (!collection || collection.managedBy) {
    throw new Error(`${collectionName}은(는) 애플리케이션이 초기화할 컬렉션이 아닙니다.`);
  }

  const required = [];
  const properties = {};

  for (const [fieldName, field] of Object.entries(collection.fields)) {
    properties[fieldName] = buildFieldSchema(field);
    if (field.required) {
      required.push(fieldName);
    }
  }

  return {
    bsonType: "object",
    additionalProperties: false,
    required,
    properties,
  };
}

async function createOrUpdateCollection(database, collectionName) {
  const jsonSchema = buildCollectionJsonSchema(collectionName);
  const exists = await database
    .listCollections({ name: collectionName }, { nameOnly: true })
    .hasNext();
  const validationOptions = {
    validator: { $jsonSchema: jsonSchema },
    validationLevel: "strict",
    validationAction: "error",
  };

  if (exists) {
    await database.command({
      collMod: collectionName,
      ...validationOptions,
    });
    console.log(`[갱신] ${collectionName} 검증 규칙`);
  } else {
    await database.createCollection(collectionName, validationOptions);
    console.log(`[생성] ${collectionName}`);
  }

  const collection = database.collection(collectionName);
  for (const index of collectionIndexes[collectionName] || []) {
    await collection.createIndex(index.keys, index.options);
  }
  console.log(`[확인] ${collectionName} 인덱스`);
}

function createSeedAuth(database, client) {
  const { mongodbAdapter } = require("@better-auth/mongo-adapter");
  const { betterAuth } = require("better-auth");

  return betterAuth({
    appName: "momo",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret:
      process.env.BETTER_AUTH_SECRET ||
      "momo-local-development-secret-change-before-deploy",
    database: mongodbAdapter(database, {
      client,
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    user: {
      modelName: "users",
      additionalFields: {
        gender: {
          type: ["남성", "여성"],
          required: true,
          input: true,
        },
        nickname: {
          type: "string",
          required: true,
          input: true,
        },
        region: {
          type: "string",
          required: true,
          input: true,
        },
        category: {
          type: "string[]",
          required: true,
          input: true,
        },
      },
    },
    session: {
      modelName: "sessions",
    },
    account: {
      modelName: "accounts",
    },
    verification: {
      modelName: "verifications",
    },
    advanced: {
      database: {
        joins: true,
      },
    },
  });
}

async function createOrUpdateSeedUser(database, auth, user, password) {
  const existingUser = await database.collection("users").findOne({
    email: user.email,
  });

  if (existingUser) {
    await database.collection("users").updateOne(
      { _id: existingUser._id },
      {
        $set: {
          name: user.name,
          gender: user.gender,
          nickname: user.nickname,
          region: user.region,
          category: user.category,
          updatedAt: new Date(),
        },
      },
    );
    return existingUser._id.toString();
  }

  const result = await auth.api.signUpEmail({
    body: {
      ...user,
      password,
    },
  });

  return result.user.id;
}

async function replaceSeedDocuments(database, collectionName, documents) {
  for (const document of documents) {
    await database.collection(collectionName).replaceOne(
      { _id: document._id },
      document,
      { upsert: true },
    );
  }
}

async function upsertGatheringMember(database, membership) {
  await database.collection("gatheringMembers").updateOne(
    {
      gatheringId: membership.gatheringId,
      userId: membership.userId,
    },
    {
      $set: {
        joinDate: membership.joinDate,
        role: membership.role,
      },
    },
    { upsert: true },
  );
}

async function upsertScheduleMember(database, membership) {
  await database.collection("scheduleMembers").updateOne(
    {
      scheduleId: membership.scheduleId,
      userId: membership.userId,
    },
    { $setOnInsert: membership },
    { upsert: true },
  );
}

async function getOrCreateSeedChatRoom(database, roomId, gatheringId, createdAt) {
  await database.collection("chatRooms").updateOne(
    { gatheringId },
    {
      $set: { createdAt },
      $setOnInsert: {
        _id: roomId,
        gatheringId,
      },
    },
    { upsert: true },
  );

  return database.collection("chatRooms").findOne({ gatheringId });
}

async function seedExampleData(database, client) {
  const auth = createSeedAuth(database, client);
  const password = process.env.SEED_USER_PASSWORD || "momo1234!";
  const [leaderId, memberId] = await Promise.all(
    sampleUsers.map((user) => createOrUpdateSeedUser(database, auth, user, password)),
  );
  const now = new Date("2026-09-16T00:00:00.000Z");
  const studyGatheringId = sampleIds.studyGathering.toString();
  const runningGatheringId = sampleIds.runningGathering.toString();

  await replaceSeedDocuments(database, "gatherings", [
    {
      _id: sampleIds.studyGathering,
      userId: leaderId,
      name: "주말 함께 읽기",
      region: "서울 마포구",
      description: "주말마다 한 권의 책을 정하고 편하게 이야기를 나눕니다.",
      imageUrl: null,
      category: "공부",
      maxMemCount: 12,
      isPublic: true,
      createdAt: new Date("2026-09-01T09:00:00.000Z"),
      updatedAt: now,
    },
    {
      _id: sampleIds.runningGathering,
      userId: memberId,
      name: "퇴근 후 가볍게 달리기",
      region: "서울 서대문구",
      description: "기록보다 꾸준함을 목표로 천천히 달리는 모임입니다.",
      imageUrl: null,
      category: "운동",
      maxMemCount: 20,
      isPublic: true,
      createdAt: new Date("2026-09-05T09:00:00.000Z"),
      updatedAt: now,
    },
  ]);

  const gatheringMembers = [
    {
      gatheringId: studyGatheringId,
      userId: leaderId,
      joinDate: new Date("2026-09-01T09:00:00.000Z"),
      role: "LEADER",
    },
    {
      gatheringId: studyGatheringId,
      userId: memberId,
      joinDate: new Date("2026-09-02T09:00:00.000Z"),
      role: "MEMBER",
    },
    {
      gatheringId: runningGatheringId,
      userId: memberId,
      joinDate: new Date("2026-09-05T09:00:00.000Z"),
      role: "LEADER",
    },
  ];

  for (const membership of gatheringMembers) {
    await upsertGatheringMember(database, membership);
  }

  await replaceSeedDocuments(database, "challenges", [
    {
      _id: sampleIds.studyChallenge,
      gatheringId: studyGatheringId,
      userId: memberId,
      title: "매일 20쪽 읽기",
      description: "분량보다 매일 책을 펼치는 습관을 만듭니다.",
      useImage: false,
      startDate: "2026-09-16",
      endDate: "2026-09-30",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await replaceSeedDocuments(database, "challengeFeeds", [
    {
      _id: sampleIds.studyFeed,
      challengeId: sampleIds.studyChallenge.toString(),
      userId: memberId,
      doneDate: "2026-09-16",
      imageUrl: null,
      description: "첫날 읽기를 마쳤어요.",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await replaceSeedDocuments(database, "schedules", [
    {
      _id: sampleIds.studySchedule,
      gatheringId: studyGatheringId,
      userId: leaderId,
      title: "9월 독서 모임",
      description: "읽은 부분을 바탕으로 자유롭게 대화합니다.",
      startDate: "2026-09-26",
      endDate: "2026-09-26",
      region: "망원동 작은도서관",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  for (const userId of [leaderId, memberId]) {
    await upsertScheduleMember(database, {
      scheduleId: sampleIds.studySchedule.toString(),
      userId,
    });
  }

  await replaceSeedDocuments(database, "cashBooks", [
    {
      _id: sampleIds.studyCashBook,
      gatheringId: studyGatheringId,
      userId: leaderId,
      amount: 24000,
      type: "SPENDING",
      title: "모임 공간 대여",
      date: "2026-09-26",
      memo: "두 시간 이용",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const studyChatRoom = await getOrCreateSeedChatRoom(
    database,
    sampleIds.studyChatRoom,
    studyGatheringId,
    now,
  );
  await getOrCreateSeedChatRoom(
    database,
    sampleIds.runningChatRoom,
    runningGatheringId,
    now,
  );

  await replaceSeedDocuments(database, "chatMessages", [
    {
      _id: sampleIds.studyMessage,
      chatRoomId: studyChatRoom._id.toString(),
      userId: leaderId,
      content: "이번 주도 편하게 읽고 만나요!",
      createdAt: now,
    },
  ]);

  await database.collection("notifications").deleteMany({
    userId: memberId,
    gatheringId: studyGatheringId,
    type: "SCHEDULE_CREATED",
    targetId: sampleIds.studySchedule.toString(),
  });
  await replaceSeedDocuments(database, "notifications", [
    {
      _id: sampleIds.studyNotification,
      userId: memberId,
      actorUserId: leaderId,
      gatheringId: studyGatheringId,
      type: "SCHEDULE_CREATED",
      targetId: sampleIds.studySchedule.toString(),
      message: "새 일정 ‘9월 독서 모임’이 등록되었습니다.",
      isRead: false,
      createdAt: now,
    },
  ]);

  return { leaderId, memberId, password };
}

async function initializeDatabaseStructure() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const databaseName = process.env.MONGODB_DB_NAME || "momo";
  const client = new MongoClient(mongoUri, {
    appName: "momo-seed",
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    const database = client.db(databaseName);
    const applicationCollections = Object.entries(seedDataStructure.collections)
      .filter(([, definition]) => !definition.managedBy)
      .map(([collectionName]) => collectionName);

    for (const collectionName of applicationCollections) {
      await createOrUpdateCollection(database, collectionName);
    }

    const result = await seedExampleData(database, client);
    console.log("momo 초기 컬렉션과 예시 데이터 구성을 완료했습니다.");
    console.log(`리더 계정: leader@momo.local / ${result.password}`);
    console.log(`멤버 계정: member@momo.local / ${result.password}`);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  initializeDatabaseStructure().catch((error) => {
    console.error("MongoDB 초기 구성에 실패했습니다.", error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  buildCollectionJsonSchema,
  collectionIndexes,
  createOrUpdateCollection,
  initializeDatabaseStructure,
  sampleIds,
  sampleUsers,
  seedExampleData,
  seedDataStructure,
};
