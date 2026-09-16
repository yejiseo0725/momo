import assert from "node:assert/strict";
import test from "node:test";
import { escapeRegularExpression } from "../lib/utils/search.js";

test("검색어의 정규식 특수 문자를 문자 그대로 처리한다", () => {
  const pattern = new RegExp(escapeRegularExpression("모임(서울)+"), "i");
  assert.equal(pattern.test("모임(서울)+에서 만나요"), true);
  assert.equal(pattern.test("모임서울에서 만나요"), false);
});
