---
name: db-migrate
description: >-
  Drizzle 마이그레이션 파일 생성 및 DB 적용을 안전하게 수행하는 스킬.
  merge-to-main에서 호출되거나 독립 실행할 수 있다.
disable-model-invocation: true
---

# DB 마이그레이션

`server/src/db/schema.ts` 변경 후 Drizzle 마이그레이션 파일을 생성하고 DB에 적용한다.

## 프로젝트 구조

- 스키마 원천: `server/src/db/schema.ts`
- Drizzle 설정: `server/drizzle.config.ts` (schema → `./src/db/schema.ts`, out → `./drizzle`)
- 마이그레이션 파일: `server/drizzle/*.sql`
- 저널: `server/drizzle/meta/_journal.json`
- 스냅샷: `server/drizzle/meta/NNNN_snapshot.json`

## 스크립트

| 루트 명령 | 실행 내용 |
|-----------|----------|
| `npm run db:generate` | `drizzle-kit generate` — schema.ts와 마지막 스냅샷을 비교하여 SQL 파일 생성 |
| `npm run db:migrate` | `drizzle-kit migrate` — 저널 기반으로 미적용 SQL을 DB에 순차 적용 |
| `npm run db:push` | `drizzle-kit push` — schema.ts와 실제 DB를 직접 비교하여 차이 적용 |

---

## Step 1 — 고아 파일 정리

`server/drizzle/meta/_journal.json`의 `entries[].tag` 목록과 `server/drizzle/*.sql` 파일명을 대조한다.

- 저널에 없는 SQL 파일 = **고아 파일**
- 고아 SQL 파일의 인덱스에 대응하는 `meta/NNNN_snapshot.json`도 고아 파일에 포함

고아 파일이 발견되면:
1. 해당 SQL 파일과 스냅샷 파일을 삭제한다
2. 삭제한 파일 목록을 사용자에게 안내한다

고아 파일이 없으면 바로 Step 2로 진행한다.

## Step 2 — 마이그레이션 파일 생성

```bash
npm run db:generate
```

결과에 따라 분기한다:

- **성공** → `server/drizzle/`에 새 SQL 파일과 `meta/` 스냅샷이 생성된다. Step 4로 진행
- **"No schema changes"** → "스키마 변경 없음" 안내 후 종료
- **TTY 에러** (`Interactive prompts require a TTY terminal` 포함) → Step 3으로 분기
- **그 외 에러** → 에러 보고 후 중단

## Step 3 — 수동 마이그레이션 파일 생성 (TTY fallback)

`db:generate`가 비대화형 환경에서 컬럼/테이블 rename 프롬프트를 띄우려다 실패한 경우, 에이전트가 직접 마이그레이션 파일을 작성한다.

### 절차

1. **스키마 diff 분석**: `git diff HEAD -- server/src/db/schema.ts` (머지 시 `HEAD^1..HEAD`)로 변경 내용을 파악한다.

2. **마이그레이션 이름 생성**: 형용사+명사 랜덤 조합으로 drizzle 스타일 이름을 생성한다 (예: `gentle_phoenix`, `swift_nightcrawler`).

3. **빈 파일 생성**:
   ```bash
   npx drizzle-kit generate --custom --name=<생성된_이름>
   ```
   server/ 디렉토리에서 실행한다. 빈 SQL 파일과 저널 엔트리가 생성된다.

4. **SQL 작성**: 분석한 diff를 기반으로 적절한 DDL SQL을 파일에 작성한다.
   - `ADD COLUMN` → `ADD COLUMN IF NOT EXISTS` 사용
   - `DROP COLUMN` → `DROP COLUMN IF EXISTS` 사용
   - `CREATE TABLE` → `CREATE TABLE IF NOT EXISTS` 사용
   - `DROP TABLE` → `DROP TABLE IF EXISTS` 사용
   - `ALTER TYPE ... ADD VALUE` → `IF NOT EXISTS` 구문 사용

5. Step 4로 진행한다.

## Step 4 — DB 마이그레이션 적용

```bash
npm run db:migrate
```

- `drizzle-kit migrate` 실행 — 저널에 등록된 미적용 SQL을 DB에 순차 적용
- 성공 시 → Step 6으로 진행
- 실패 시 (에러 출력 또는 무응답 종료) → Step 5로 진행

