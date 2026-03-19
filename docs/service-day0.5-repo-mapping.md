# Day 0.5 — packages/service 리포 맵핑(읽기 전용)

이 문서는 `packages/service`의 **이름과 흐름**만 먼저 익히기 위한 읽기 전용 가이드입니다.  
코드까지 포함해 **이 파일 하나만 보고** 전체 구조를 학습할 수 있도록 구성했습니다.

---

## 1. 전체 흐름 요약

```
createHttpConfig(전역 설정)
    ↓
  개별 API별 config 합성 (baseURL, token, headers…)
    ↓
createHttpService(errorHandlerMap)
    ↓
  전역 401 처리 · 재시도 · 중복호출 차단
    ↓
  실제 HTTP 호출 (get/post/patch/put/delete)
    ↓
unpack / unpackResponse / adaptServiceResponse
    ↓
  res.data.data 제거, 성공/실패 타입·에러 형태 표준화
    ↓
HmcException (도메인 에러)
    ↓
useHmcError (UI용 메시지·모달·onErrorConsumed)
```

- **설정·호출**: `createHttpConfig` → `createHttpService`
- **응답 가공**: `unpack` / `unpackResponse` / `adaptServiceResponse`
- **에러 표준화**: `HmcException` → `useHmcError`

---

## 2. createHttpConfig — 전역 + 개별 설정 합성

**역할**: `baseURL`, `getToken`, `timeout`, 공통 `headers` 같은 **전역 설정**과,  
요청마다 다른 `url`, `useAuth`, `params`, `headers` 같은 **개별 설정**을 **한 번에 합성**합니다.

**위치**: `packages/service/src/serviceFunctions/httpCall.ts`

### 핵심 시그니처

```ts
export const createHttpConfig = (globalConfig: HttpGlobalConfig) =>
  async <Request, Response = never, Data = Response>(config: HttpRequestConfig<Request, Response, Data>) => { … }
```

- `globalConfig`: `baseURL`, `getToken`, `timeout`, `headers`
- 반환값: `(config) => Promise<최종 RequestConfig>` 형태의 **비동기 함수**

### 타입 (types.ts)

```ts
export interface HttpGlobalConfig {
  baseURL: string;
  getToken: TokenGetter;  // () => Awaitable<string | null>
  timeout?: number;
  headers?: HttpRequestHeaders;
}

export type HttpRequestConfig<Request, Response, Data = Response> =
  & AxiosRequestConfig<Request>
  & CustomRequestConfig<Response, Data>;  // useAuth? 등
```

### 실제 구현 (요약)

```ts
export const createHttpConfig = (globalConfig: HttpGlobalConfig) =>
  async <Request, Response = never, Data = Response>(config: HttpRequestConfig<Request, Response, Data>) => {
    const { baseURL, getToken, timeout, headers: globalHeaders } = globalConfig;
    const { useAuth = false, method, headers, ...rest } = config;
    const token = useAuth ? await getToken() : null;

    return {
      ...rest,
      headers: resolveHeaders({ ...globalHeaders, ...headers }, token),
      baseURL,
      method,
      timeout,
    };
  };
```

- `useAuth === true`일 때만 `getToken()`을 호출해 `Authorization`에 붙입니다.
- `resolveHeaders`에서 `Content-Type`, 전역 헤더, 개별 헤더, 토큰을 한 번에 합칩니다.

### 사용 예 (주석에서 발췌)

```ts
const httpConfig = createHttpConfig({
  baseURL: 'https://api-service.com',
  getToken: () => '...',
  timeout: 5000,
  headers: {},
});

// 인증 필요
httpConfig({ url: '/api/auth-required', useAuth: true });

// 인증 불필요
httpConfig({ url: '/api/auth-not-required' });
```

**정리**: “이름만” 보면 **createHttpConfig = 전역 설정 + 개별 config를 합쳐서 최종 axios용 config를 만들어 주는 함수**라고 기억하면 됩니다.

---

## 3. createHttpService — 전역 401 처리, 재시도, 중복호출 차단

**역할**:

1. **전역 401 처리**: 401 발생 시 `errorHandlerMap`에 넣어 둔 핸들러(보통 토큰 재발급) 호출.
2. **재시도**: 내부에서 `catchWithRetry`로 실패 시 일정 횟수만큼 재시도.
3. **중복호출 차단**: 401 처리 동안 다른 요청을 막고, 한 요청이 “대표”가 되어 토큰 재발급 후 나머지는 그 결과를 따르게 함.

**위치**: `packages/service/src/serviceFunctions/httpCall.ts`

### 핵심 시그니처

```ts
export const createHttpService = (errorHandlerMap?: HttpErrorHandlerMap): HttpService => { … }
```

