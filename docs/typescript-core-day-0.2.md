# Day 0.2 — TypeScript 코어 (이 레포 기준)

> 타입 시스템, 제네릭/유틸리티, 타입가드, tsconfig 옵션을 **이 레포(backoffice-shared) 코드**를 기준으로 정리합니다.  
> MD만 읽어도 학습이 되도록 개념·코드·실습을 한 문서에 담았습니다.

---

## 1. 타입 시스템

### 1.1 Union(합집합)과 Intersection(교집합)

- **Union `A | B`**: “A이거나 B인 값” — 런타임에는 **그중 하나**만 가짐.
- **Intersection `A & B`**: “A이면서 B인 값” — 객체 타입에서는 **모든 프로퍼티를 동시에** 가져야 함.

**레포 예: `packages/service/src/serviceFunctions/types.ts`**

```ts
export type HttpRequestConfig<Request, Response, Data = Response> =
  & AxiosRequestConfig<Request>
  & CustomRequestConfig<Response, Data>;
```

`HttpRequestConfig`는 `AxiosRequestConfig`의 모든 필드 **그리고** `CustomRequestConfig`의 모든 필드를 동시에 만족해야 합니다.

**Union 예: 유틸리티 타입**

```ts
// packages/service/src/serviceFunctions/types.ts
export type Awaitable<T> = Promise<T> | T;
```

`Awaitable<T>`는 “Promise이거나 T” — 동기·비동기 모두 받을 수 있게 합니다.

**Union + 리터럴**

```ts
/** 내부에서 처리할 수 있는 네트워크 에러(status code) */
export type InternalNetworkError = 401;

/** 내부에서 처리할 수 있는 토큰 관련 에러 */
export type InternalTokenError = 'REISSUE_FAILED' | 'NO_REFRESH_TOKEN_EXIST';
```

`InternalTokenError`는 문자열이 아니라 **이 두 리터럴 중 하나**만 허용합니다.

---

### 1.2 Literal과 Enum

- **리터럴 타입**: `'a'`, `1`, `true`처럼 **값 그 자체**가 타입이 되는 것.
- **Enum**: 이름 붙인 상수 집합. 이 레포에서는 **문자열/숫자 리터럴 유니온**을 타입으로 쓰는 패턴이 많습니다.

**레포 예: 에러 태그를 리터럴 유니온으로**

```ts
type InternalTokenError = 'REISSUE_FAILED' | 'NO_REFRESH_TOKEN_EXIST';

type InternalTokenErrorHandlerMap = {
  [tag in InternalTokenError]?: HttpErrorHandler;
};
```

`[tag in InternalTokenError]`는 매핑 타입으로, 키를 `'REISSUE_FAILED' | 'NO_REFRESH_TOKEN_EXIST'`로 제한합니다.

**Enum을 쓰지 않고 리터럴 유니온을 쓰는 이유(이 레포 스타일)**  
- 번들 크기·Tree-shaking에 유리하고, JSON 직렬화와 맞기 쉽습니다.  
- 타입/값이 분리되지 않고 “이 문자열/숫자만 허용”이 명확합니다.

---

### 1.3 타입 추론 (Type Inference)

- **변수**: `const x = 1` → `x`는 `number`로 추론.
- **함수 반환값**: 인자 타입과 내부 로직으로 반환 타입이 추론됨.
- **제네릭**: 인자나 사용처로 타입 인자가 추론됨.

**레포 예: 제네릭 추론**

```ts
// packages/service/src/serviceFunctions/httpCall.ts
const performRequest = async <Request, Response, Data>(
  config: Awaitable<HttpRequestConfig<Request, Response, Data>>
) => {
  const { useAuth, ...rest } = await config;
  const response = await axios<Response>(rest);
  return response;
};
```

`performRequest({ url: '/user', method: 'GET' })`처럼 호출하면 `Request`/`Response`/`Data`가 사용처에서 추론됩니다.

---

### 1.4 좁히기 (Narrowing)

- **Narrowing**: “지금 이 분기에서는 타입이 더 좁다”라고 컴파일러가 판단하게 하는 것.
- 방법: `typeof`, `instanceof`, `in`, **리터럴 비교**, **타입 가드**(`x is T`) 등.

