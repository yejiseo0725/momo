"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { scripts } = require("../package.json");

test("개발 및 운영 서버 시작은 데이터베이스 작업을 자동 실행하지 않는다", () => {
  assert.equal(Object.hasOwn(scripts, "predev"), false);
  assert.equal(Object.hasOwn(scripts, "prestart"), false);
  assert.equal(Object.hasOwn(scripts, "db:migrate"), false);
  assert.equal(scripts.dev, "node server.js");
  assert.equal(scripts.start, "node server.js --production");
});