## Step 5 — 진단 및 복구

Step 4 실패 시 원인을 파악하고 수정한 뒤 db:migrate를 재시도한다.

### 절차

1. **에러 출력 분석**: migrate 종료 시 출력된 에러 메시지, PostgreSQL 에러 코드, hang 여부를 확인한다.
2. **DB 상태 조회**: 임시 `.mjs` 스크립트(server/node_modules의 postgres 활용)로 필요한 쿼리를 실행하여 원인을 특정한다. 스크립트는 사용 후 삭제한다.
3. **수정 적용**: 원인에 맞는 조치를 취한다.
4. **db:migrate 재시도**: 수정 후 Step 4로 돌아가 재실행한다. 재시도에서도 실패하면 동일한 진단 루프를 반복한다.
5. **해결 불가 시**: db:migrate 재시도가 5회 이상 실패하면 아래 내용을 포함한 보고서를 `.md` 파일로 작성하고 사용자에게 전달한 뒤 중단한다.
   - 생성된 마이그레이션 SQL 파일 경로 및 내용 요약
   - 시도 횟수 및 각 시도별 에러 메시지/출력
   - 각 시도에서 적용한 조치와 결과
   - 현재 DB 상태 (적용된 마이그레이션, 문제가 된 테이블/타입 등)

### 자주 만나는 원인 예시

아래는 참고용 예시이며, 진단 결과에 따라 다른 원인일 수 있다.

- **Stale 트랜잭션 (hang)**: `pg_stat_activity`에서 `idle in transaction` 상태가 1분 이상 지속된 세션 → `pg_terminate_backend(pid)`로 종료 후 재시도
- **생성된 SQL 중복 구문**: `ALTER TYPE ... ADD VALUE`에서 동일한 (타입명, 값) 쌍이 두 번 등장 → 중복 라인 제거 후 재시도
- **스키마 부분 적용 (열/타입/인덱스 이미 존재)**: 이전 `db:push` 등으로 일부가 이미 적용된 경우 → 구문별로 DB 실제 상태를 확인하고, 미적용 구문만 직접 실행한 뒤 마이그레이션 해시를 `drizzle.__drizzle_migrations`에 수동 등록
- **데이터 무결성 (UNIQUE INDEX 생성 실패, 코드 23505)**: 대상 테이블에 중복 행 존재 → 중복 목록을 사용자에게 보여주고 처리 방법을 결정받은 뒤 재시도

## Step 6 — 적용 검증

경로에 따라 검증 방식이 다르다.

### Step 2 성공 경로 (db:generate 정상 완료)

```bash
npm run db:push
```

- `schema.ts`와 실제 DB를 직접 비교하여 차이를 적용한다
- 변경 사항이 없으면 → 정상 완료 (migrate가 올바르게 적용된 것)
- 변경 사항이 있으면 → migrate가 실제로 적용되지 않았던 것이므로, push가 직접 적용한다
- push 결과를 사용자에게 안내한다
- **push 실패 시** → Step 5 절차로 진단 후 복구한다. 생성된 마이그레이션 파일은 보존한다

### Step 3 경로 (수동 마이그레이션)

임시 `.mjs` 스크립트로 해당 변경분이 DB에 반영되었는지 직접 확인한다.

```javascript
// 예: 컬럼 추가 검증
SELECT column_name FROM information_schema.columns
WHERE table_name = '<테이블>' AND column_name = '<컬럼>';
```

- `information_schema.columns` — 컬럼 존재 여부
- `information_schema.tables` — 테이블 존재 여부
- `pg_type` — enum 타입/값 존재 여부

기대하는 결과가 확인되면 정상 완료. 스크립트는 검증 후 삭제한다.
검증 실패 시 → Step 5 절차로 진단한다.

## Step 7 — 결과 커밋

`git status --porcelain -- server/drizzle/`로 변경 파일을 확인한다.

- 새 파일이 있으면: `git add server/drizzle/ && git commit -m "chore: {도메인명} DB 마이그레이션 생성"`
  - 도메인명은 머지된 브랜치명에서 도출한다 (예: `feat/order-list` → "주문 목록")
- 변경 파일이 없으면 스킵
