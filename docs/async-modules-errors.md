# ES Modules · 비동기 · 에러 모델 · 실습 정리

> 모듈/스코프, Promise/async, 에러 계층, fetch vs axios, 재시도 유틸을 한 문서에서 정리합니다.

---

## 1. 모듈/스코프: ES Modules, default vs named export, tree-shaking

### 1.1 ES Modules 개요

- **의미**: `import`/`export`로 파일 단위 스코프를 나누고, 정적 구조만으로 의존 관계를 파악할 수 있는 표준 모듈 시스템.
- **왜 쓰나**: 스크립트 태그 여러 개보다 한 파일이 “한 단위”가 되어 이름 충돌·순서 이슈를 줄이고, 번들러/런타임이 “어떤 걸 쓰는지” 정적으로 알 수 있게 함.

### 1.2 default export vs named export

| 구분 | default export | named export |
|------|----------------|--------------|
| **문법** | `export default X` / `import X from '...'` | `export { a, b }` / `export const a = ...` / `import { a } from '...'` |
| **이름** | 임의 이름으로 import 가능 | **export 시 정한 이름**과 같거나 `as`로만 바꿀 수 있음 |
| **개수** | 파일당 1개 | 파일당 여러 개 |
| **리네이밍** | `import Whatever from '...'` 자유 | `import { a as b } from '...'` 필요 시 |

**언제 뭘 쓰면 좋은지**

- **default**: 해당 모듈이 “단일 대표값”(한 클래스, 한 함수, 한 객체)을 내보낼 때.  
  예: `export default createHttpService`, `export default class HmcException`.
- **named**:  
  - 한 파일에서 여러 값/타입을 내보낼 때 (`createHttpConfig`, `createHttpService`, `unpack` 등).  
  - 이름으로 사용처를 추적하고, IDE 자동완성·리팩터링에 유리.

지금 `httpCall.ts`처럼 “한 파일에 여러 기능”이면 **named export**가 맞고, “이 파일 = 이 한 것”일 때만 default를 쓰는 게 보통입니다.

### 1.3 tree-shaking 관점

- **tree-shaking**: 번들 결과에서 **실제로 import해서 쓰는 export만** 남기는 최적화.
- **동작 조건**:
  - ES Module 형태 (`import`/`export`)이어야 함.
  - 사용처가 **정적으로** 결정되어야 함.  
    → 동적 `import('...' + 변수)`로 이름이 런타임에 정해지면 “무엇이 쓰이는지”를 번들러가 다 잘라내기 어렵다.
- **default vs named**:
  - **named**는 “이름 단위”로 사용 여부를 파악하기 쉽다.  
    `import { createHttpConfig } from '...'`면 `createHttpConfig`만 쓰는 걸로 보고 나머지는 제거 가능.
  - **default**는 “그 모듈 전체를 하나로” 보는 경우가 많아, default 하나만 써도 해당 파일이 내보낸 다른 것들을 같이 끌고 올 수 있다.  
    그래서 **라이브러리/유틸**은 보통 **named export 위주**로 설계해 tree-shaking을 잘 먹게 합니다.

**실무 팁**: 상수·유틸을 `index.ts`에서 전부 re-export하는 패턴은 편하지만, “한 가지만 쓰는데 index를 import”하면 index가 참조하는 모든 것이 번들에 포함될 수 있으니, 사용하는 쪽에서는 **가능하면 구체 파일에서 named import**하는 게 유리합니다.

---

## 2. 비동기: Promise, async/await, Promise.all / allSettled, 에러 전파·전환

### 2.1 Promise, async/await

- **Promise**: “나중에 나올 값/실패”를 나타내는 객체.  
  `.then(onFulfilled, onRejected)` / `.catch()` / `.finally()` 로 이어 붙이거나, `async` 함수 안에서 `await`로 풀어 쓸 수 있다.
- **async/await**:  
  - `async` 함수는 항상 **Promise를 반환**한다.  
  - `await`는 그 Promise가 settle될 때까지 해당 실행을 멈추고, **fulfilled면 값**, **rejected면 예외**로 바꿔서 동기 코드처럼 다루게 해 준다.

에러는 “호출 스택을 타고 올라가며” 전파된다. `await fn()` 에서 `fn()`이 reject되면, 그 자리에서 예외가 나고, 바깥 쪽 `try/catch`나 상위 `.catch()`가 받지 않으면 최종적으로 “unhandled rejection”이 된다.

### 2.2 Promise.all / Promise.allSettled

