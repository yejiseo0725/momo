"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const legalDongData = require("../public/data/legal-dongs.json");
const { normalizeStoredRegion } = require("../scripts/seeds.js");
const { buildLegalDongs, parseCsvLine } = require("../scripts/update-legal-dongs.js");

test("공식 법정동 목록은 중복 없는 10자리 읍면동 코드로 저장된다", () => {
  const codes = new Set();

  assert.ok(legalDongData.regions.length > 5000);

  for (const region of legalDongData.regions) {
    assert.match(region.code, /^\d{10}$/);
    assert.ok(region.sido);
    assert.ok(region.eupMyeonDong);
    assert.equal(codes.has(region.code), false);
    codes.add(region.code);
  }

  assert.ok(codes.has("1144012300"));
  assert.ok(codes.has("1141011700"));
});

test("법정동 원본에서는 리와 상위 시군구를 제외하고 읍면동만 만든다", () => {
  const csv = [
    "법정동코드,시도명,시군구명,읍면동명,리명,순번,생성일자",
    "1100000000,서울특별시,,,,1,1988-04-23",
    "1144012300,서울특별시,마포구,망원동,,1,1988-04-23",
    "4272031021,강원특별자치도,홍천군,화촌면,구성포리,1,1988-04-23",
  ].join("\n");

  assert.deepEqual(buildLegalDongs(csv), [
    {
      code: "1144012300",
      sido: "서울특별시",
      sigungu: "마포구",
      eupMyeonDong: "망원동",
    },
  ]);
});

test("CSV의 따옴표와 쉼표를 올바르게 읽는다", () => {
  assert.deepEqual(
    parseCsvLine('1111010100,서울특별시,종로구,"청운,동",""'),
    ["1111010100", "서울특별시", "종로구", "청운,동", ""],
  );
});

test("기존 온라인과 정확한 전체 지역명만 안전하게 코드로 변환한다", () => {
  assert.equal(normalizeStoredRegion("온라인"), "ONLINE");
  assert.equal(normalizeStoredRegion("online"), "ONLINE");
  assert.equal(normalizeStoredRegion("서울특별시 마포구 망원동"), "1144012300");
  assert.equal(normalizeStoredRegion("서울 마포구"), "");
});
