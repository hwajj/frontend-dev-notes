# Day 0.8 — Type 유틸리티·타입 가드

> 한 MD 파일만 보고 `packages/type`의 **유틸리티 타입**과 **타입 가드**를 학습할 수 있도록, 개념·코드·이유를 한 흐름으로 정리한 문서입니다.

---

## 목차

1. [타입 가드가 필요한 이유](#1-타입-가드가-필요한-이유)
2. [ES·원시 타입 가드 (es.ts)](#2-es원시-타입-가드-ests)
3. [DOM·React 관련 가드 (dom.ts, react.ts)](#3-domreact-관련-가드-domts-reactts)
4. [유틸리티 타입 (utility/common.ts)](#4-유틸리티-타입-utilitycommonts)
5. [정리·확장 학습](#5-정리확장-학습)

---

## 1. 타입 가드가 필요한 이유

- **런타임 검사와 타입 좁히기**: `typeof x === 'string'` 같은 조건을 한 번 통과하면, 그 분기 안에서는 TypeScript가 `x`를 `string`으로 좁혀 준다.
- **함수로 묶으면 재사용·일관성**: `isString(x)`처럼 “값이 문자열인지”를 함수로 두면, 여러 곳에서 같은 조건을 쓰고 **반환 타입 `value is string`**으로 좁히기까지 한 번에 쓸 수 있다.
- **unknown / any 정리**: API 응답·이벤트 객체 등 `unknown`인 값을 다룰 때, 가드로 한 단계씩 좁혀 나가면 타입 안전하게 처리할 수 있다.

이 레포의 `packages/type`은 **타입 가드**와 **유틸리티 타입**을 한 곳에 두어, form·service·hook 등에서 공통으로 쓸 수 있게 한다.

---

## 2. ES·원시 타입 가드 (es.ts)

**위치**: `packages/type/src/typeGuards/es.ts`

### 2.1 원시·기본 타입

```ts
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isFunction = (value: unknown): value is (...args: any[]) => any => typeof value === 'function';
```

- **`value is string`**: “이 함수가 true를 반환하면, 호출한 쪽 분기 안에서 `value`는 `string`”이라고 컴파일러에 알린다.
- **unknown**: “아무 타입일 수 있음”을 받아서, 가드 통과 시에만 특정 타입으로 좁힌다.

### 2.2 배열·Promise·nullish

```ts
export const isArray = <T>(value: unknown): value is T[] => Array.isArray(value);
export const isPromise = <T>(value: unknown): value is Promise<T> => value instanceof Promise;
export const isNullish = <T>(value: T | null | undefined): value is null | undefined =>
  value === null || value === undefined;
export const isNotNullish = <T>(value: T): value is Exclude<T, null | undefined> =>
  value !== null && value !== undefined;
```

- **isArray&lt;T&gt;** : 배열인지만 검사하고, 요소 타입 `T`는 호출하는 쪽에서 지정한다.
- **isNullish / isNotNullish**: `null | undefined` 제거 시 `Exclude<T, null | undefined>`로 정리할 때 유용하다.

### 2.3 객체·키·배열 포함

```ts
export const isKeyOf = <T extends Record<any, any>>(
  obj: T,
  key: PropertyKey | null | undefined
): key is keyof T => (key ? key in obj : false);

export const isKeysOf = <T extends Record<any, any>>(obj: T, keys: (keyof T)[]) =>
  keys.every((key) => isKeyOf(obj, key));

export const isIn = <A extends unknown[], V extends A[number]>(array: A, value: unknown): value is V =>
  array.includes(value);

export const isPlainObject = <T extends Record<string, unknown>>(value: unknown): value is T =>
  value?.constructor === Object;

export const isNonEmptyObject = <T extends Record<string, unknown>>(value: T): value is T =>
  isPlainObject(value) && Object.keys(value).length > 0;
```

- **isKeyOf**: “이 키가 해당 객체의 키인가?”를 검사하면서 타입을 `keyof T`로 좁힌다. `key in obj`가 타입 단언 없이 안전하게 쓰이도록 돕는다.
- **isIn**: 리터럴 배열 `['a','b','c']`에 대해 “값이 그 중 하나인가?”를 검사하고, 타입을 `A[number]`로 좁힌다.
- **isPlainObject**: `{}` 또는 `Object` 생성자로 만든 객체만 true. `typeof value === 'object'`만 쓰면 `null`도 포함되므로, “실제 객체”인지 구분할 때 유용하다.

---

## 3. DOM·React 관련 가드 (dom.ts, react.ts)

**위치**: `packages/type/src/typeGuards/dom.ts`, `react.ts`

### 3.1 DOM (dom.ts)

```ts
export const isElement = (value: unknown): value is HTMLElement => value instanceof HTMLElement;
export const isElementOf = <T extends HTMLElement>(value: unknown): value is T => value instanceof HTMLElement;
```

- **isElementOf&lt;T&gt;** : 구체적 타입(`HTMLInputElement` 등)을 쓰려면 호출 시 제네릭으로 넘기거나, 사용처에서 추가로 좁히면 된다.

### 3.2 React (react.ts)

```ts
import type { MutableRefObject } from 'react';
import { isPlainObject } from '@type/typeGuards/es';

export const isRefObject = <T>(value: unknown): value is MutableRefObject<T> =>
  isPlainObject<{ current: T | null }>(value);
```

- **isRefObject**: `{ current }` 형태인지 검사해, `MutableRefObject<T>`로 좁힐 때 쓴다. `useRef` 결과나 ref 객체 여부를 확인할 때 사용한다.

---

## 4. 유틸리티 타입 (utility/common.ts)

**위치**: `packages/type/src/utility/common.ts`

```ts
export type Nullable<T = null> = T | null | undefined;

export type IsUnknown<T> = unknown extends T ? (T extends unknown ? true : false) : false;

export type UnionKeys<T> = T extends T ? (keyof T)[] : never;
```

### 4.1 Nullable&lt;T&gt;

- “null 또는 undefined를 허용하는 T”. 인자·반환 타입에서 “없을 수 있음”을 표현할 때 쓴다.
- `Nullable<T = null>`이면 기본적으로 `T | null`을 의미하는 식으로 쓰이도록 한 것이다.

### 4.2 IsUnknown&lt;T&gt;

- **분포 조건부 타입**을 이용해 “T가 정확히 unknown인가?”를 판별한다.
- `unknown extends T` 이면서 `T extends unknown`이면 “어떤 값이든 받을 수 있는 타입”인데, 그게 “실제로 unknown인지”를 구분하기 위한 보조 타입이다.
- form의 `InferredContext`처럼 “context가 없으면 void, 있으면 C”를 나눌 때, “C가 unknown이면 void” 같은 판별에 쓰일 수 있다.

### 4.3 UnionKeys&lt;T&gt;

- **유니온 타입 T**의 각 멤버에 대해 `keyof (해당 멤버)`를 모은 배열 타입이다.
- `T extends T`로 유니온이 분리될 때마다 `keyof T`가 계산되고, 그 결과가 `(keyof T)[]` 형태로 묶인다.
- “이 유니온의 모든 멤버에 공통으로 있는 키”가 아니라 “각 멤버의 키들을 배열로 나열한 타입”에 가깝다.

---

## 5. 레포 내 사용 예

| 사용처 | 용도 |
|--------|------|
| **packages/form** | `isString(field)`로 `string \| RegExp` 분기, Validator/AsyncValidator 내부 |
| **packages/service** | `isKeyOf`, `isPlainObject`, 응답/에러 객체 형태 검사, 타입 단언 대체 |
| **packages/hook** | `isFunction`, `isPlainObject`, `isString`, `isIn` — useParamState·utils 등 |

---

## 6. 정리·확장 학습

### 6.1 정리

- **타입 가드**: `(value: unknown) => value is T` 형태로 “런타임 검사 + 타입 좁히기”를 한 번에 수행.
- **유틸리티 타입**: `Nullable`, `IsUnknown`, `UnionKeys`처럼 “타입만으로 하는 연산”을 재사용할 때 사용.
- **unknown**: 가드로 단계적으로 좁혀 나가는 방식이면, `any`보다 안전하게 “외부 값”을 다룰 수 있다.

### 6.2 확장 학습

- **User-Defined Type Guards**: `parameterName is Type` 문법과, 조건부 반환으로 좁히는 방식.
- **분포 조건부 타입**: `T extends U ? X : Y`에서 T가 유니온이면 각 멤버별로 나뉘어 계산되는 것.
- **keyof·in 연산자**: 매핑 타입·Partial·Pick 등 유틸리티 타입의 기초.

이후 확장 학습 가능 개념: **템플릿 리터럴 타입**, **branded type**, **타입 레벨에서의 재귀·조건문**.