**`typeof` / `in` 예**

```ts
if (typeof key === 'string' && key in obj) {
  // 여기서 key는 string이고, obj에 key가 있음
}
```

**타입 가드로 좁히기(아래 3절에서 계속)**

```ts
if (isPlainObject(value)) {
  // value는 Record<string, unknown>으로 좁혀짐
}
```

---

### 1.5 `unknown` vs `any`

| 구분       | `any`                  | `unknown`                          |
|------------|------------------------|------------------------------------|
| 할당       | 어떤 타입이든 가능     | 어떤 타입이든 가능                 |
| 사용       | 어떤 연산이든 허용     | **타입을 좁히기 전에는 거의 사용 불가** |
| 타입 안전성| 없음                   | 사용 전 반드시 검사/단언 필요      |

**레포에서는 외부 입력·에러는 `unknown`으로 두고, 가드로 좁히는 패턴**을 씁니다.

**레포 예: `packages/service/src/HttpClientService/types.ts`**

```ts
export function isHmcErrorCode(err: unknown): err is string {
  return isString(err) && !!err.match(/^[A-Z]+-(?:[a-zA-Z]+-)+\d+$/);
}
```

`err`를 `unknown`으로 받고, `err is string` 가드로 좁힌 뒤에만 문자열로 사용합니다.

**에러 핸들러 시그니처**

```ts
// packages/service/src/serviceFunctions/types.ts
export type HttpErrorHandler = <Request, Response, Data>(
  error: unknown,
  config: Awaitable<HttpRequestConfig<Request, Response, Data>>
) => Awaitable<unknown>;
```

`error`를 `unknown`으로 두면, 호출하는 쪽에서 `typeof`·`instanceof`·커스텀 가드로 안전하게 좁힐 수 있습니다.

---

## 2. 제네릭 / 유틸리티 타입

### 2.1 제네릭 함수·타입

- **제네릭**: “나중에 구체 타입을 채워 넣는 자리”를 타입 변수로 두는 문법.
- 함수·클래스·타입 별칭·인터페이스에 모두 쓸 수 있습니다.

**레포 예: 제네릭 타입**

```ts
// packages/service/src/serviceFunctions/types.ts
export type Awaitable<T> = Promise<T> | T;

export type TokenGetter = () => Awaitable<string | null>;
```

**제네릭 함수**

```ts
// packages/service/src/serviceFunctions/common.ts
export const catchWithRetry = async <T, E = unknown>(
  fn: (error?: E) => Awaitable<T>,
  retryCount = 0
) => {
  // ...
  return [error, response] as TryCatchReturn<T, E>;
};
```

`T`는 성공 값 타입, `E`는 에러 타입이며 기본값은 `unknown`입니다.

---

### 2.2 자주 쓰는 유틸리티: `Partial`, `Pick`, `ReturnType`

- **`Partial<T>`**: `T`의 모든 프로퍼티를 선택적(`?`)으로 만든 타입.
- **`Pick<T, K>`**: `T`에서 키 `K`만 뽑은 타입.
- **`ReturnType<T>`**: 함수 타입 `T`의 반환 타입.

**레포 예: `packages/type/src/utility/common.ts`**

```ts
export type Nullable<T = null> = T | null | undefined
```

직접 정의한 유틸리티 타입입니다. `Partial`/`Pick`은 레포에서도 일반적인 용도로 사용 가능합니다.

```ts
// 사용 예 (개념)
type User = { id: number; name: string };
type UserUpdate = Partial<User>;           // { id?: number; name?: string }
type UserId = Pick<User, 'id'>;           // { id: number }
type F = () => Promise<Response>;
type R = ReturnType<F>;                   // Promise<Response>
```

---

### 2.3 조건부 타입 (Conditional Type)과 분배 조건부 (Distributive Conditional)

- **조건부 타입**: `T extends U ? X : Y` — “T가 U에 할당 가능하면 X, 아니면 Y”.
- **분배 조건부**: `T extends U ? X : Y`에서 `T`가 유니온이면, **각 멤버마다** 조건이 적용된 결과의 유니온이 됩니다.