- `errorHandlerMap`: `401`, `REISSUE_FAILED`, `NO_REFRESH_TOKEN_EXIST` 등에 대응하는 핸들러.
- 반환: 싱글톤 `HttpService` (`get` / `post` / `patch` / `put` / `delete`).

### 에러 맵 타입 (types.ts)

```ts
export type InternalNetworkError = 401;
export type InternalTokenError = 'REISSUE_FAILED' | 'NO_REFRESH_TOKEN_EXIST';

export type HttpErrorHandlerMap = InternalTokenErrorHandlerMap & InternalNetworkErrorHandlerMap;
// → { 401?, REISSUE_FAILED?, NO_REFRESH_TOKEN_EXIST? }
```

### 흐름 요약 (이름 위주)

1. `requestWithErrorHandler` 안에서 `catchWithRetry(() => performRequest(config))`로 **첫 HTTP 호출 + 재시도**.
2. 에러 없으면 `response` 그대로 반환.
3. 에러가 있고 **401이 아니거나** `errorHandlerMap`이 없으면 → `createHmcException(originalError)`로 **HmcException**을 던져 뷰에서 처리하도록 함.
4. **401이고** `errorHandlerMap`이 있으면:
   - 이미 다른 요청이 401 처리 중인지 `isBlocked()`로 확인.
   - 처리 중이면 `awaitFirstCall()`로 그 결과를 기다렸다가 `Promise.reject(result)`.
   - 처리 중이 아니면 `blockNextCalls()`로 **차단** 걸고,  
     `catchWithRetry`로 `pickErrorHandler(error)(error, config)` 같은 **에러 핸들러 실행**.
5. 핸들러 성공 시 `unblock()` 후 그 결과를 `Promise.reject(result)`로 전달(호출부에서 로그아웃 등 처리).
6. 핸들러도 실패하면 `unblock()` 후 **원본 에러**로 `createHmcException(originalError)` throw.

### 관련 유틸 (common.ts)

- **catchWithRetry**: `try/catch` 대신 `[error, response]` 튜플로 반환하고, 실패 시 `retryCount`만큼 재시도.
- **preventSubsequentCalls**: `blockNextCalls` / `unblock` / `isBlocked` / `awaitFirstCall`로 “첫 요청만 진행하고 나머지는 대기” 패턴 구현.

### 사용 예 (주석에서 발췌)

```ts
const httpService = createHttpService({
  401: () => {},
  NO_REFRESH_TOKEN_EXIST: () => {},
  REISSUE_FAILED: () => {},
});

const getList = (param) => httpService.get(
  httpConfig({ url: '/api/list', useAuth: true, params: param })
);
```

**정리**: **createHttpService**는 “전역 401·토큰 에러 처리 + 재시도 + 동시 401 요청은 한 번만 처리”를 담당하고, 그 외 에러는 **HmcException**으로 올려보냅니다.

---

## 4. HmcException — 도메인 에러 표준화 → useHmcError로 UI 처리

**역할**: 백엔드의 `code` / `message` / `hmcErrorCode`를 **한 가지 형태의 에러 객체**로 통일하고,  
UI에서는 **hmcErrorCode 기준**으로 메시지·모달·후처리를 하도록 합니다.

### 4.1 HmcException 클래스

**위치**: `packages/service/src/adapter/HMCException.ts`

```ts
class HmcException {
  code: number;
  message: string;
  hmcErrorCode: string | null;

  constructor(code: number, message: string, hmcErrorCode?: string) {
    this.code = code;
    this.message = message;
    this.hmcErrorCode = hmcErrorCode || null;
  }
}
```

- HTTP/API 에러를 모두 `code` + `message` + `hmcErrorCode` 세 개로 표현.
- `hmcErrorCode`가 있으면 UI에서 “에러 코드별 메시지 테이블”을 쓰고, 없으면 fallback 메시지를 씁니다.

### 4.2 createHmcException (서비스 레이어에서 쓰임)

**위치**: `packages/service/src/serviceFunctions/error.ts`

```ts
export const createHmcException = (error: HttpResponseError) => {
  const { status, message } = error;
  const response = error.response as AxiosResponse<ApiResponse<unknown>>;

  if (!!response && isResponse.error(response)) {
    const { code, message, hmcErrorCode } = response.data;
    return new HmcException(code, message, hmcErrorCode);
  }
  return new HmcException(status as number, message);
};
```

- Axios 에러가 “HMC 스타일 에러 응답”(`hmcErrorCode` 있음)이면 그걸로, 아니면 `status`/`message`로 HmcException을 만듭니다.

### 4.3 useHmcError — UI 쪽에서 HmcException 처리

