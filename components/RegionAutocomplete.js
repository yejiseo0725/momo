"use client";

import {
  Description,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { useRef, useState } from "react";

const onlineRegion = {
  code: "ONLINE",
  name: "온라인",
};

let cachedLegalDongs = null;
let legalDongsRequest = null;

function createRegionName(region) {
  return [region.sido, region.sigungu, region.eupMyeonDong]
    .filter(Boolean)
    .join(" ");
}

function normalizeSearchText(value) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}

function normalizeInitialRegionCode(value) {
  if (value === onlineRegion.code || /^\d{10}$/.test(value)) {
    return value;
  }

  return "";
}

async function loadLegalDongs() {
  if (cachedLegalDongs) {
    return cachedLegalDongs;
  }

  if (!legalDongsRequest) {
    legalDongsRequest = fetch("/data/legal-dongs.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("법정동 목록 요청에 실패했습니다.");
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data.regions)) {
          throw new Error("법정동 목록 형식이 올바르지 않습니다.");
        }

        cachedLegalDongs = data.regions.map((region) => ({
          code: region.code,
          name: createRegionName(region),
        }));
        return cachedLegalDongs;
      })
      .catch((error) => {
        legalDongsRequest = null;
        throw error;
      });
  }

  return legalDongsRequest;
}

function findRegionCode(regions, value) {
  const normalizedValue = normalizeSearchText(value);

  if (
    normalizedValue === onlineRegion.name
    || normalizedValue === onlineRegion.code.toLowerCase()
  ) {
    return onlineRegion.code;
  }

  return regions.find((region) => (
    normalizeSearchText(region.name) === normalizedValue
  ))?.code || "";
}

function findSuggestions(regions, value) {
  const normalizedValue = normalizeSearchText(value);

  if (!normalizedValue) {
    return [onlineRegion];
  }

  const keywordParts = normalizedValue.split(" ");
  const suggestions = regions
    .filter((region) => {
      const normalizedName = normalizeSearchText(region.name);
      return keywordParts.every((keywordPart) => normalizedName.includes(keywordPart));
    })
    .slice(0, 15);

  if (
    onlineRegion.name.includes(normalizedValue)
    || onlineRegion.code.toLowerCase().includes(normalizedValue)
  ) {
    return [onlineRegion, ...suggestions];
  }

  return suggestions;
}

export default function RegionAutocomplete({
  helpText,
  id = "region",
  initialRegionCode = "",
  initialRegionName = "",
}) {
  const [query, setQuery] = useState(initialRegionName);
  const [regionCode, setRegionCode] = useState(
    normalizeInitialRegionCode(initialRegionCode),
  );
  const [suggestions, setSuggestions] = useState([]);
  const [loadError, setLoadError] = useState("");
  const latestQuery = useRef(initialRegionName);
  const dataListId = `${id}-legal-dongs`;
  const helpId = `${id}-help`;

  async function updateSuggestions(value) {
    latestQuery.current = value;
    setLoadError("");

    try {
      const regions = await loadLegalDongs();

      if (latestQuery.current !== value) {
        return;
      }

      setSuggestions(findSuggestions(regions, value));
      setRegionCode(findRegionCode(regions, value));
    } catch {
      if (latestQuery.current === value) {
        setSuggestions([]);
        setLoadError("법정동 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    }
  }

  function handleChange(event) {
    const nextQuery = event.target.value;
    const loadedRegions = cachedLegalDongs || [];

    setQuery(nextQuery);
    setRegionCode(findRegionCode(loadedRegions, nextQuery));
    void updateSuggestions(nextQuery);
  }

  return (
    <>
      <input type="hidden" name="region" value={regionCode} />
      <TextField fullWidth isInvalid={Boolean(query && !regionCode)} isRequired>
        <Label>지역</Label>
        <Input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={dataListId}
          aria-describedby={helpId}
          aria-expanded={suggestions.length > 0}
          autoComplete="off"
          list={dataListId}
          maxLength="100"
          placeholder="읍면동 입력"
          value={query}
          onChange={handleChange}
          onFocus={() => void updateSuggestions(query)}
        />
        <datalist id={dataListId}>
          {suggestions.map((region) => (
            <option key={region.code} value={region.name} />
          ))}
        </datalist>
        <Description id={helpId}>
          {helpText || "읍면동을 입력하고 자동완성 목록에서 선택해 주세요."}
        </Description>
        {loadError ? <FieldError>{loadError}</FieldError> : null}
      </TextField>
    </>
  );
}