**레포 예: `packages/type/src/utility/common.ts`**

```ts
export type IsUnknown<T> = unknown extends T ? (T extends unknown ? true : false) : false;

export type UnionKeys<T> = T extends T ? (keyof T)[] : never;
```

- `UnionKeys<T>`에서 `T extends T`는 분배가 일어나게 하는 트릭입니다.  
  `T`가 `A | B`일 때 `(keyof A)[] | (keyof B)[]`가 되고, 보통 더 쓸 때는 `(keyof A | keyof B)[]` 형태로 조합해 사용합니다.

**단순 조건부 예**

```ts
type Flatten<T> = T extends Array<infer U> ? U : T;
type A = Flatten<string[]>;   // string
type B = Flatten<number>;     // number
```

---

### 2.4 매핑 타입 (Mapped Type)

- **문법**: `{ [K in keyof T]: ... }` — `T`의 각 키 `K`에 대해 새 타입을 계산합니다.
- **`as`로 키 변경**: `{ [K in keyof T as NewKey]: ... }`처럼 키를 바꿀 수 있습니다.

**레포 예: `packages/service/src/serviceFunctions/types.ts`**

```ts
type InternalTokenError = 'REISSUE_FAILED' | 'NO_REFRESH_TOKEN_EXIST';

type InternalTokenErrorHandlerMap = {
  [tag in InternalTokenError]?: HttpErrorHandler;
};
```

`[tag in InternalTokenError]`는 “이 리터럴 유니온의 각 값이 키”인 객체 타입입니다.  
`HttpErrorHandlerMap`은 이런 맵 타입들의 교집합으로, “특정 태그만 키로 가진 핸들러 맵”을 표현합니다.

---

## 3. 타입 가드 — 사용자 정의 가드로 런타임 안정성 확보

- **타입 가드**: `(x: unknown) => x is T` 형태로, “이 조건이 맞으면 여기서는 `x`를 `T`로 취급해도 된다”라고 컴파일러에 알려주는 함수.
- `typeof`·`instanceof`만으로는 한계가 있으므로, **`isPlainObject`**, **`isKeyOf`** 같은 사용자 정의 가드가 이 레포의 핵심 도구입니다.

### 3.1 `isPlainObject` — “일반 객체”인지 검사

**정의: `packages/type/src/typeGuards/es.ts`**

```ts
export const isPlainObject = <T extends Record<string, unknown>>(
  value: unknown
): value is T => value?.constructor === Object;
```

- `value?.constructor === Object`: `{}` 또는 `Object.create(null)`이 아닌, **`Object`로 생성된 일반 객체**만 통과.
- `new Date()`, 배열, `function` 등은 걸러집니다.

**사용 예: `packages/service/src/HttpClientService/types.ts`**

```ts
export const isResponse = {
  success: <D>(res: AxiosResponse<ApiResponse<D>>): res is AxiosResponse<SuccessApiResponse<D>> => {
    return !isAxiosError(res) && isPlainObject(res.data) && isKeyOf(res.data, 'data');
  },
  error: <D>(res: AxiosResponse<ApiResponse<D>>): res is AxiosResponse<ErrorApiResponse> => {
    return isPlainObject(res.data) && isKeyOf(res.data, 'hmcErrorCode');
  },
};
```

`res.data`를 쓸 때 “객체이고, 그다음에 특정 키가 있다”를 단계적으로 좁히기 위해 `isPlainObject`를 먼저 사용합니다.

---

### 3.2 `isKeyOf` — “이 객체의 키이다” 검사

**정의: `packages/type/src/typeGuards/es.ts`**

```ts
export const isKeyOf = <T extends Record<any, any>>(
  obj: T,
  key: PropertyKey | null | undefined
): key is keyof T => (key != null && key in obj) || false;
```

- `key in obj`로 **실제로 그 키가 있는지** 런타임 검사.
- `key is keyof T`로 TypeScript에게 “이제 이 `key`는 `T`의 키로 써도 된다”라고 알립니다.

