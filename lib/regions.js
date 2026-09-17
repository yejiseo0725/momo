import legalDongData from "@/public/data/legal-dongs.json";

export const ONLINE_REGION_CODE = "ONLINE";
export const ONLINE_REGION_NAME = "온라인";

function createLegalDongName(region) {
  return [region.sido, region.sigungu, region.eupMyeonDong]
    .filter(Boolean)
    .join(" ");
}

function normalizeRegionName(value) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}

const regionNameByCode = new Map(
  legalDongData.regions.map((region) => [region.code, createLegalDongName(region)]),
);
const sigunguNameByCode = new Map(
  legalDongData.regions.map((region) => [
    region.code.slice(0, 5),
    [region.sido, region.sigungu].filter(Boolean).join(" "),
  ]),
);
const regionCodeByName = new Map(
  legalDongData.regions.map((region) => [
    normalizeRegionName(createLegalDongName(region)),
    region.code,
  ]),
);

export function getRegionName(regionCode) {
  if (regionCode === ONLINE_REGION_CODE) {
    return ONLINE_REGION_NAME;
  }

  return regionNameByCode.get(regionCode) || regionCode || "지역 미설정";
}

export function getSigunguName(regionCode) {
  if (typeof regionCode !== "string" || !/^\d{10}$/.test(regionCode)) {
    return "";
  }

  return sigunguNameByCode.get(regionCode.slice(0, 5)) || "";
}

export function normalizeRegionCode(value) {
  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();

  if (
    normalizedValue.toUpperCase() === ONLINE_REGION_CODE
    || normalizedValue === ONLINE_REGION_NAME
  ) {
    return ONLINE_REGION_CODE;
  }

  if (regionNameByCode.has(normalizedValue)) {
    return normalizedValue;
  }

  return regionCodeByName.get(normalizeRegionName(normalizedValue)) || "";
}

export function getRegionCodesByKeyword(keyword) {
  if (typeof keyword !== "string" || !keyword.trim()) {
    return [];
  }

  const normalizedKeyword = normalizeRegionName(keyword);
  const keywordParts = normalizedKeyword.split(" ");
  const matchedCodes = legalDongData.regions
    .filter((region) => {
      const name = normalizeRegionName(createLegalDongName(region));
      return keywordParts.every((keywordPart) => name.includes(keywordPart));
    })
    .map((region) => region.code);

  if (
    ONLINE_REGION_NAME.includes(normalizedKeyword)
    || ONLINE_REGION_CODE.toLowerCase().includes(normalizedKeyword)
  ) {
    matchedCodes.push(ONLINE_REGION_CODE);
  }

  return matchedCodes;
}
