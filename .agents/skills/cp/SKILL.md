---
name: cp
description: >-
  Triggered when the user mentions "cp", "commit push", "commit", "push", or asks to finalize, commit, and push changes following project conventions, verification steps, and user confirmation rules.
---

# Git Commit & Push Workflow (`cp`)

이 프로젝트의 규칙과 커밋 컨벤션에 따라 변경사항을 검증하고, 커밋 메시지를 생성하며, 사용자의 승인을 거쳐 커밋 및 푸시를 진행하는 가이드입니다. 사용자가 **"cp"**라고만 입력해도 이 워크플로우를 즉시 실행합니다.

---

## 중요 원칙 (AGENTS.md 준수)

> [!IMPORTANT]
> **알아서 커밋/푸시 금지**: 작업 완료 및 검증 후 **항상 사용자에게 커밋/푸시 진행 여부와 커밋 메시지를 물어보고 승인을 받아야 합니다.** 임의로 `git commit`이나 `git push`를 실행해서는 안 됩니다.

---

## 커밋 메시지 컨벤션

Conventional Commits 규칙을 따르며, 설명은 변경 내용을 명확하고 간결하게 작성합니다.

```text
<type>: <description>
```

### Type 목록

| Type | 설명 | 예시 |
| :--- | :--- | :--- |
| **`feat`** | 새로운 기능 추가 | `feat: 내 주변 모임 조회 추가` |
| **`fix`** | 버그 수정 | `fix: 챌린지 인증 사진 선택 오류 수정` |
| **`refactor`** | 기능 변경 없는 코드 구조 개선 / 리팩토링 | `refactor: region 값을 법정동 코드로 통일` |
| **`perf`** | 성능 개선 | `perf: 채팅 메시지 증분 동기화` |
| **`style`** | 코드 포맷팅, 세미콜론 누락 등 (코드 동작 변경 없음) | `style: 레이아웃 간격 및 스타일 정리` |
| **`docs`** | 문서 변경 (README, 가이드 등) | `docs: 실행 준비 및 시드 가이드 갱신` |
| **`test`** | 테스트 코드 추가 또는 수정 | `test: 모임 생성 유효성 검사 테스트 추가` |
| **`chore`** | 빌드 설정, 패키지 매니저 설정, 단순 안내 문구 정리 등 | `chore: 페이지 안내 문구 정리` |

### 작성 규칙
- 제목은 한 줄로 간결하고 명확하게 작성합니다 (50자 내외 권장).
- 마침표(`.`)는 끝에 붙이지 않습니다.
- 필요한 경우 본문에 변경 이유나 세부 내용을 덧붙일 수 있습니다.

---

## 실행 절차 (Step-by-Step)

### 1단계: 변경사항 확인
현재 변경된 파일과 git 상태를 확인합니다.
```bash
git status
git diff
```

### 2단계: 코드 검증 (Lint & Test)
프로젝트 검증 명령을 실행하여 오류가 없는지 확인합니다.
```bash
npm run lint
npm test
```
*(필요 시 `npm run build`도 실행)*

### 3단계: 커밋 메시지 제안 및 사용자 승인 요청
검증이 통과되면, 사용자에게 스테이징할 파일 목록과 제안하는 커밋 메시지를 제시하고 승인을 요청합니다.

**사용자 확인 메시지 예시:**
> 변경 사항에 대한 검증(`lint`, `test`)을 완료했습니다.
> 아래 내용으로 커밋 및 푸시를 진행할까요?
>
> - **변경 파일 목록**:
>   - `app/gatherings/[id]/page.js`
>   - `app/gatherings/GatheringForm.js`
> - **제안 커밋 메시지**: `feat: 모임 상세 페이지 UI 개선`

### 4단계: 커밋 실행 (승인 후)
사용자가 승인하면 커밋을 생성합니다.
```bash
git add <대상_파일들>
git commit -m "<커밋_메시지>"
```

### 5단계: 푸시 실행 (승인 후)
현재 작업 브랜치를 확인하고 원격 저장소로 푸시합니다.
```bash
git push origin <브랜치명>
```
*(기본적으로 upstream이 설정되어 있는 경우 `git push` 실행)*