**사용 예: `packages/component/src/Input/Text/utils.ts`**

```ts
.map((rule) => isKeyOf(CHAR_SET, rule) ? CHAR_SET[rule] : '')
```

`rule`이 `CHAR_SET`의 키일 때만 `CHAR_SET[rule]`을 써서 타입 에러가 나지 않습니다.

**사용 예: `packages/service/src/utils/useHmcError/utils.ts`**

```ts
const code = isKeyOf(table, hmcErrorCode) ? hmcErrorCode : ERROR_MESSAGE_FALLBACK_KEY;
```

`hmcErrorCode`가 `table`의 키인지 확인한 뒤, 그 키로 접근합니다.

---

### 3.3 `isNonEmptyObject` — “비어 있지 않은 일반 객체” 가드

**정의: `packages/type/src/typeGuards/es.ts`**

```ts
export const isNonEmptyObject = <T extends Record<string, unknown>>(
  value: T
): value is T => isPlainObject(value) && Object.keys(value).length > 0;
```

**사용 예: `packages/hook/src/useGlobalEvent/useGlobalEvent.ts`**

```ts
const getEventData = useNonReactivity({
  type,
  options: isNonEmptyObject(options) ? options : undefined,
  handler,
});
```

`options`가 `{}`가 아니라 “키가 하나 이상 있는 객체”일 때만 넘기고, 아니면 `undefined`로 넘깁니다.

---

### 3.4 `isHmcErrorCode` — “HMC 에러 코드 문자열” 가드

**정의: `packages/service/src/HttpClientService/types.ts`**

```ts
/**
 * API 호출부에서 throw한 것이 hmcErrorCode 형식인지 확인
 * **[대문자]-[대소문자]-[숫자]** 패턴
 */
export function isHmcErrorCode(err: unknown): err is string {
  return isString(err) && !!err.match(/^[A-Z]+-(?:[a-zA-Z]+-)+\d+$/);
}
```

**사용 예: `isHmcException` 안에서**

```ts
if (isPlainObject(err) && isKeyOf(err, 'hmcErrorCode')) {
  return isHmcErrorCode(err.hmcErrorCode) || (!err.hmcErrorCode && isString(err.message));
}
```

`err`가 객체이고 `hmcErrorCode` 키를 가질 때, 그 값이 HMC 에러 코드 문자열인지 재귀적으로 검사합니다.

---

## 4. tsconfig 옵션 이해 (이 레포 기준)

**기준 파일: `tsconfig.base.json`**

### 4.1 `strict: true`

- `strict`가 켜지면 그 안에 `strictNullChecks`, `strictFunctionTypes`, `noImplicitAny` 등이 포함됩니다.
- **이유**: `null`/`undefined`·함수 시그니처·암시적 `any`를 줄여서 런타임 전에 더 많은 오류를 잡기 위함입니다.
- 이 레포는 서비스·훅·컴포넌트에서 `unknown`·타입 가드를 쓰는 스타일이므로, `strict`와 잘 맞습니다.

---

### 4.2 `moduleResolution: "bundler"`

- **의미**: 타입 해석 시 “번들러가 해석하는 방식”을 기준으로 `node_modules`의 `exports`·서브패스 등을 따릅니다.
- **`"node"` / `"node16"`**: Node처럼 디스크에 있는 파일을 찾는 방식.
- **`"bundler"`**: Vite·webpack 등 번들러가 최종적으로 해결할 방식에 맞춰, ESM·`import` 조건을 더 정확히 반영합니다.
- 이 레포는 Vite 기반이므로 `"bundler"`가 맞는 선택입니다.

---

### 4.3 `noUncheckedSideEffectImports: true`

- **의미**: “사이드 이펙트만 있는” import를 허용하지 않습니다.
- 예: `import './register'`처럼 **타입·값을 쓰지 않고** 부수 효과만 기대하는 import.
- **이유**: 이런 import는 타입만 보고는 “쓰이는지” 판단하기 어렵고, 번들/로드 순서에 숨은 의존이 생기기 쉽습니다. 명시적으로 “초기화 스크립트”로 분리하거나, 진짜로 사용하는 모듈만 import하도록 유도합니다.

