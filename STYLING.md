# momo 스타일링 및 디자인 시스템 가이드 (STYLING.md)

이 문서는 momo 프로젝트의 일관된 UI/UX 구축을 위한 규격입니다. 모든 UI 개발 및 컴포넌트 수정 시 이 규칙을 엄격히 준수해야 합니다.

---

## 1. 타이포그래피 (Typography)

### 1-1. 기본 서체
- **기본 서체**: `Pretendard Variable`, `Pretendard`
- **Fallback**: `-apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`
- **적용 방식**: `app/layout.js` `<head>`에 CDN 링크, `body`에 `font-sans`, `app/globals.css`의 `@theme`에 `--font-sans` 등록

### 1-2. 폰트 사이즈 3단계 ✳️ (엄격 준수)

임의의 `text-xs`, `text-2xl`, `text-3xl`, `text-4xl` 등 **아래 3단계 이외의 크기는 사용 금지**합니다.

| 단계 | Tailwind 클래스 | 실제 크기 | 사용 위치 |
| :--- | :--- | :--- | :--- |
| **sm** | `text-sm` | 14px | 칩·태그 내부, 보조 설명, muted 텍스트 |
| **base** (기본) | (명시 불필요) | 16px | 본문, 섹션 레이블, 폼 필드, 일반 텍스트 |
| **lg** | `text-lg` | 20px | 페이지 제목(h1~h3), 카드 제목, 강조 제목 |

> `Typography type="h1/h2/h3"` 컴포넌트는 `globals.css`에서 이미 `text-lg`(20px)로 고정되어 있습니다.
> 별도의 크기 클래스를 다시 지정하지 마세요.

### 1-3. 폰트 굵기 3단계 ✳️ (엄격 준수)

| 단계 | Tailwind 클래스 | 용도 |
| :--- | :--- | :--- |
| **normal** | `font-normal` 또는 생략 | 본문, 일반 설명 |
| **medium** | `font-medium` | 라벨, 섹션 소제목, 강조 보조 텍스트 |
| **bold** | `font-bold` | 페이지 제목, 카드 제목, 주요 강조 |

> `font-semibold`는 **칩 내부에서만** 예외적으로 허용합니다. 그 외에는 사용 금지.

---

## 2. 간격 체계 (Spacing: `gap-*`, `p-*`, `mt-*`) ✳️

### 2-1. Gap/Padding 3단계

임의의 간격 사용을 금지합니다. 아래 3단계 기준 안에서만 선택합니다.

| 단계 | 값 | 사용 위치 |
| :--- | :--- | :--- |
| **소(Small)** | `gap-2` / `p-2` | 인라인 요소 (칩 목록, 버튼 그룹, 아이콘+텍스트 인라인 배치) |
| **중(Medium)** | `gap-4` / `p-4` | 섹션 내부, 카드 본문 패딩, 폼 필드 간격, 그리드 간격 |
| **대(Large)** | `gap-8` / `p-8` | 페이지 최상위 섹션 간 간격 (`<main>` 내부) |

> 예외적으로 `gap-3`(카드 본문 내부 미세 간격)은 허용하나 남용 금지.
> `p-0`, `px-4 py-3` 등 컨테이너 고정 레이아웃 패딩은 이 규칙과 별개로 `layout.js`에서만 정의.

### 2-2. Margin 원칙

- **사용 원칙**: 마진 대신 부모의 `gap-*`을 사용합니다.
- **허용 예외**: `mt-auto`(flex 내 바닥 고정), `-mt-8`(카드 타이틀 오버랩) 등 레이아웃 목적으로만 제한 허용.
- **금지**: 임의의 `mt-3`, `mb-5`, `ml-2` 등 미세 조정 마진 사용 금지.

---

## 3. 레이아웃 & 컨테이너 (Layout)

- **전역 최대 너비**: `max-w-5xl` 또는 `max-w-3xl`
  - 헤더: `<div className="mx-auto w-full max-w-5xl px-4 py-3">`
  - 본문: `<main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">`
  - 푸터: `<div className="mx-auto w-full max-w-5xl px-4 py-6">`
- **폼 전용 페이지 및 폼 최대 너비 (중요)**:
  - 로그인, 회원가입, 모임 생성·수정 등 **전체적으로 폼(Form) 위주로 구성된 페이지**는 콘텐츠가 지나치게 넓어지지 않도록 반드시 `mx-auto w-full max-w-md` (448px, md) 크기로 가운데 정렬합니다.
  - 내부 `<Form>` 요소 역시 `w-full max-w-md`을 유지합니다.

---

## 4. 모서리 곡률 (Border Radius Tokens)

| 토큰 | 값 | 적용 컴포넌트 |
| :--- | :--- | :--- |
| `--radius-small` | 12px | ~~Chip (현재 Pill로 변경)~~ |
| `--radius-medium` | 20px | `Button`, `Input`, 폼 필드 |
| `--radius-large` | 28px | `Card`, `Alert`, `Modal`, 이미지 |
| **Pill (Chip 전용)** | `9999px` | `Chip` — 완전 둥근 Pill 형태 |

---

## 5. 컬러 시스템 (Point Colors)

- **`primary` (`#2997FF`)**: 주요 액션 버튼, 링크, 공개 칩 텍스트
- **`accent.sky` (`#E8F4FD`)**: 칩·태그 배경 (가볍고 부드러운 정보 뱃지)
- **`accent.pink` (`#FF5C93`)**: 모임장 배지, 핫핑크 포인트
- **`warning` (`#FF6F3C`)**: 마감 칩, 개설자 왕관 아이콘, 경고 알림

---

## 6. 칩(Chip) 규격

- **형태**: 완전 Pill (`border-radius: 9999px`) — `rounded-full`에 해당
- **크기**: 무조건 `size="md"` 이상 사용 (`size="sm"` 사용 금지)
- **패딩 (기본/md)**: `padding-inline: 0.75rem`, `padding-block: 0.3125rem`
- **폰트**: `text-sm`(14px), `font-medium` 또는 `font-semibold`
- **색상 조합**:
  - 공개/카테고리: `bg-accent-sky text-primary`
  - 마감: `bg-warning text-warning-foreground`
  - 모임장: `bg-accent-pink text-white font-semibold`

---

## 7. 모임 카드 (`GatheringCard`) 디자인 규칙

- **이미지**: `overflow-hidden p-0`로 카드 상단 Edge-to-Edge 꽉 채움
- **상단 칩**: 이미지 위 `absolute top-3 right-3`, `gap-2`로 배치
- **하단 그라데이션**: `h-28 bg-gradient-to-t from-surface via-surface/80 to-transparent`
- **제목 오버랩**: 카드 본문에 `-mt-8 z-10`으로 이미지 위 자연스럽게 올라탐, `font-bold` 적용
- **개설자 표시**: `BrightCrownIcon` (`text-warning size-4`) + 이름 (`font-medium text-foreground/80`)
- **본문 구조**: `gap-3 px-4 pb-4`