**위치**: `packages/service/src/utils/useHmcError/useHmcError.tsx`

**역할**:  
`hmcErrorCode`(또는 fallback)에 맞는 **메시지**를 찾고,  
**어디에 어떻게 보여줄지**(토스트/모달/인라인)는 `errorHandler` 한 곳에서 결정하게 합니다.

시그니처:

```ts
export const useHmcError = (
  globalTable: ErrorMessageTableWithFallback,
  errorHandler: HmcErrorHandler
) => createErrorHandler;  // 반환값은 “팩토리 함수”
```

- `globalTable`: `hmcErrorCode → 메시지` 매핑 + `ERROR_MESSAGE_FALLBACK_KEY`로 fallback.
- `errorHandler`: `{ code, content, rawMessage, onErrorConsumed }` 등을 받아서 실제 UI 동작(모달 열기, 스낵바 등)을 수행.

### getHmcCodeWithMessage (utils.ts)

```ts
export const getHmcCodeWithMessage = (err: unknown, table: ErrorMessageTableWithFallback) => {
  const exception = isHmcException(err) ? err : { hmcErrorCode: '', message: '' };
  const { hmcErrorCode, message } = exception;

  if (!hmcErrorCode) {
    return { code: null, content: table[ERROR_MESSAGE_FALLBACK_KEY], rawMessage: message };
  }
  const code = isKeyOf(table, hmcErrorCode) ? hmcErrorCode : ERROR_MESSAGE_FALLBACK_KEY;
  return { code, content: table[code], rawMessage: message };
};
```

- HmcException(또는 hmcErrorCode 있는 객체)에서 **code**와 **표시할 메시지(content)**를 뽑아줍니다.

### 사용 예 (useHmcError.tsx 주석에서 발췌)

```ts
const createErrorMessage = useHmcError({
  'DMN-ADJUSTER-1421': '결제 비밀번호가 일치하지 않습니다.',
  [ERROR_MESSAGE_FALLBACK_KEY]: '결제에 실패했습니다. 잠시 후 다시 시도해 주세요.',
}, errorHandler);

const { mutate } = useMutation({
  onError: createErrorMessage()
    .onErrorConsumed((code) => {
      if (code === 'DMN-ADJUSTER-1447') invalidate(ticketQuery.ticketAndCard().queryKey);
    }),
});
```

**정리**:  
**HmcException** = 도메인 에러의 표준 형태,  
**useHmcError** = 그걸 UI에서 “메시지 테이블 + 핸들러”로 처리하는 진입점입니다.

---

## 5. unpack / unpackResponse / adaptServiceResponse — data.data 제거 및 DX 향상

**역할**:  
성공 시 `res.data.data`를 매번 손으로 뜯지 않아도 되게 하고,  
실패 시에는 **HmcException**으로 일관되게 던지게 해서 **호출부 코드를 단순하게** 만듭니다.

### 5.1 unpack (함수형 HttpService용)

**위치**: `packages/service/src/serviceFunctions/httpCall.ts`

```ts
export const unpack = async <Response,>(response: Promise<AxiosResponse<Response>>) =>
  (await response as AxiosResponse<PackedResponse<Response>>).data.data;
```

- `AxiosResponse<{ data: T }>`에서 **`data.data`만** 꺼내서 반환합니다.
- 성공 응답만 다룰 때 쓰고, 실패/에러 형태는 이 함수가 변형하지 않습니다.

### 5.2 unpackResponse (성공/실패 분기 + 변환 옵션)

**위치**: `packages/service/src/adapter/unpackResponse.ts`

```ts
export const unpackResponse = async <D, R>(
  promise: Promise<PackedResponse<D>>,
  transformer?: CustomTransformFn<D, R>,
) => {
  const raw = await promise;

  if (isResponse.success(raw)) {
    return (transformer ? transformer(raw) : raw.data.data) as TransformedResponse<D, R>;
  }
  if (isResponse.successWithVoid(raw)) {
    return undefined as TransformedResponse<D, R>;
  }
  if (isResponse.error(raw)) {
    const { code, message, hmcErrorCode } = raw.data;
    throw new HmcException(code, message, hmcErrorCode);
  }
  throw new HmcException(raw.data.code, raw.data.message);
};
```

- **성공**: `transformer`가 있으면 `transformer(raw)` 결과, 없으면 `raw.data.data`.
- **성공(void)**: `undefined`.
- **에러**: `hmcErrorCode` 등으로 `HmcException` 생성 후 throw.
- 그 외: `raw.data`의 `code`/`message`로 HmcException throw.

→ 호출부는 “성공이면 원하는 형태의 데이터, 실패면 HmcException”만 보게 됩니다.

### 5.3 adaptServiceResponse (클래스 전체에 unpackResponse 적용)

