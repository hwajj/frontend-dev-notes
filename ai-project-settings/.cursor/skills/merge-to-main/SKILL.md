---
name: merge-to-main
description: 현재 체크아웃된 feature/fix 브랜치를 main에 --no-ff 머지하는 스킬.
---

# Merge to Main

현재 체크아웃된 브랜치를 main에 `--no-ff`로 머지한다.

## 사전 조건 검증

아래 조건을 **모두** 통과해야 머지를 진행한다. 하나라도 실패하면 사용자에게 알리고 중단한다.

1. **브랜치 타입 확인**: 현재 브랜치가 `feat/`, `fix/`, `refac/`, `test/`, `docs/`, `chore/` 중 하나로 시작해야 한다.
2. **워킹 트리 클린**: `git status --porcelain`이 빈 출력이어야 한다. 변경사항이 있으면 커밋 또는 스태시를 안내한다.
3. **main 브랜치 존재**: 로컬에 main 브랜치가 있어야 한다.

## 머지 워크플로우

```
1. 현재 브랜치명 저장
2. git checkout main
3. git pull origin main (원격이 있을 경우)
4. git merge --no-ff <브랜치명>
5. 머지 성공 확인
6. DB 스키마 변경 감지 및 마이그레이션
7. 머지된 브랜치 삭제
8. git stash pop (이전 과정에서 스태시한 내용이 있는 경우)
```

### 단계별 실행

**Step 1 — 현재 브랜치명 확인 및 검증**

```bash
git branch --show-current
git status --porcelain
```

- 브랜치가 `main`이면 → **워크트리 브랜치 머지 모드**로 전환한다:
  1. `git worktree list`로 워크트리 목록을 확인한다
  2. 워크트리가 메인만 있으면 (워크트리 미사용) → 기존대로 "이미 main 브랜치입니다" 중단
  3. feat/ 또는 fix/ 브랜치가 체크아웃된 워크트리가 있으면:
     - `git branch --no-merged main`으로 미머지 브랜치만 필터링한다
     - 미머지 브랜치가 0개면 → "머지할 브랜치가 없습니다" 안내 후 중단
     - 미머지 브랜치를 `AskQuestion` 선택지로 제시한다(다중 선택)
     - 형식: `{브랜치명} — {최근 커밋 메시지 요약} ({워크트리 디렉토리})`
     - 사용자가 선택하면 → Step 2를 스킵하고, `git merge --no-ff {선택된 브랜치}`를 실행하여 Step 3으로 직행한다
     - Step 6(브랜치 삭제)는 **건너뛴다** — 해당 브랜치가 워크트리에 체크아웃되어 있으므로 삭제 불가. 브랜치 정리는 `worktree-manage` recycle 시점에 수행한다
- 브랜치가 허용된 prefix가 아니면 중단: "머지 대상이 아닌 브랜치입니다: {브랜치명}"
- 워킹 트리가 더럽다면 AskQuestion으로 처리 방법을 묻는다:
  - **커밋**: 사용자에게 커밋 메시지를 입력받아 `git add -A && git commit -m "<사용자 메시지>"` 실행 후 워크플로우 계속
  - **스태시**: `git stash -u` 실행 후 워크플로우 계속 (머지 완료 후 `git stash pop` 안내)
  - **중단**: 머지를 중단한다

**Step 2 — main으로 이동 및 최신화**

```bash
git checkout main
git pull origin main
```

- pull 실패(원격 없음)는 무시하고 계속 진행한다.

**Step 3 — --no-ff 머지**

```bash
git merge --no-ff <브랜치명>
```

- 충돌 발생 시 → "충돌 해결 워크플로우" 섹션으로 이동한다.

**Step 4 — 머지 후 확인**

```bash
git log --oneline -2
```

머지 커밋이 정상 생성되었는지 보여준다.

**Step 5 — DB 스키마 변경 감지 및 마이그레이션**

**5-1. 스키마 변경 감지:**

```bash
git diff HEAD^1..HEAD --name-only -- server/src/db/schema.ts
```

- 출력이 비어있으면 → Step 6으로 진행 (스킵)

**5-2. drizzle 디렉토리 복원:**

머지된 브랜치가 `server/drizzle/` 변경을 포함하고 있을 수 있다 (브랜치에서 마이그레이션 파일을 생성했던 경우). 이 변경을 버리고 main의 머지 전 상태로 복원한다.

```bash
git diff HEAD^1..HEAD --name-only -- server/drizzle/
```

- 출력이 있으면 (브랜치가 drizzle 파일을 변경함):
  ```bash
  git checkout HEAD^1 -- server/drizzle/
  git add server/drizzle/
  git commit -m "chore: 브랜치의 drizzle 마이그레이션 파일 되돌림"
  ```
- 출력이 없으면: 스킵

**5-3. db-migrate 스킬 실행:**

[db-migrate](../.cursor/skills/db-migrate/SKILL.md) 스킬의 절차를 실행한다. db-migrate에서 생성된 커밋은 머지 커밋 이후 별도 커밋으로 추가된다.

**Step 6 — 머지된 브랜치 삭제**

```bash
git branch -d <브랜치명>
```

머지 완료 후 해당 브랜치를 자동 삭제한다.