---

### 4.4 Path Alias

**`tsconfig.base.json` 예:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@component/*": ["packages/component/src/*"],
      "__@hook__/*": ["packages/hook/src/*"],
      "@route/*": ["packages/route/src/*"],
      "@type/*": ["packages/type/src/*"],
      "@demo/*": ["demo/src/*"]
    }
  }
}
```

- **`paths`**: “`@component/Modal`을 썼을 때 → `packages/component/src/Modal`로 해석”처럼, **컴파일 시점**에만 쓰입니다.
- **실제 번들에서 동작**하려면 Vite(또는 사용 중인 번들러)의 `resolve.alias`에 같은 매핑을 두어야 합니다.  
  이 레포의 `packages/service`는 자체 `tsconfig`에서 `"__@service__/*": ["src/*"]`처럼 패키지 내부 별칭을 추가로 씁니다.

---

## 5. 실습

### 5.1 `Awaitable<T>`와 동일 기능 직접 구현 + 사용처 2곳 적용

**목표**: `Promise<T> | T`를 “동기값 또는 Promise”로 쓰기 위한 타입을 직접 정의하고, 실제 사용처 두 군데에 연결해 보기.

**1) 타입 정의 (레포와 동일한 의미)**

```ts
// Awaitable<T>: 이미 Promise면 그대로, 아니면 T로 두고 await 시 T가 됨
export type Awaitable<T> = Promise<T> | T;
```

**2) 사용처 1 — `catchWithRetry` (`packages/service/src/serviceFunctions/common.ts`)**

```ts
import type { Awaitable } from './types';

export const catchWithRetry = async <T, E = unknown>(
  fn: (error?: E) => Awaitable<T>,
  retryCount = 0
) => {
  let retry = 0;
  let response: T | null = null;
  let error: E | null = null;

  if (retryCount < 0 || retryCount > 5) {
    throw new Error('retryCount must be between 0 and 5.');
  }
  while (retry <= retryCount) {
    try {
      response = await fn(error ?? undefined);
      error = null;
      break;
    } catch (err) {
      error = err as E;
      retry++;
    }
  }
  return [error, response] as TryCatchReturn<T, E>;
};
```

여기서 `fn`의 반환 타입이 `Awaitable<T>`이므로, `fn()`이 동기값을 돌려줘도 `await fn(...)` 한 번으로 항상 `T`로 다룰 수 있습니다.

**3) 사용처 2 — `performRequest` / `requestWithErrorHandler` (`packages/service/src/serviceFunctions/httpCall.ts`)**

```ts
const performRequest = async <Request, Response, Data>(
  config: Awaitable<HttpRequestConfig<Request, Response, Data>>
) => {
  const resolved = await config;  // config가 함수여도 Promise여도 동기 객체여도 한 번에 해소
  const { useAuth, ...rest } = resolved;
  const response = await axios<Response>(rest);
  return response;
};
```

그리고 `createHttpService` 내부의 `get`/`post`/… 시그니처도:

```ts
get: <Response>(config: Awaitable<HttpRequestConfig<void, Response>>) => requestWithErrorHandler(withMethod('GET', config)),
post: <Response, Request = unknown>(config: Awaitable<HttpRequestConfig<Request, Response>>) => requestWithErrorHandler(withMethod('POST', config)),
// ...
```

처럼 `config`를 `Awaitable<...>`로 두면, “설정 객체를 넘길지, 설정을 반환하는 Promise/함수를 넘길지”를 하나의 타입으로 통일할 수 있습니다.

**정리**: `Awaitable<T>`를 직접 구현해 두었고, 그 사용처는  
- **공통 유틸** `catchWithRetry`의 콜백 반환 타입,  
- **HTTP 레이어**의 `config` 인자 및 `HttpService` 메서드 시그니처  
두 군데에 적용되어 있습니다.

---

### 5.2 `isNonEmptyObject` / `isHmcErrorCode` 스타일의 타입 가드 2개 작성 및 테스트

레포에 이미 `isNonEmptyObject`·`isHmcErrorCode`가 있으므로, **같은 스타일**로  
- “비어 있지 않은 배열” 가드 1개  
- “특정 에러 코드 형식”을 검사하는 가드 1개  
를 추가해 보는 예시를 다룹니다.

**1) `isNonEmptyArray<T>` — 비어 있지 않은 배열**

```ts
// packages/type/src/typeGuards/es.ts 에 추가한다고 가정
export const isNonEmptyArray = <T>(value: unknown): value is [T, ...T[]] =>
  Array.isArray(value) && value.length > 0;
```

- `[T, ...T[]]`는 “최소 한 요소가 있는 배열”을 타입으로 표현한 것입니다.
- 테스트 예:

```ts
import { describe, it, expect } from 'vitest'; // 또는 jest
import { isNonEmptyArray } from './es';

describe('isNonEmptyArray', () => {
  it('빈 배열이면 false', () => {
    expect(isNonEmptyArray([])).toBe(false);
  });
  it('배열이 아니면 false', () => {
    expect(isNonEmptyArray(null)).toBe(false);
    expect(isNonEmptyArray({ length: 1 })).toBe(false);
  });
  it('요소가 1개 이상인 배열이면 true', () => {
    expect(isNonEmptyArray([1])).toBe(true);
    expect(isNonEmptyArray([1, 2, 3])).toBe(true);
  });
});
```

**2) `isHmcErrorCode` 스타일의 “에러 코드 문자열” 가드 — `isBackofficeErrorCode`**

레포의 `isHmcErrorCode`는 `^[A-Z]+-(?:[a-zA-Z]+-)+\d+$` 패턴을 사용합니다. 같은 방식으로, “백오피스 전용 접두어 + 코드” 형식을 검사하는 가드를 둘 수 있습니다.

```ts
// 예: BACKOFFICE-XXX-123 형식만 허용
const BACKOFFICE_CODE_REGEX = /^BACKOFFICE-[A-Z]+-\d+$/;

export function isBackofficeErrorCode(err: unknown): err is string {
  return typeof err === 'string' && BACKOFFICE_CODE_REGEX.test(err);
}
```

테스트 예:

```ts
describe('isBackofficeErrorCode', () => {
  it('문자열이 아니면 false', () => {
    expect(isBackofficeErrorCode(null)).toBe(false);
    expect(isBackofficeErrorCode(123)).toBe(false);
  });
  it('형식이 맞지 않으면 false', () => {
    expect(isBackofficeErrorCode('OTHER-PREFIX-1')).toBe(false);
    expect(isBackofficeErrorCode('BACKOFFICE-')).toBe(false);
  });
  it('BACKOFFICE-XXX-N 형식이면 true', () => {
    expect(isBackofficeErrorCode('BACKOFFICE-AUTH-401')).toBe(true);
  });
});
```

**정리**:  
- `isNonEmptyObject` / `isNonEmptyArray`처럼 “형태 + 비어 있지 않음”을 검사하는 가드로 **객체/배열**을 안전하게 좁히고,  
- `isHmcErrorCode` / `isBackofficeErrorCode`처럼 **에러 코드 문자열**을 패턴으로 검사하는 가드를 두면,  
`unknown`으로 들어온 값을 사용하기 전에 일관되게 검사할 수 있습니다.

---

## 6. 이어서 확장해서 볼 것

- **템플릿 리터럴 타입**: `\`${Uppercase<Key>}-${string}\`` 형태로 문자열 패턴을 타입 레벨에서 표현.
- **`satisfies`**: “추론은 그대로 두되, 타입이 어떤 조건을 만족하는지” 검사할 때 사용.
- **Branded type**: `string` 같은 원시 타입에 “의미”를 붙여, 같은 문자열이라도 혼용하지 않게 하는 패턴.
- **`infer`**: 조건부 타입 안에서 “여기서 반환 타입/요소 타입을 추출”하는 데 사용.

이 문서의 타입 시스템·제네릭·타입 가드·tsconfig를 이해한 뒤, 위 항목들을 보면 “이 레포에서 왜 `unknown`·가드·Awaitable·path alias를 이렇게 쓰는지”와 자연스럽게 연결됩니다.
