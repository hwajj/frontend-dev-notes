# Day 0.4 — HTTP / REST / JWT 베이직

> 한 MD 파일만 보고 HTTP·Axios·JWT 기초를 학습할 수 있도록, 개념·코드·이유를 한 흐름으로 정리한 문서입니다.

---

## 목차

1. [HTTP 베이직](#1-http-베이직)
2. [타임아웃·재시도 전략](#2-타임아웃재시도-전략)
3. [Axios 핵심](#3-axios-핵심)
4. [JWT 베이직](#4-jwt-베이직)
5. [정리·확장 학습](#5-정리확장-학습)

---

## 1. HTTP 베이직

### 1.1 HTTP 메서드

| 메서드   | 용도 예시                     | 바디 사용 |
|----------|------------------------------|-----------|
| `GET`    | 리소스 조회, 목록/상세        | 보통 없음 |
| `POST`   | 생성, 로그인, “액션” 수행     | 있음      |
| `PUT`    | 전체 덮어쓰기                 | 있음      |
| `PATCH`  | 일부 필드만 수정              | 있음      |
| `DELETE` | 리소스 삭제                   | 보통 없음 |

- **멱등성**: `GET`·`PUT`·`DELETE`는 같은 요청을 여러 번 해도 결과가 같다고 보는 경우가 많음. `POST`·`PATCH`는 그렇지 않을 수 있음.
- **안전**: `GET`은 서버 상태를 바꾸지 않는다고 가정. 나머지는 “변경” 가능성이 있음.

```typescript
// 메서드별 호출 예 (개념)
GET    /users           → 사용자 목록
GET    /users/1         → ID 1 사용자
POST   /users           → 사용자 생성 (body: { name, email })
PATCH  /users/1         → ID 1 사용자 일부 수정 (body: { name })
PUT    /users/1         → ID 1 사용자 전체 교체 (body: { name, email, ... })
DELETE /users/1         → ID 1 사용자 삭제
```

---

### 1.2 HTTP 상태 코드

서버가 “결과 종류”를 숫자로 알려준다. 클라이언트는 이 값으로 분기한다.

| 대분류 | 범위  | 의미 예시                          |
|--------|-------|------------------------------------|
| 2xx    | 성공  | 200 OK, 201 Created, 204 No Content |
| 3xx    | 리다이렉트 | 301 Moved, 302 Found             |
| 4xx    | 클라이언트 오류 | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found |
| 5xx    | 서버 오류 | 500 Internal Server Error, 502 Bad Gateway, 503 Unavailable |

- **401 Unauthorized**: “인증 필요” 또는 “토큰 만료/무효”. 보통 토큰 재발급·재로그인 플로우와 연결된다.
- **403 Forbidden**: “인증은 됐지만 권한 없음”.
- **4xx vs 5xx**: 4xx는 요청/클라이언트 쪽 문제, 5xx는 서버 쪽 문제로 보고, 재시도 전략을 다르게 두는 경우가 많다.

```typescript
// 상태 코드에 따른 분기 예시
if (response.status >= 200 && response.status < 300) {
  // 성공 → data 사용
  return response.data;
}
if (response.status === 401) {
  // 인증 만료 → 토큰 재발급 또는 로그인 유도
  await reissueToken();
  // 또는 throw new AuthError('need login');
}
if (response.status >= 500) {
  // 서버 오류 → 재시도 또는 에러 토스트
  throw new ServerError(response.status);
}
```

---

### 1.3 헤더 / 쿼리 / 바디

- **헤더(Header)**: 메타 정보. `Content-Type`, `Authorization`, `Accept` 등.
- **쿼리(Query)**: URL 뒤 `?key=value&...`. GET에서 조건·페이징 등을 넘길 때 사용.
- **바디(Body)**: 요청 본문. 주로 POST/PUT/PATCH에서 JSON을 실어 보낸다.

```typescript
// 헤더·쿼리·바디가 함께 쓰이는 예시
const url = '/users?page=1&size=10';   // 쿼리: page, size
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGc...',
};
const body = { name: 'foo', email: 'foo@example.com' };

// GET: 쿼리만 (바디 사용 안 함)
await axios.get(url, { headers });

// POST: 바디 + 헤더
await axios.post('/users', body, { headers });
```

**자주 쓰는 헤더**

| 헤더             | 역할 |
|------------------|------|
| `Content-Type`   | 요청/응답 본문 형식 (예: `application/json`) |
| `Authorization`  | Bearer 토큰 등 인증 정보 |
| `Accept`         | 클라이언트가 원하는 응답 형식 |

---

### 1.4 REST 관례 정리

- **URL = 리소스**: 동사 대신 명사. `/users`, `/orders/1`.
- **메서드 = 동작**: GET 조회, POST 생성, PATCH/PUT 수정, DELETE 삭제.
- **상태 코드로 결과 표현**: 2xx 성공, 4xx 클라이언트 오류, 5xx 서버 오류.

이렇게 “메서드 + 경로 + 상태 코드”만으로도 대부분의 API 의미를 전달하는 게 REST 스타일이다.

---

## 2. 타임아웃·재시도 전략

### 2.1 타임아웃이 필요한 이유

- 네트워크 끊김·서버 부하로 응답이 늦어지면, 요청이 무한히 대기할 수 있음.
- **타임아웃**: “이 시간 안에 응답 없으면 실패로 간주”하고, 사용자에게 에러를 주거나 재시도하게 함.

```typescript
// Axios에서 타임아웃 (ms)
const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10_000,  // 10초
});

// 요청별로 덮어쓰기 가능
await api.get('/slow', { timeout: 30_000 });
```

- 타임아웃에 걸리면 Axios는 `AxiosError`를 던지고, 보통 `code === 'ECONNABORTED'`로 판별한다.

---

### 2.2 재시도 전략 요약

- **언제 재시도할지**: 5xx, 타임아웃, 일시적 네트워크 오류는 “일시적”으로 보고 재시도하는 경우가 많음. 4xx(특히 400, 401, 403)는 같은 요청 그대로 재시도하면 의미 없을 때가 많음.
- **몇 번까지**: 보통 1~3회. 무한 재시도는 피하는 것이 좋음.
- **지수 백오프**: 재시도 간격을 1초 → 2초 → 4초처럼 늘려서, 서버 부하를 조금 완화한다.

```typescript
/**
 * 재시도 가능 여부 판단
 * - 5xx, ECONNABORTED(타임아웃) → 재시도 O
 * - 4xx → 재시도 X (같은 요청 반복해도 성공 가능성 낮음)
 */
function isRetryable(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'ECONNABORTED') {
    return true; // 타임아웃
  }
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as { response?: { status?: number } }).response;
    const status = res?.status;
    if (status != null && status >= 500) return true; // 5xx
  }
  return false;
}

/**
 * 지수 백오프: 1회 1초, 2회 2초, 3회 4초
 */
function delayMs(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 30_000);
}

/**
 * 최대 retryCount번 재시도하는 제네릭 유틸 (개념용)
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retryCount: number = 2,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt === retryCount || !isRetryable(e)) throw e;
      await new Promise((r) => setTimeout(r, delayMs(attempt)));
    }
  }
  throw lastError;
}
```

실제 프로젝트에서는 `catchWithRetry`처럼 “시도 횟수”와 “재시도 가능 여부”를 분리해 두고, 401 같은 건 “재시도”가 아니라 “재발급 후 재요청”으로 처리하는 경우가 많다.

---

## 3. Axios 핵심

### 3.1 인스턴스 — 왜 쓰나

`axios.get(url)`을 매번 부르면, baseURL·timeout·공통 헤더를 요청마다 반복해서 넣기 어렵다. **인스턴스**를 만들어 두면:

- baseURL·timeout·공통 헤더를 한 곳에서 관리하고
- **인터셉터**로 요청/응답을 한꺼번에 가공할 수 있다.

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// baseURL이 자동으로 붙음
const res = await api.get('/users');  // GET https://api.example.com/users
```

---

### 3.2 인터셉터 — 요청/응답 가공

인터셉터는 “요청이 나가기 직전” / “응답이 들어온 직후”에 끼어 들어가 config나 response를 바꾼다.

- **요청 인터셉터**: `Authorization` 주입, 공통 헤더 추가, 로깅 등.
- **응답 인터셉터**: 401 시 토큰 재발급·재시도, 공통 에러 포맷 변환 등.

```typescript
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

type GetToken = () => Promise<string | null> | string | null;

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10_000,
  validateStatus: () => true,  // 아래 3.3 참고
});

// 요청 인터셉터: 매 요청마다 Authorization 주입
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await Promise.resolve(getToken());
  if (token != null && config.headers) {
    config.headers.Authorization = token;
  }
  return config;
});

// 응답 인터셉터: 401이면 “재발급 필요” 로그 등
api.interceptors.response.use((response: AxiosResponse) => {
  if (response.status === 401) {
    console.warn('Reissue or login required');
  }
  return response;
});
```

---

### 3.3 validateStatus — 실패도 응답으로 받기

Axios 기본값은 대략 다음과 같다.

```typescript
// Axios 기본 validateStatus 개념
function defaultValidateStatus(status: number): boolean {
  return status >= 200 && status < 300;
}
```

- **2xx** → Promise resolve → `response` 객체로 넘어감.
- **그 외(4xx, 5xx)** → Promise reject → 호출부는 `AxiosError`를 받음.

그래서 기본 설정이면 401은 **응답 인터셉터의 “성공 콜백”까지 오지 않고**, 에러 쪽으로만 흐른다. “401을 응답 객체처럼 받아서, 한 흐름 안에서 재발급·재시도를 하고 싶다”면 아래처럼 바꾼다.

```typescript
validateStatus: () => true
```

- 의미: “모든 HTTP status를 유효한 응답으로 본다” → 4xx/5xx도 **reject 하지 않고** `response`로 넘긴다.
- 그래서 401도 `then(response => ...)` 쪽에서 `response.status === 401`로 분기할 수 있고, 인터셉터 안에서 reissue 후 재요청하는 패턴을 쓸 수 있다.

```typescript
// validateStatus: () => true 일 때
const res = await api.get('/me');
if (res.status === 401) {
  await reissueToken();
  return api.get('/me');  // 재요청
}
return res.data;
```

---

### 3.4 취소 — AbortSignal

요청이 오래 걸리거나, 사용자가 페이지를 나가는 경우 “이미 나간 요청”을 취소하고 싶을 때 **AbortController / AbortSignal**을 쓰면 된다.

- 브라우저/Node에서 `AbortController` 생성 → `controller.signal`을 요청에 넘긴다.
- `controller.abort()`를 호출하면 해당 signal을 쓰는 요청이 취소된다.
- Axios는 `signal`을 config에 넣어주면 된다.

```typescript
const controller = new AbortController();

// 요청에 signal 연결
api.get('/users', { signal: controller.signal })
  .then((res) => console.log(res.data))
  .catch((err) => {
    if (axios.isCancel(err)) {
      console.log('Request cancelled');
    }
  });

// 나중에 취소
controller.abort();
```

**React에서 예: 컴포넌트 언마운트 시 취소**

```typescript
useEffect(() => {
  const controller = new AbortController();
  api.get('/users', { signal: controller.signal })
    .then(setUsers)
    .catch((e) => !axios.isCancel(e) && setError(e));

  return () => controller.abort();
}, []);
```

- 요약: **인스턴스**로 설정 통일, **인터셉터**로 인증/에러 처리, **validateStatus**로 401을 응답 흐름에 올리고, **AbortSignal**로 불필요한 요청 취소.

---

## 4. JWT 베이직

### 4.1 JWT 구조 (header / payload / signature)

JWT는 `aaaaaa.bbbbbb.cccccc` 처럼 **점(.)으로 구분된 세 부분** 문자열이다.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJleHAiOjE2NDAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

| 부분      | 이름    | 내용 |
|-----------|---------|------|
| 첫 번째   | Header  | 알고리즘(`alg`), 타입(`typ`) 등. Base64URL 인코딩. |
| 두 번째   | Payload | 실제 넣고 싶은 정보(클레임). `sub`, `exp`, `iat` 등. Base64URL 인코딩. |
| 세 번째   | Signature | `base64(header).base64(payload)` + 비밀키로 서명. 위·변조 방지. |

- **Header**: `{"alg":"HS256","typ":"JWT"}` → Base64URL → `eyJhbGc...`
- **Payload**: `{"sub":"user-id","exp":1640000000,"iat":1639900000}` → Base64URL → `eyJzdWI...`
- **Signature**: 서버만 아는 비밀키로 HMAC 등을 적용한 값. 클라이언트는 검증하지 않고, 그대로 `Authorization: Bearer <token>` 에 실어 보낸다.

---

### 4.2 exp — 만료 시각

Payload에 들어가는 **`exp`(Expiration Time)** 는 “이 토큰이 유효한 마지막 시각”이다. **유닉스 타임스탬프(초)** 이다.

- `Date.now()`는 밀리초이므로, 비교 시 `Math.floor(Date.now() / 1000)` 로 초 단위로 맞춘다.
- `현재시각(초) >= exp` 이면 “만료”로 본다.

```typescript
interface JwtPayload {
  exp?: number;  // 초 단위
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

function isExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    const exp = payload.exp ?? 0;
    return Math.floor(Date.now() / 1000) >= exp;
  } catch {
    return true;
  }
}