| | Promise.all | Promise.allSettled |
|--|-------------|--------------------|
| **성공** | 모든 Promise가 fulfill되면 `[v1,v2,...]` 반환 | 항상 fulfill. 결과는 `{status, value?}` 또는 `{status, reason?}` 배열 |
| **실패** | **하나라도** reject 시 즉시 그 이유로 reject | **절대 reject 안 함**. 실패한 것도 `{ status: 'rejected', reason }` 로 들어감 |
| **용도** | “전부 성공해야 다음 단계”일 때 | “몇 개 실패해도 나머지 결과는 다 보고 싶을 때”(배치, 복수 API 호출 등) |

`httpCall`처럼 “한 번에 여러 API”를 부르는 게 아니라 “한 요청을 실패 시 재시도”하는 흐름이라면 `all`/`allSettled`보다는 아래처럼 **재시도 루프**가 맞습니다.

### 2.3 에러 전파·전환

- **전파**: reject된 Promise를 `await`하면 예외로 튀어나오고, 상위 `try/catch`나 `.catch()`로 넘어간다.  
  `catch`에서 다시 `throw` 하면 그대로 위로 전파된다.
- **전환**:  
  - “네트워크/HTTP 에러 → 도메인용 HmcException”처럼 **의미를 바꿔서** 던지고 싶을 때,  
    `catch` 안에서 `createHmcException(originalError)` 등으로 새 에러를 만들고 `throw` 하면 된다.  
  - `httpCall.ts`의 `throw createHmcException(originalError)` 가 그 역할이다.  
  - 원본을 잃지 않으려면 `new HmcException(..., { cause: originalError })` 처럼 `cause`에 넣어 두면 스택/디버깅에 도움이 된다.

---

## 3. 에러 모델: 표준 Error, HTTP 레이어 vs 도메인 에러

### 3.1 표준 Error

- `throw` 할 수 있는 값은 무엇이든 되지만, **관습과 스택/도구**를 위해 `Error` (또는 그 서브클래스)를 쓰는 게 좋다.
- `Error`는 `message`, `name`, `stack`을 갖고, `cause`로 원인을 체이닝할 수 있다.

### 3.2 HTTP 레이어 에러 vs 도메인 에러

| | HTTP 레이어 에러 | 도메인 에러 |
|--|------------------|-------------|
| **의미** | 요청/응답 과정에서 발생 (네트워크, 타임아웃, 4xx/5xx) | 비즈니스 규칙·유효성 등 “애플리케이션 관점” 실패 |
| **예** | AxiosError, status 401/404/500, fetch 실패 | “이 상품은 품절”, “권한 없음”, HmcException(code, message, hmcErrorCode) |
| **발생 위치** | 클라이언트/HTTP 클래스 내부 | 서비스/유즈케이스/도메인 로직 |
| **처리** | 인터셉터·공통 핸들러에서 status별 분기, 재시도, 로그인 갱신 등 | 화면/유즈케이스에서 코드별 메시지·라우팅 |

프로젝트에서는:

- **HTTP 레이어**: `AxiosError` 기반 `HttpResponseError`, `isNetworkError`, `isHttpStatusOf(401, ...)` 로 “토큰/네트워크” 구분.
- **도메인**: `HmcException`(code, message, hmcErrorCode)로 변환해 View/도메인 계층에 넘기고, `createHmcException`이 “HTTP 에러 → HmcException” 전환을 담당한다.

그래서 **에러 모델**을 “HTTP용 vs 도메인용”으로 나누고, 전환 경계를 `createHmcException` 같은 한 군데에 두는 구조라고 보면 된다.

---

## 4. 실습

### 4.1 Promise만으로 “최대 2번 재시도, 성공 시 조기 종료” 유틸

아래는 **async/await 없이** 순수 Promise 체인으로 “실패 시 최대 2번까지 재시도, 성공하면 바로 그 값으로 종료”하는 예시다.  
프로젝트의 `catchWithRetry`는 “try/catch + 반복”이고, 여기서는 “재시도 횟수”와 “성공 시 즉시 반환”에 초점을 맞춘다.

