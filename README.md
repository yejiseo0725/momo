# momo

관심사가 같은 사람들이 모임을 만들고 챌린지, 일정, 가계부, 채팅을 함께 관리하는 Next.js 애플리케이션입니다.

## 실행 준비

Node.js와 MongoDB가 필요합니다.

```bash
npm install
```

`.env.example`을 참고해 `.env.local`을 만듭니다.

```text
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=momo
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=32자 이상의 임의 문자열
SEED_USER_PASSWORD=momo1234!
PORT=3000
```

운영 환경에서는 반드시 별도의 `BETTER_AUTH_SECRET`을 설정해야 합니다.

## 데이터베이스 초기 구성

다음 명령은 `scripts/seeds.js`의 최신 데이터 구조를 MongoDB 검증 규칙과 인덱스로 반영하고, 예시 계정과 모임 데이터를 추가합니다. 여러 번 실행해도 같은 예시 데이터가 중복 생성되지 않으며, 사용자가 직접 만든 데이터는 삭제하지 않습니다.

```bash
npm run seed
```

`npm run db:seed`도 같은 작업을 수행합니다. Better Auth가 예시 계정을 생성하고 `users`, `accounts` 컬렉션을 관리합니다.

| 구분 | 이메일 | 기본 비밀번호 |
| --- | --- | --- |
| 리더 | `leader@momo.local` | `momo1234!` |
| 멤버 | `member@momo.local` | `momo1234!` |

기본 비밀번호는 `.env.local`의 `SEED_USER_PASSWORD`로 변경할 수 있습니다. 이미 생성된 예시 계정의 비밀번호는 시드를 다시 실행해도 덮어쓰지 않습니다.

## 개발 서버

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다. 개발 서버는 Next.js와 Socket.IO를 함께 실행합니다.

## 검증 명령

```bash
npm test
npm run lint
npm run build
```

## 구현 범위

- Better Auth 이메일·비밀번호 회원가입, 로그인, 세션과 접근 제어
- 프로필 조회와 수정
- 공개 모임 검색·필터, 모임 생성·수정·가입·탈퇴, 멤버 권한 구분
- 챌린지 생성·수정·삭제와 실천 인증
- 월별 일정 달력, 일정 생성·수정·삭제와 참여 관리
- 월별 가계부 수입·지출과 합계
- 일정·챌린지 생성 알림과 읽음 처리
- MongoDB에 저장되는 모임 채팅과 Socket.IO 실시간 갱신
- Simple.css와 최소 레이아웃 CSS를 사용한 반응형 UI

데이터 변경은 Server Action에서 세션, 모임 멤버 여부, 작성자 권한과 입력값을 다시 검증합니다.
