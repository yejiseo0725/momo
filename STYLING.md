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
| **xs** | `text-xs` | 12px (0.75rem) | **모든 캡션/설명(`Description`)**, 부가 안내 문구 |
| **sm** | `text-sm` | 14px (0.875rem) | **모든 라벨(`Label`)**, 칩·태그 내부, muted 텍스트, 버튼 |
| **base** (기본) | (명시 불필요) | 16px (1rem) | 본문, 폼 필드 입력값, 일반 텍스트 |
| **lg** | `text-lg` | 20px (1.25rem) | 페이지 제목(h1~h3), 카드 제목, 강조 제목 |

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
  - 내 정보 수정(`/profile/edit`) 페이지는 `mx-auto w-full max-w-lg` (512px, lg) 크기로 가운데 정렬하며 내부 `<Form>`도 `max-w-lg`를 유지합니다.
  - 내부 `<Form>` 요소 역시 부모 컨테이너의 최대 너비 규격(`max-w-md` 또는 `max-w-lg`)을 유지합니다.

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

- **`primary` (`#2997FF`)**: 주요 액션 버튼, 링크, 이미지 인증 칩 배경
- **`secondary` (`#FFF0E8` / `#C94F2C`)**: 따뜻한 살구/코랄 보조 컬러
- **`tertiary` (`#EAFAF1` / `#1E874B`)**: 텍스트 인증 등 차분하고 산뜻한 그린 컬러
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
  - 이미지 인증: `bg-primary text-white font-semibold`
  - 텍스트 인증: `bg-tertiary text-tertiary-foreground font-semibold`
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

---

## 8. 버튼(Button) 규격 ✳️ (단일 표준 통합)

모든 버튼(HeroUI `<Button>` 컴포넌트 및 `<Link className="button ...">` 링크 버튼)은 단일 통합 규격을 따릅니다.

### 8-1. 표준 규격
- **높이**: `h-10` (40px)
- **좌우 패딩**: `px-5` (1.25rem = 20px) — 20px 패딩으로 통일
- **모서리 곡률 (Border Radius)**: `--radius-medium` (20px, `rounded-[20px]`)
- **타이포그래피**: `text-sm font-medium` (14px, medium)
- **아이콘 버튼 예외**: `isIconOnly` / `button--icon-only` 적용 시 패딩 0 (`p-0 w-10 h-10`)

### 8-2. 색상 변형 (Variants)
- **`primary`** (`button--primary` / `variant="primary"`): 주요 액션 (파란색 배경 `bg-primary text-white`)
- **`outline`** (`button--outline` / `variant="outline"`): 보조 액션 (테두리 `border border-border text-foreground`)
- **`ghost`** (`button--ghost` / `variant="ghost"`): 내비게이션, 헤더 링크 (`bg-transparent text-foreground hover:bg-default`)
- **`danger`** (`button--danger` / `variant="danger"`): 삭제, 나가기 등 위험 액션 (`bg-warning text-white`)
- **`danger-soft`** (`button--danger-soft` / `variant="danger-soft"`): 부드러운 위험 액션 (`bg-warning/10 text-warning`)

### 8-3. 카드 및 목록 내 액션 버튼 배치
- 카드 푸터(`Card.Footer`) 내의 "자세히 보기" 등 단독 액션 버튼은 `flex justify-end`를 사용하여 우측 정렬하고, 불필요하게 어긋나지 않도록 표준 버튼 규격(`px-5`, `h-10`, `rounded-medium`)을 적용합니다.

---

## 9. 라벨(Label) 규격 ✳️ (전역 규칙)

프로젝트 내 사용되는 **모든 라벨(`Label`, `<label>`, `[data-slot="label"]`)**은 일관되게 `0.8rem` 사이즈 규격을 따릅니다.

- **크기**: `0.8rem` (약 12.8px)
- **굵기**: `font-semibold` (600)
- **색상**: 차분하게 살짝 눌러준 톤 (`color-mix(in srgb, var(--foreground) 60%, transparent)`)
- **비활성화 필드(`isDisabled`)**: 이메일 등 수정 불가 필드는 라벨 색상을 더 차분하게 톤 다운(`color-mix(in srgb, var(--foreground) 40%, transparent)`)하고, 입력창은 `var(--default)` 회색 배경으로 눌린(sunken) 느낌을 주어 비활성화 상태임을 명확히 구분합니다.
- **적용 방식**:
  - `globals.css`의 전역 스타일 오버라이드(`label, .label, [data-slot='label']`)로 자동 적용됩니다.

---

## 10. 캡션 및 설명(Caption / Description) 규격 ✳️ (전역 규칙)

폼 안내 문구, 도움말(`helpText`), 필드 부가 설명, 테이블 캡션 등 **모든 캡션성 멘트(`Description`, `[data-slot="description"]`, `caption`, `.description`)**는 라벨과 동일한 `0.8rem` 크기에 일반 글자 굵기(`font-normal`)를 따릅니다.

- **크기**: `0.8rem` (약 12.8px)
- **굵기**: `font-normal` (400, 일반 글자)
- **색상**: 차분하게 살짝 눌러준 톤 (`color-mix(in srgb, var(--foreground) 60%, transparent)`)
- **적용 방식**:
  - `globals.css`의 전역 스타일 오버라이드(`.description, [data-slot='description'], caption`)로 자동 적용됩니다.
  - 폼 도움말이나 안내 멘트를 작성할 때는 HeroUI의 `<Description>` 컴포넌트를 우선 사용합니다.

