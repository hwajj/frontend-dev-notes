---
name: impl-e2e
description: >-
  Playwright 기반 E2E 테스트 작성 워크플로우.
  "E2E 테스트 작성해줘", "E2E 추가해줘" 등 요청 시 사용.
  반드시 impl-frontend와 별도 세션에서 실행한다.
---

# E2E 테스트 작성

## 전제 조건

- 대상 페이지의 UI 구현이 완료되어 있어야 한다
- impl-frontend 세션과 동시에 실행하지 않는다 (별도 세션 원칙)

## 0. 인프라 확인

1. `playwright.config.ts` 파일 존재 확인
2. `e2e/` 디렉터리 구조 확인 (fixtures, pages, tests)
3. 누락 시 사용자에게 "E2E 인프라가 없습니다. 먼저 셋업이 필요합니다." 안내

## 1. 기획 문서 탐색

1. `docs/`에 존재하는 모든 `@index.md`를 읽어 서비스 전체 목차를 파악한다
2. 사용자 입력과 목차 항목을 매칭한다
3. 후보가 2개 이상이면 `AskQuestion`으로 사용자에게 확인한다
4. 매칭된 문서를 읽되, 다음 공통 정책도 함께 읽는다:
   - 리스트 페이지 → `docs/list-conventions.md`
   - 상세 페이지 → `docs/detail-error.md` (존재 시)

## 2. 기존 구현 파악

기획 문서에서 다루는 페이지의 구현 코드를 빠르게 확인한다:

1. `src/routes/` 아래에서 해당 페이지 컴포넌트를 찾는다
2. 사용 중인 주요 컴포넌트, 라우트 경로, 데이터 구조를 파악한다
3. 깊이 읽지 않는다 — 파일 목록과 export, Props 수준으로 제한

## 3. E2E 시나리오 목록 작성

기획 문서를 기반으로 사용자 행동 시나리오를 정리한다:

```
## E2E 시나리오 목록: {기능명}

> 기획 문서: {경로}

| # | 기획 섹션 | 시나리오 | 우선순위 |
|---|----------|---------|---------|
| 1 | §2 테이블 | 목록이 10건 단위로 페이징된다 | 필수 |
| 2 | §3 필터 | 날짜 범위 필터가 URL에 동기화된다 | 필수 |
| 3 | §4 상세 | 상세 페이지에서 주문 정보가 표시된다 | 필수 |
| ...| | | |
```

- 기획 섹션을 `test.describe`에 1:1 매핑할 계획으로 정리한다
- 우선순위: 필수 (핵심 흐름), 권장 (부가 기능), 선택 (엣지 케이스)
- 사용자에게 시나리오 목록을 출력하고, 확인 후 진행한다

## 4. 페이지 객체 작성/갱신

| 경로 | 용도 |
|------|------|
| `e2e/pages/` | 페이지 객체 (도메인별 하위 폴더) |
| `e2e/pages/logistics/` | 물류 도메인 페이지 객체 |
| `e2e/pages/nursing-hospital/` | 요양원 도메인 페이지 객체 |

### 페이지 객체 작성 원칙

- 로케이터는 접근성 우선: `getByRole` > `getByLabel` > `getByText` > `locator()`
- `data-testid`는 최후의 수단으로만 사용
- 페이지 객체는 로케이터 + 액션만 포함. assertion은 테스트 파일에서 수행
- 이미 존재하는 페이지 객체가 있으면 갱신/확장한다

```typescript
// e2e/pages/logistics/OrderListPage.ts
import type { Locator, Page } from '@playwright/test';

export class OrderListPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly table: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.table = page.getByRole('table');
    this.rows = page.getByRole('row');
  }

  async goto() {
    await this.page.goto('/logistics/orders');
    await this.heading.waitFor({ state: 'visible' });
  }
}
```

## 5. 테스트 코드 작성

| 경로 | 용도 |
|------|------|
| `e2e/tests/` | 테스트 파일 (도메인별 하위 폴더) |
| `e2e/tests/logistics/` | 물류 도메인 테스트 |
| `e2e/tests/nursing-hospital/` | 요양원 도메인 테스트 |