// 라이브러리 사용 시 (jwt-decode 등)
import { jwtDecode } from 'jwt-decode';
const payload = jwtDecode<{ exp?: number }>(token);
const expired = Math.floor(Date.now() / 1000) >= (payload.exp ?? 0);
```

---

### 4.3 Access Token vs Refresh Token

| 구분        | Access Token   | Refresh Token   |
|-------------|----------------|------------------|
| 용도        | API 요청 시 인증 | Access 만료 시 새 Access 발급용 |
| 수명        | 짧음 (예: 15분~1시간) | 김 (예: 7일~2주) |
| 전송 빈도   | 매 API 요청     | 재발급 API 호출 시만 |
| 저장 위치   | 메모리·짧은 만료 세션 등 | HttpOnly 쿠키·보안 저장소 등 |

- Access가 짧은 이유: 탈취돼도 유효 시간이 짧아서 피해를 줄이기 위함.
- Refresh는 “Access를 다시 받기 위한 열쇠”라서, 노출되면 안 되고 재사용 탐지·갱신 정책이 따로 필요하다.

```typescript
// 개념용: 토큰 쌍 타입
interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}
```

---

### 4.4 재발급 플로우 (Reissue)

흐름 요약:

1. 클라이언트가 Access로 API 호출.
2. 서버가 “Access 만료/무효”라면 401 반환.
3. 클라이언트는 **Refresh Token**으로 “토큰 재발급” 전용 API를 호출.
4. 서버가 Refresh를 검증한 뒤 새 Access(± 새 Refresh) 발급.
5. 클라이언트는 새 Access로 실패했던 요청을 다시 보낸다.

이때 다음을 보통 신경 쓴다.

- **동시 요청**: 여러 API가 동시에 401을 받으면, 재발급을 여러 번 호출하지 않도록 “한 번만 재발급하고 나머지는 그 결과를 기다리게” 한다.
- **Refresh 만료/무효**: 재발급 API가 401/403이면 “로그인 만료”로 보고 로그인 화면으로 보낸다.

```text
[클라이언트]                    [서버]
     |                             |
     |  GET /me                     |
     |  Authorization: Bearer <access>
     | ---------------------------->|
     |                    401       |
     |<----------------------------|
     |                             |
     |  POST /auth/reissue          |
     |  Body: { refreshToken }      |
     | ---------------------------->|
     |                    200       |
     |  { accessToken, ... }        |
     |<----------------------------|
     |                             |
     |  GET /me                     |
     |  Authorization: Bearer <new_access>
     | ---------------------------->|
     |                    200       |
     |<----------------------------|