```ts
type Attempt<T> = () => Promise<T>;

/**
 * 비동기 함수를 최대 3번 시도(초기 1회 + 재시도 2회).
 * 한 번이라도 성공하면 그 결과로 조기 종료.
 * 모두 실패 시 마지막 rejection을 그대로 전파.
 */
function retryWithEarlyExit<T>(fn: Attempt<T>, maxRetries = 2): Promise<T> {
  let lastRejection: unknown;

  const tryOnce = (attemptsLeft: number): Promise<T> =>
    fn().catch((err: unknown) => {
      lastRejection = err;
      if (attemptsLeft <= 0) return Promise.reject(err);
      return tryOnce(attemptsLeft - 1);
    });

  return tryOnce(maxRetries);
}

// 사용 예:
// retryWithEarlyExit(() => fetch('/api/data').then(r => r.json()))
//   .then(data => console.log(data))
//   .catch(err => console.error('3번 다 실패', err));
```

**동작 요약**:

- `fn()`이 fulfill → 그대로 그 값이 반환되고 더 시도하지 않음(조기 종료).
- reject → `attemptsLeft`가 남았으면 `tryOnce(attemptsLeft - 1)` 한 번 더 시도.
- `attemptsLeft === 0`이면 더 재시도하지 않고 `Promise.reject(lastRejection)`.

프로젝트의 `catchWithRetry`와 비교하면:

- `catchWithRetry`는 `[error, response]` 튜플로 “에러/성공을 같이 반환”하고, 재시도 시 **이전 에러를 인자로 넘길 수 있어** “에러에 따라 다른 후속 처리”(예: 토큰 갱신 후 재시도)에 맞춰져 있음.
- 위 `retryWithEarlyExit`는 “단순 재시도 + 성공 시 즉시 반환”만 담당하는 경량 버전이라고 보면 된다.

### 4.2 fetch vs axios 정리

| 관점 | fetch | axios |
|------|--------|--------|
| **요청/응답 인터셉터** | 없음. 매 요청/응답마다 직접 래핑하거나, 별도 `request/response` 레이어를 둬야 함. | `axios.interceptors.request/response`로 전역·인스턴스 단위 적용 가능. (예: 토큰 붙이기, 로깅, 401 시 갱신) |
| **취소** | `AbortController` + `signal`을 `fetch(url, { signal })`에 넘김. 표준만으로 처리. | `AbortController` 호환. `CancelToken`(deprecated) 대신 `signal` 권장. |
| **타임아웃** | 기본 없음. `AbortController` + `setTimeout`으로 `abort()` 호출해 직접 구현. | `timeout` 옵션으로 간단히 지정. 내부적으로도 비슷한 방식이지만 API가 단순함. |
| **에러** | `response.ok === false`여도 reject가 아니라 resolve. status별 분기는 `if (!res.ok)` 후 `res.status`로 따로 해야 함. | 4xx/5xx면 자동으로 reject(AxiosError). `error.response`, `error.request`로 구분 가능. |
| **JSON** | `response.json()` 등으로 직접 호출. | `responseType: 'json'` 또는 기본이면 `data`가 이미 파싱된 객체. |
| **진행률** | 업로드/다운로드 진행률을 위한 표준 API는 없음. | `onUploadProgress` / `onDownloadProgress` 콜백 제공. |

**요약**:

- **인터셉터·타임아웃·에러 형태**를 한 번에 쓰기 좋게 만들려면 **axios**가 유리하고, 지금처럼 전역 에러 맵·토큰·재시도와 맞물리면 axios 기반이 구현하기 쉽다.
- **의존성 최소·표준만 쓰고 싶다**면 **fetch + AbortController**로 인터셉터/타임아웃/에러 처리를 직접 레이어로 만들 수 있다. 다만 “4xx를 reject로 보고, 한 곳에서 status별 분기” 하는 패턴은 fetch 위에 한 겹 더 감싸서 구현해야 한다.

---

## 5. 이 문서와 프로젝트 코드 매핑

- **모듈**: `httpCall.ts`의 `createHttpConfig`, `createHttpService`, `unpack` — named export, tree-shaking 친화적.
- **비동기·재시도**: `common.ts`의 `catchWithRetry` — async + while + try/catch로 재시도, 반환은 `[error, response]`.
- **에러 전환**: `error.ts`의 `createHmcException`, `isNetworkError`, `isTaggedError` — HTTP 레이어 → 도메인(HmcException) 경계.
- **HTTP 클라이언트**: `httpCall.ts`는 axios 사용, 인터셉터 대신 `createHttpConfig`·`performRequest`·`requestWithErrorHandler`로 설정·에러·재시도를 구성.

위 조합이 “ES Modules + named export + Promise/async 기반 + HTTP/도메인 에러 분리 + fetch vs axios 선택”을 실제 코드에서 어떻게 쓰는지에 대한 한 예시라고 보면 된다.