**위치**: `packages/service/src/adapter/unpackResponse.ts`

```ts
export function adaptServiceResponse<C extends new (...args: unknown[]) => unknown>(targetClass: C) {
  return new Proxy(targetClass, {
    construct(target, args) {
      const instance = new target(...args) as InstanceType<ResponseUnpackedService<C>>;

      return new Proxy(instance, {
        get(targetInstance, propKey, receiver) {
          const original = targetInstance[propKey as keyof InstanceType<C>];

          if (isFunction(original)) {
            return function (...args: unknown[]) {
              return unpackResponse(original.apply(targetInstance, args));
            };
          }
          return Reflect.get(targetInstance, propKey, receiver);
        },
      });
    },
  }) as ResponseUnpackedService<C>;
}
```

- **클래스 인스턴스**를 감싸서, **메서드 호출 결과**가 Promise면 전부 `unpackResponse`로 한 번 더 감쌉니다.
- 그래서 서비스 클래스를 그대로 쓰면, 메서드 반환 타입이 “`data.data` 뺀 형태”로 바뀌고, 실패는 모두 HmcException으로 나갑니다.

### 사용 예 (README·주석에서 발췌)

**unpackResponse (메서드 단위)**:

```ts
reissueAccessToken(refreshToken: string) {
  return unpackResponse(
    this.post<ReissueAccessTokenResponse>(BASE_AUTH_API_URL.refresh, {}, config),
    (raw) => raw.data.data.Authorization,
  );
}
```

**adaptServiceResponse (클래스 단위)**:

```ts
const PaymentService = adaptServiceResponse(PaymentServiceImpl);
// PaymentService의 모든 메서드가 성공 시 unpack, 실패 시 HmcException
```

**정리**:  
- **unpack**: 단순히 `data.data`만 추출.  
- **unpackResponse**: 성공/실패 분기 + 선택적 `transformer` + 실패 시 HmcException.  
- **adaptServiceResponse**: 클래스 전체 메서드에 unpackResponse를 자동으로 적용해 DX를 올립니다.

---

## 6. 한 페이지로 보는 “이름 + 위치” 치트시트

| 이름 | 역할 한 줄 | 파일 위치 |
|------|------------|-----------|
| **createHttpConfig** | 전역 + 개별 설정 합성 | `serviceFunctions/httpCall.ts` |
| **createHttpService** | 전역 401·재시도·중복호출 차단, 싱글톤 HttpService | `serviceFunctions/httpCall.ts` |
| **catchWithRetry** | try/catch + 제한된 재시도 | `serviceFunctions/common.ts` |
| **preventSubsequentCalls** | 401 처리 중 추가 요청 차단/대기 | `serviceFunctions/common.ts` |
| **createHmcException** | Axios/네트워크 에러 → HmcException | `serviceFunctions/error.ts` |
| **HmcException** | 도메인 에러 표준 (code, message, hmcErrorCode) | `adapter/HMCException.ts` |
| **useHmcError** | HmcException → 메시지 테이블 + UI 핸들러 | `utils/useHmcError/useHmcError.tsx` |
| **getHmcCodeWithMessage** | err + table → code, content, rawMessage | `utils/useHmcError/utils.ts` |
| **unpack** | `res.data.data`만 추출 (함수형용) | `serviceFunctions/httpCall.ts` |
| **unpackResponse** | 성공 unpack/변환, 실패 시 HmcException | `adapter/unpackResponse.ts` |
| **adaptServiceResponse** | 클래스 메서드마다 unpackResponse 적용 | `adapter/unpackResponse.ts` |
| **createTokenReissuer** | 리프레시로 액세스 재발급 + TaggedError | `serviceFunctions/tokenManager.ts` |

---

## 7. 패키지 진입점 (index.ts)

외부에서 쓰는 이름은 대략 다음과 같이 나뉩니다.

- **설정·호출**: `createHttpConfig`, `createHttpService`, `unpack`
- **응답 래핑**: `unpackResponse`, `adaptServiceResponse`
- **에러**: `HmcException`, `isHmcException`, `useHmcError`, `getHmcCodeWithMessage`, `ERROR_MESSAGE_FALLBACK_KEY`
- **토큰**: `createTokenReissuer`
- **클래스형**: `HttpClientService`, `AuthHttpClientService`, `JwtAuthService` 등

이 문서만으로 “이름 + 담당 역할 + 대략적인 코드 위치”까지 한 번에 훑을 수 있도록 했습니다.  
세부 타입·옵션은 각 파일에서 `HttpRequestConfig`, `HttpErrorHandlerMap`, `ErrorMessageTableWithFallback` 등을 따라가면 됩니다.