```

**코드로 보는 재발급 흐름 (개념)**

```typescript
async function reissue(): Promise<string> {
  const refresh = await getRefreshToken();
  if (!refresh || isExpired(refresh)) {
    clearTokens();
    throw new Error('NO_REFRESH_TOKEN_EXIST or expired');
  }

  const res = await fetch('/auth/reissue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error('REISSUE_FAILED');
  }

  const { accessToken, refreshToken: newRefresh } = await res.json();
  await setTokens({ accessToken, refreshToken: newRefresh ?? refresh });
  return accessToken;
}
```

실제 프로젝트에서는 `JwtAuthService.reissue()`가 위 플로우와 `#isUnderReissuance` 같은 플래그로 “동시 재발급”을 막고, 실패 시 `onReissueError`·에러 태그(`REISSUE_FAILED`, `NO_REFRESH_TOKEN_EXIST`)로 로그인 페이지 이동 등을 처리한다.

---

## 5. 정리·확장 학습

### 5.1 이 문서에서 다룬 것

| 주제 | 요약 |
|------|------|
| HTTP 메서드 | GET/POST/PUT/PATCH/DELETE와 용도, 멱등·안전 |
| HTTP 상태 코드 | 2xx 성공, 4xx 클라이언트 오류, 5xx 서버 오류. 401과 토큰 재발급 |
| 헤더/쿼리/바디 | Header 메타정보, Query는 URL `?key=value`, Body는 본문(JSON 등) |
| 타임아웃·재시도 | 타임아웃으로 무한 대기 방지, 5xx/타임아웃만 재시도, 지수 백오프 |
| Axios 인스턴스 | baseURL·timeout·공통 헤더를 한 번에 관리 |
| 인터셉터 | 요청 직전(Authorization 등)/응답 직후(401 처리 등) 가공 |
| validateStatus | `() => true`로 4xx/5xx도 response로 받아 한 흐름에서 처리 |
| AbortSignal | `AbortController#signal`로 요청 취소, 언마운트 시 정리 |
| JWT 구조 | header.payload.signature, exp(초), access vs refresh |
| 재발급 플로우 | 401 → Refresh로 재발급 API → 새 Access로 재요청, 동시 재발급 방지 |

