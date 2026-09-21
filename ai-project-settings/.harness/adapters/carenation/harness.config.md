# Harness Config — Carenation Nursing Hospital

> 이 파일은 harness CLI가 설치 당시 adapter 스냅샷으로 보관하는 기준 파일입니다. 직접 수정하지 마세요.
> 프로젝트 설정을 바꾸려면 루트 `harness.config.md`를 수정하세요.


현재 `nursing-hospital` 프로젝트에 하네스를 적용할 때 사용하는 adapter 예시다.

## Project

| 항목 | 값 |
|------|-----|
| 프로젝트 이름 | Carenation nursing-hospital |
| 주요 도메인 | logistics, nursing-hospital, admin |
| 기본 브랜치 | main |
| 패키지 매니저 | npm |

## Paths

| 항목 | 경로 |
|------|------|
| 기획 루트 | `docs/` |
| 진행 파일 | `docs/PROGRESS.md` |
| 프론트 루트 | `src/` |
| 서버 루트 | `server/` |
| 서버 라우트 | `server/src/routes/` |
| DB 스키마 | `server/src/db/schema.ts` |
| Drizzle 마이그레이션 | `server/drizzle/` |
| dev-log 루트 | `docs/dev-logs/` |
| E2E 루트 | `e2e/` |

## Planning Indexes

| 도메인 | index |
|--------|-------|
| logistics | `docs/logistics/@index.md` |
| nursing-hospital | `docs/nursing-hospital/@index.md` |
| admin | `docs/admin/@index.md` |

## Commands

| 목적 | 명령 | 실행 위치 |
|------|------|----------|
| 프론트 개발 서버 | `npm run dev:client` | repo root |
| 서버 개발 서버 | `npm run dev:server` | repo root |
| 전체 테스트 | `npm run test:run` | repo root |
| 프론트 테스트 | `npm run test:run` | repo root |
| 서버 테스트 | `npm run test --prefix server` | repo root |
| 타입 체크 | `npm run build` | repo root |
| 서버 타입 체크 | `npm run typecheck --prefix server` | repo root |
| 린트 | `npm run lint` | repo root |
| E2E | `npm run test:e2e` | repo root |
| DB generate | `npm run db:generate` | repo root |
| DB migrate | `npm run db:migrate` | repo root |
| DB push | `npm run db:push` | repo root |
| DB seed | `npm run db:seed` | repo root |

## DB Adapter

| 항목 | 값 |
|------|-----|
| DB | Supabase PostgreSQL |
| ORM | Drizzle |
| CLI | drizzle-kit |
| 서버 패키지 | `server/package.json` |
| migration metadata | `server/drizzle/meta/_journal.json` |

## Skill Notes

- 서버 구현 후 프론트 구현을 진행한다.
- `impl-frontend`는 서버 구현 시 생성된 `docs/dev-logs/{YYYY-MM-DD}_{페이지명}.md`를 참조한다.
- `continue-impl`은 `docs/PROGRESS.md`와 도메인별 `@index.md`를 먼저 동기화한다.
- `worktree-manage` 사용 시 DB 마이그레이션은 동시에 여러 워크트리에서 실행하지 않는다.

