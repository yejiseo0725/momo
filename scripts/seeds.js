"use strict";

// 실제 시드 데이터가 아니라 컬렉션별 데이터 구조만 정의한다.
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

module.exports = {
  seedDataStructure,
};