---

### 5.2 한 번에 돌려볼 수 있는 예시 (학습용)

아래는 이 문서 내용을 한 흐름으로 쓰는 최소 예시다. Node에서 `axios`만 있으면 실행 가능하다.

```typescript
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const getToken = () => Promise.resolve('Bearer mock-token');
const getRefreshToken = () => Promise.resolve('refresh-mock');

const api: AxiosInstance = axios.create({
  baseURL: 'https://httpbin.org',
  timeout: 10_000,
  validateStatus: () => true,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token && config.headers) config.headers.Authorization = token;
  return config;
});

api.interceptors.response.use((res) => {
  if (res.status === 401) console.warn('[학습] 401 → reissue 플로우 진입점');
  return res;
});

// 실행
(async () => {
  const res = await api.get('/get');
  console.log('status', res.status, 'data', res.data);
})();
```

---

### 5.3 이후 확장 학습 제안

- **토큰 재발급 + 요청 재시도**: 401 시 인터셉터/서비스 레이어에서 reissue 후, 실패한 요청의 config로 `instance.request(config)` 다시 호출하는 패턴.
- **AxiosError 세부**: `error.response?.status`, `error.response?.data`, `error.code === 'ECONNABORTED'` 로 타임아웃·네트워크 오류·HTTP 오류 구분.
- **Refresh Token 보안**: HttpOnly 쿠키, 재사용 탐지, 로테이션(재발급 시 새 Refresh 발급 후 구 Refresh 무효화).
- **REST 대안**: GraphQL, gRPC 같은 스타일과 “언제 어떤 걸 쓸지” 비교.

---

이 문서만으로도 Day 0.4 범위의 HTTP·REST·JWT·Axios 기초를 개념과 코드 위주로 한 번에 익힐 수 있도록 구성했다. 프로젝트의 `createHttpConfig`·`createHttpService`·`JwtAuthService`·`AuthHttpClientService` 등은 이 흐름을 적용한 구체적 구현이라, 필요할 때 해당 패키지 코드와 같이 보면 된다.