## 충돌 해결 워크플로우

### Phase 1 — 충돌 파악 (머지 상태 유지)

```bash
git diff --name-only --diff-filter=U
```

- 충돌 파일 목록을 수집한다.
- `git merge --abort`하지 않는다.

### Phase 1.5 — base 버전 조회

각 충돌 파일의 공통 조상(base) 버전을 조회한다. Git은 머지 충돌 중 3개 스테이지를 유지한다:

```bash
git show :1:<충돌파일>   # Stage 1 = 공통 조상 (base)
```

이 base 내용을 Phase 2에서 변경 주체 판별에 사용한다.

### Phase 2 — 충돌 분석 및 분류

각 충돌 파일을 Read하여 `<<<<<<<`, `=======`, `>>>>>>>` 마커 구간을 추출하고, Phase 1.5에서 조회한 base 버전과 비교하여 변경 주체를 판별한 뒤, 각 충돌을 아래 두 범주로 분류한다.

**변경 주체 판별** (분류 전 필수 수행):

충돌 유형에 따라 매칭 방법이 다르다:
- **PROGRESS.md 테이블 충돌**: 1열(페이지 링크 텍스트)을 키로 행 단위 매칭. base/HEAD/feature에서 동일 키의 행을 찾아 나머지 컬럼을 비교한다.
- **코드 파일 충돌**: 충돌 블록 전체를 base의 해당 영역과 일괄 비교한다.

매칭된 행/블록 각각에 대해:
- base와 동일한 쪽 = 변경하지 않은 쪽 (구버전) → 이 쪽의 내용은 무시
- base와 다른 쪽 = 실제 변경한 쪽 → 이 쪽의 내용을 채택
- 양쪽 모두 base와 다르면 = 양쪽 모두 변경 → 애매한 충돌로 분류

**명확한 충돌** (에이전트가 직접 해결):
- 양쪽이 같은 위치에 서로 다른 import/export를 추가한 경우 (둘 다 포함)
- 한쪽은 포매팅/스타일만 변경, 다른 쪽은 실제 로직 변경 (로직 변경 유지)
- 한쪽이 다른 쪽의 상위 호환(superset)인 경우 (superset 유지)
- 양쪽 변경이 서로 독립적이어서 단순 병합 가능한 경우 (둘 다 포함)
- **PROGRESS.md 테이블 충돌** (행 단위 병합 — 반드시 base 비교 결과에 따라 판단):
  - 서로 다른 행(페이지)만 수정한 경우: 각 행을 1열 키로 base와 매칭하고, base 대비 변경된 쪽의 버전을 채택한다
  - 같은 행이지만 다른 컬럼을 수정한 경우: 양쪽 변경을 모두 반영
  - 하단 "미구현/불일치 항목" 섹션: 서로 다른 페이지 블록 → 양쪽 모두 유지
  - 같은 행의 같은 컬럼을 다르게 수정한 경우: "애매한 충돌"로 분류

**애매한 충돌** (사용자에게 질문):
- 양쪽 모두 같은 영역을 서로 다른 의도로 수정한 경우
- 로직이 서로 충돌하여 어느 쪽이 최신 의도인지 판단 불가한 경우
- 양쪽 코드를 병합해야 하지만 병합 방법이 여러 가지인 경우

### Phase 3 — 해결 실행

1. **명확한 충돌**: 판단에 따라 StrReplace로 마커를 제거하고 올바른 코드로 교체한다. 적용 전에 채택한 각 행/블록이 base와 다른지(= 실제 변경분인지) 한 번 더 확인한다.

2. **애매한 충돌**: 충돌 하나씩 순서대로 사용자에게 질문한다. 각 충돌마다 아래 순서로 진행:

(a) 대화창에 텍스트 메시지로 아래 정보를 출력:
- 충돌 파일 마크다운 링크 (사용자가 클릭하여 열어볼 수 있도록)
- 양쪽 코드 비교 표

출력 형식:
```
**충돌: [src/example.ts](src/example.ts) (Line 42-58)**

| main(HEAD) | feature 브랜치 |
|---|---|
| (HEAD 쪽 코드) | (feature 쪽 코드) |
```

(b) 비교 표 출력 직후 AskQuestion 호출:
- prompt: "어떻게 해결할까요?"
- options: "main(HEAD) 코드 유지", "feature 브랜치 코드 반영"

(c) 사용자 답변에 따라 StrReplace로 해당 충돌 해결

(d) 다음 충돌로 이동하여 (a)부터 반복

3. 모든 충돌 해결 후:

```bash
git add -A
git commit --no-edit
```

이후 기존 Step 4(머지 확인), Step 5(DB 마이그레이션), Step 6(브랜치 삭제)를 이어서 실행한다.

### 중단 요청 시

사용자가 충돌 해결을 중단하고 싶다고 하면:

```bash
git merge --abort
git checkout <원래-브랜치>
```

## 에러 복구

머지 중 어떤 단계에서든 실패하면:
1. 현재 상태를 `git status`로 확인
2. 머지 충돌 해결 도중이었다면: `git merge --abort`로 머지 상태를 해제
3. 가능하면 원래 브랜치로 복귀: `git checkout <원래-브랜치>`
4. 실패 원인을 사용자에게 보고
