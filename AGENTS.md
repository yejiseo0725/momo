<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->



## 프로젝트 제약사항

### 작업 원칙

- 범위 외 변경·새 의존성: 이유와 범위 보고 후 승인
- 작업 단위: 완료·검증 후 항상 git commit / push 물어보기 알아서 하면 절대 안됨.
- 코드 작성: 초급자도 이해할 수 있게 명시적으로 작성, 과도한 축약과 불필요한 추상화·계층·라이브러리 금지
- 지시형 주석: 작업 지침으로 해석해 최대한 반영

### 파일 구조

- 전용 함수·컴포넌트: 해당 파일 또는 같은 route·기능 디렉토리에 배치
- 긴 파일: 역할이 드러나는 이름의 파일로 분리
- `/components`: 여러 page·기능에서 재사용하는 UI만 배치
- `/lib/utils/`: 여러 위치에서 재사용하는 순수 Utility만 역할별 배치

### 컴포넌트와 UI

- React Hook: `useState`, `useEffect`, `useRef`, `useActionState` 기본, 그 외 Hook은 이유·대안 보고 및 승인 후 사용
- Client Component: 브라우저 이벤트·로컬 상태·즉각적 UI 반응이 필요한 최소 영역만 분리
- SimpleDotCss 상태로 layout 구성을 위한 최소한의 CSS만 사용
- Layout: `layout.js`에 해당 route 구조 직접 작성
- Layout 금지 사항: 외부 주입·불필요한 추상화·복잡한 합성·빈 컴포넌트

### 렌더링과 데이터 흐름

- `page.js` 기본 export: `async` Server Component
- 요청 시점 렌더링: 컴포넌트 시작 부분에서 `await connection()` 호출
- 서버 처리: DB 조회·인증·초기 데이터 준비·UI 렌더링
- 코드 흐름: page 또는 action → lib → DB
- Route Handler API: 외부 클라이언트·웹훅 등 실제 필요 시에만 구현
- 사용 금지: SSG·ISR·PPR·복잡한 캐시·직접 구성한 Streaming
- 로딩 UI: 단순한 route 단위 `loading.js` 허용

### 입력과 URL

- Server Action 폼: Server Component의 `<form action={serverAction}>` 기본
- 입력·데이터 변경: `<form>`과 Server Action 중심
- Server Action 검증: 세션·권한·입력값 재검증
- URL 경로 값: `params` 사용
- 검색·필터·페이지 이동: Query String과 `searchParams` 사용, 로컬 state 중복 관리 금지
- DB 조회 조건 변경: URL의 `params` 또는 `searchParams`로 전달하여 Server Component부터 다시 실행

### 인증과 DB

- 로그인·인증: Better Auth 사용
- 개발용 DB 초기화·초기 데이터: `/scripts/seeds.js`에서만 관리
- MongoDB 조회: 컴포넌트 간 Props를 필수 항목으로 제한하고, 데이터를 사용하는 Server Component에서 직접 조회
- `ObjectId()`를 Foreign Key로 사용: DB에 String으로 저장. Better Auth 관리 콜렉션 제외
- DB.find() 후 데이터를 최대한 .map() 재정의 없이 그대로 전달

### 검증

- 완료 검증: 기본 단위 테스트와 lint 실행
- 주요 기능: 브라우저 또는 API 요청으로 직접 확인