### 파일 명명

- 파일명: `{페이지-kebab-case}.spec.ts` (예: `order-list.spec.ts`)
- 기획 섹션을 `test.describe`에 1:1 매핑

### 인증 상태 사용

인증이 필요한 테스트는 `chromium` 프로젝트로 실행된다 (storageState 자동 적용).
import는 `e2e/fixtures/auth.ts`에서 가져온다:

```typescript
import { test, expect } from '../../fixtures/auth';
```

### 시드 데이터 사용

특정 데이터가 필요한 테스트는 `e2e/fixtures/seed.ts`의 시드 픽스처를 사용한다:

```typescript
import { test, expect } from '../../fixtures/seed';

test('주문 목록이 10건 단위로 페이징된다', async ({ page, seed }) => {
  await seed('order-list');
  await page.goto('/logistics/orders');
  // ...
});
```

새 시나리오가 필요하면 `server/src/routes/test-seed.ts`에 시나리오를 추가한다.

## 6. 테스트 실행

```bash
# 특정 파일만 실행
npx playwright test e2e/tests/logistics/order-list.spec.ts

# 특정 프로젝트로 실행
npx playwright test --project=chromium e2e/tests/logistics/order-list.spec.ts

# 비인증 테스트
npx playwright test --project=unauthenticated e2e/tests/login.spec.ts
```

## 7. 실패 수정

모든 실패에 대해 아래 절차를 따른다:

1. `test-results/` 폴더의 스크린샷을 확인한다
2. **기획 문서를 다시 읽고**, 테스트의 기대값이 기획과 일치하는지 검증한다
3. 기대값이 기획과 일치하면 — 테스트가 맞고 구현이 틀린 것이다:
   - 테스트를 수정하지 않는다
   - 해당 테스트에 `test.fixme()`를 붙여 skip 처리하고, 사유를 주석으로 남긴다
   - 보고서의 "발견한 구현 버그" 섹션에 기록한다
   - 사용자에게 `AskQuestion`으로 구현 수정 여부를 확인한다. 수정 승인 시 구현 코드를 수정하고 `test.fixme()`를 제거한다
4. 기대값이 기획과 불일치하면 — 테스트가 잘못 작성된 것이다:
   - 기획에 맞게 테스트를 수정한다
   - 수정 후에도 실패하면 3번으로 돌아간다

## 8. 보고서 출력

```
## E2E 테스트 보고서: {기능명}

> 기획 문서: {경로}
> 테스트 파일: {파일 경로}
> 실행 결과: N passed / M failed

### 커버리지

| 기획 섹션 | 시나리오 수 | 통과 | 실패 | 미작성 |
|----------|-----------|------|------|--------|
| §2 테이블 | 3 | 3 | 0 | 0 |
| §3 필터 | 2 | 1 | 1 | 0 |

### 발견한 구현 버그
- (없음)
```

- 보고서를 출력하지 않고 종료하는 것은 금지한다

## 9. Git 커밋

### 커밋 원칙

- 브랜치: 현재 feature 브랜치에서 작업한다 (새 브랜치를 만들지 않는다)
- 커밋 단위: 페이지 객체 + 테스트를 함께 커밋한다
- 시드 데이터 추가가 있으면 별도 커밋한다

### 커밋 메시지

```
test: {기능명} E2E 테스트 작성
chore: {기능명} E2E 시드 데이터 추가
```

## 10. 금지 사항

- 사용자 승인 없이 구현 코드(`src/routes/`, `src/components/`)를 수정하는 것
- 구현 버그에 맞추어 테스트의 기대값을 변경하여 pass시키는 것 (버그 은폐)
- impl-frontend 세션에서 E2E를 작성하는 것
- 기획 문서를 읽지 않고 테스트를 작성하는 것
- 시나리오 목록을 나열하지 않고 바로 코드를 작성하는 것
- 보고서를 출력하지 않고 종료하는 것
