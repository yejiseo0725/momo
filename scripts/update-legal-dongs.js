"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const sourcePageUrl = "https://www.data.go.kr/data/15063424/fileData.do";
const outputPath = path.join(__dirname, "..", "public", "data", "legal-dongs.json");

function parseCsvLine(line) {
  const values = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        currentValue += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === "," && !insideQuotes) {
      values.push(currentValue);
      currentValue = "";
    } else {
      currentValue += character;
    }
  }

  values.push(currentValue);
  return values;
}

function parseCsv(csvText) {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  const headers = parseCsvLine(lines.shift());

  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] || ""]),
    );
  });
}

function buildLegalDongs(csvText) {
  const regions = parseCsv(csvText)
    .filter((row) => row.읍면동명.trim() && !row.리명.trim())
    .map((row) => ({
      code: row.법정동코드.trim(),
      sido: row.시도명.trim(),
      sigungu: row.시군구명.trim(),
      eupMyeonDong: row.읍면동명.trim(),
    }))
    .sort((left, right) => left.code.localeCompare(right.code));
  const codes = new Set();

  for (const region of regions) {
    if (!/^\d{10}$/.test(region.code)) {
      throw new Error(`올바르지 않은 법정동 코드가 있습니다: ${region.code}`);
    }
    if (!region.sido || !region.eupMyeonDong) {
      throw new Error(`필수 지역명이 없는 법정동이 있습니다: ${region.code}`);
    }
    if (codes.has(region.code)) {
      throw new Error(`중복된 법정동 코드가 있습니다: ${region.code}`);
    }

    codes.add(region.code);
  }

  return regions;
}

async function fetchCurrentCsv() {
  const sourcePageResponse = await fetch(sourcePageUrl);

  if (!sourcePageResponse.ok) {
    throw new Error(`공공데이터포털 페이지를 불러오지 못했습니다: ${sourcePageResponse.status}`);
  }

  const sourcePage = await sourcePageResponse.text();
  const downloadUrlMatch = sourcePage.match(/"contentUrl"\s*:\s*"([^"]+)"/);

  if (!downloadUrlMatch) {
    throw new Error("공공데이터포털에서 법정동 CSV 다운로드 주소를 찾지 못했습니다.");
  }

  const downloadUrl = downloadUrlMatch[1].replaceAll("&amp;", "&");
  const csvResponse = await fetch(downloadUrl);

  if (!csvResponse.ok) {
    throw new Error(`법정동 CSV를 내려받지 못했습니다: ${csvResponse.status}`);
  }

  return {
    csvText: await csvResponse.text(),
    downloadUrl,
  };
}

async function updateLegalDongs() {
  const sourceFileIndex = process.argv.indexOf("--source-file");
  const sourceFilePath = sourceFileIndex >= 0 ? process.argv[sourceFileIndex + 1] : "";
  let csvText;
  let downloadUrl;

  if (sourceFilePath) {
    csvText = await fs.readFile(path.resolve(sourceFilePath), "utf8");
    downloadUrl = "공공데이터포털에서 내려받은 로컬 CSV";
  } else {
    ({ csvText, downloadUrl } = await fetchCurrentCsv());
  }

  const regions = buildLegalDongs(csvText);
  const data = {
    source: {
      name: "국토교통부_전국 법정동",
      pageUrl: sourcePageUrl,
      downloadUrl,
      retrievedAt: new Date().toISOString().slice(0, 10),
      filter: "현존 데이터 중 읍면동명이 있고 리명이 비어 있는 법정동",
    },
    regions,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`법정동 읍면동 ${regions.length}개를 ${outputPath}에 저장했습니다.`);
}

if (require.main === module) {
  updateLegalDongs().catch((error) => {
    console.error("법정동 데이터를 갱신하지 못했습니다.", error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  buildLegalDongs,
  parseCsv,
  parseCsvLine,
  updateLegalDongs,
};
