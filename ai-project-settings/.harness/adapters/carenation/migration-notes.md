# Carenation Migration Notes

이 문서는 Carenation `nursing-hospital` 프로젝트의 DB 마이그레이션 운영 메모다.

## 현재 구조

- 루트 `package.json`은 DB 명령을 `server/` 패키지로 위임한다.
- 서버 패키지는 Drizzle + PostgreSQL을 사용한다.
- 스키마 파일은 `server/src/db/schema.ts`다.
- 마이그레이션 파일은 `server/drizzle/` 아래에 생성된다.
- Drizzle metadata는 `server/drizzle/meta/_journal.json`과 snapshot 파일에 기록된다.

## 주요 명령

| 목적 | 루트 명령 | 실제 서버 명령 |
|------|----------|----------------|
| generate | `npm run db:generate` | `drizzle-kit generate` |
| migrate | `npm run db:migrate` | `drizzle-kit migrate` |
| push | `npm run db:push` | `drizzle-kit push` |
| studio | `npm run db:studio` | `drizzle-kit studio` |

## 주의할 점

- 루트와 `server/` 양쪽에 DB 명령이 있으므로 working directory를 반드시 기록한다.
- `npm run db:migrate`가 exit 0이어도 실제 DB에 반영되지 않을 수 있으므로 metadata와 실제 schema를 사후 검증한다.
- 여러 워크트리에서 동시에 migration을 실행하지 않는다.
- 브랜치별로 생성된 migration 번호가 충돌하거나 순서가 꼬일 수 있다.
- `db:push`는 빠른 MVP 개발에는 유용하지만 migration history 검증과 별도로 취급한다.

## migration-review 적용 시 검증 권장

1. 실행 전 `server/drizzle/meta/_journal.json`의 최신 entry를 확인한다.
2. `server/src/db/schema.ts` 변경 사항과 새 SQL 파일이 대응되는지 확인한다.
3. `npm run db:generate`가 필요한 변경인지 판단한다.
4. `npm run db:migrate`를 루트에서 실행할지 `server/`에서 실행할지 명시한다.
5. 실행 후 metadata 최신 entry와 DB의 실제 테이블/컬럼/index 존재 여부를 확인한다.

## 흔한 실패 패턴

- DB 연결 문자열은 있으나 다른 DB를 바라봄
- migration 파일은 생성됐지만 metadata가 갱신되지 않음
- 이미 적용된 migration과 새 브랜치 migration 순서가 충돌함
- schema 변경만 있고 SQL migration이 생성되지 않음
- `db:migrate`가 성공처럼 끝났지만 실제 대상 DB에 변화가 없음

