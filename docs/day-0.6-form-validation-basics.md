# Day 0.6 — Form / Validation 베이직

> **이 MD 파일만** 보고 `packages/form`의 Validator·AsyncValidator와 폼 검증 기초를 학습할 수 있도록, 개념·코드·이유를 한 흐름으로 정리한 문서입니다.  
> TypeScript의 `satisfies`를 처음 보는 경우에도 [2.2절](#22-satisfies-한-번에-이해하기)만 읽으면 “configs에 왜 satisfies를 쓰는지”까지 이해할 수 있게 구성했다.

---

## 목차

1. [폼 검증이 필요한 이유](#1-폼-검증이-필요한-이유)
2. [Validator — 동기 검증](#2-validator--동기-검증)
   - [2.2 `satisfies` 한 번에 이해하기](#22-satisfies-한-번에-이해하기) ← **configs에 꼭 쓰는 이유**
3. [AsyncValidator — 비동기 검증·재시도](#3-asyncvalidator--비동기-검증재시도)
4. [타입 추론: InferredForm / InferredError](#4-타입-추론-inferredform--inferrederror)
5. [정리·확장 학습](#5-정리확장-학습)

---

## 1. 폼 검증이 필요한 이유

- **입력값 유효성**: 빈 값, 형식 오류, 길이 제한, 중복 여부 등을 서버 요청 전에 먼저 걸러낼 수 있다.
- **UX**: “어느 필드가 문제인지” 바로 알려주면 사용자가 수정하기 쉽다.
- **구조화**: 필드별 `isValid`·`errorMessage`·`ignoreWhen`을 설정으로 두면, “검증 규칙”과 “UI 표시”를 분리해서 다룰 수 있다.

이 레포의 `packages/form`은 **설정 객체 하나로 필드별 검증 규칙**을 정의하고, **checkAll** 한 번에 전체 검증 결과를 돌려주는 방식이다.

---

## 2. Validator — 동기 검증

**역할**: `(form, context?)`를 받아 각 필드의 `isValid`를 **동기적으로** 실행하고, 실패한 필드들의 `errorMessage`를 모아서 반환한다.

**위치**: `packages/form/src/Validator/Validator.ts`

### 2.1 타입 (types.ts)

```ts
export type ValidateFn<F, C> = (form: F, context: C) => boolean;

interface BaseFieldConfig<F, C> {
  isValid: ValidateFn<F, C> | AsyncValidateFn<F, C>;
  ignoreWhen?: (form: F, context: C) => boolean;
  errorMessage: unknown;
}

export interface FieldConfig<F, C> extends BaseFieldConfig<F, C> {
  isValid: ValidateFn<F, C>;  // 동기만
}

export type ValidatorConfigs<F, C = void> = Record<string, FieldConfig<F, C>>;
```

- **F**: 폼 데이터 타입.
- **C**: 검증 시 추가로 쓰는 컨텍스트(옵션). `void`면 컨텍스트 없이 `(form)`만 받음.
- **ignoreWhen**: `true`면 해당 필드 검증을 건너뜀. 조건부 필드(예: “선택 시에만 검사”)에 유용.

### 2.2 `satisfies` 한 번에 이해하기

**아래만 읽어도** `configs satisfies ValidatorConfigs<...>` 를 이해할 수 있도록, `satisfies`의 의미·`: 타입`과의 차이·이 레포에서 configs에 쓰는 이유를 정리한다.

#### satisfies란?

TypeScript 4.9에서 도입된 **타입 연산자**다.

- **문법**: `식 satisfies 타입`
- **의미**: “이 식이 해당 타입을 **만족하는지** 검사만 하고, **식의 추론 타입은 그대로 둔다**.”

즉, “형태가 맞는지(구조 검사)”는 하면서, “변수 타입을 그 타입으로 덮어쓰지”는 않는다.

#### `: 타입`과 무엇이 다른가?

| 구분 | `const x: T = { ... }` | `const x = { ... } satisfies T` |
|------|------------------------|----------------------------------|
| **검사** | 할당 가능한지 검사 | “만족하는지” 검사 (동작은 비슷) |
| **x의 타입** | **T**로 고정됨 (넓어진 타입) | **리터럴/추론된 타입** 유지 (좁은 타입) |
| **키/값** | `T` 쪽 정의에 끌려감. `Record<string, ...>`면 키가 `string` 등으로 넓어질 수 있음 | `{ email: {...}, name: {...} }` 처럼 **실제 키·값이 그대로** 남음 |

**예시로 비교**:

```ts
type ValidatorConfigs<F> = Record<string, { isValid: (form: F) => boolean; errorMessage: string }>;

type MyForm = { email: string };

// (1) : 타입 을 쓴 경우
const a: ValidatorConfigs<MyForm> = {
  email: { isValid: (f) => !!f.email, errorMessage: '필수' },
};
// a 의 타입 = ValidatorConfigs<MyForm>
// keyof typeof a → string (Record라서 키가 string으로 넓어짐)

// (2) satisfies 를 쓴 경우
const b = {
  email: { isValid: (f: MyForm) => !!f.email, errorMessage: '필수' },
} satisfies ValidatorConfigs<MyForm>;
// b 의 타입 = { email: { isValid: ...; errorMessage: string } }
// keyof typeof b → 'email' (실제 키가 그대로 유지됨)
```

- **(1)**에서는 `a`가 `ValidatorConfigs<MyForm>`로 “넓어지기” 때문에, “configs 객체만 보고 폼 타입·키를 복원”하는 타입 연산(`InferredForm<typeof a>` 등)이 정확히 동작하기 어렵거나 덜 쓸모 있게 될 수 있다.
- **(2)**에서는 `b`가 **객체 리터럴의 추론 타입**을 유지하므로, `InferredForm<typeof b>` 같은 걸 쓰면 “실제로 정의한 필드(email 등)”에서 **F를 끌어오는** 패턴이 잘 맞는다.

#### 이 레포에서 configs에 satisfies를 쓰는 이유

- **구조 검사**: `configs`가 `ValidatorConfigs<F>` 형태인지는 컴파일 시점에 검사하고 싶다. → `satisfies ValidatorConfigs<F>` 가 “이 객체가 그 타입을 만족한다”를 검사해 준다.
- **타입 추론 유지**: `new Validator(configs)` 내부에서는 `InferredForm<Configs>`, `InferredError<Configs>` 처럼 **Configs = typeof configs** 로 F·에러 타입을 끌어쓴다. 이때 `configs`의 타입이 “실제 키·필드가 보존된 좁은 타입”이어야, `InferredForm<typeof configs>` 가 `{ email: string; name: string }` 같은 **의도한 폼 타입**으로 잘 나온다.

정리하면, **“형태는 ValidatorConfigs에 맞추되, 변수 타입은 리터럴 그대로 두자”**가 목적이고, 그걸 **한 번에** 해주는 게 `satisfies`다.

#### satisfies를 안 쓰면 어떻게 되나?

- `as ValidatorConfigs<F>` 로만 쓰면: 타입 검사가 우회될 수 있어, 잘못된 config를 넣어도 컴파일러가 못 잡을 수 있다.
- `: ValidatorConfigs<F>` 로만 쓰면: configs 타입이 넓어져서, `InferredForm<typeof configs>` 같은 추론이 “키 이름·폼 타입”을 정확히 복원하기 어렵다.

그래서 이 레포의 Validator/AsyncValidator 예시에는 **`configs satisfies ValidatorConfigs<MyForm>`** 를 쓰라고 하는 것이다.

### 2.3 사용 예시

아래에서는 위 [2.2](#22-satisfies-한-번에-이해하기)에서 정리한 대로, **구조 검사 + 타입 추론 유지**를 위해 `satisfies ValidatorConfigs<...>` 를 사용한다.

```ts
const configs = {
  email: {
    isValid: (form: { email: string }) => /^[^@]+@[^@]+$/.test(form.email),
    errorMessage: '올바른 이메일 형식이 아닙니다.',
  },
  name: {
    isValid: (form: { name: string }) => form.name.length >= 2,
    ignoreWhen: (form) => !form.name,
    errorMessage: '이름은 2자 이상이어야 합니다.',
  },
} satisfies ValidatorConfigs<{ email: string; name: string }>;

const validator = new Validator(configs);
const result = validator.checkAll({ email: 'a@b.com', name: '홍길동' });

result.isValid;       // true/false
result.getFirstError(); // 첫 번째 에러 메시지
result.getAllErrors();  // [{ key, errorMessage }, ...]
result.isErrorOf('email', result.getFirstError()); // 해당 필드가 첫 에러인지
```

**`satisfies`를 쓰는 이유**: `configs`의 키/값 구조를 검증하면서도, **타입 추론**을 위해 제네릭을 “늘리지” 않고 `InferredForm<typeof configs>` 같은 추론이 그대로 동작하게 하려는 목적이다.

### 2.3 checkAll 흐름 (개념)

```
configs 엔트리 순회
  → ignoreWhen === true 이면 skip
  → isValid(form, context) === false 이면 { key, errorMessage } 수집
  → 수집 결과로 { isValid, getFirstError, getAllErrors, isErrorOf } 반환
```

---

## 3. AsyncValidator — 비동기 검증·재시도

**역할**: 필드별 `isValid`가 **Promise&lt;boolean&gt;**을 돌려줄 수 있고, 실패 시 **재시도**까지 할 수 있게 한다. (예: “이메일 중복 여부” API 호출)

**위치**: `packages/form/src/Validator/AsyncValidator.ts`

### 3.1 타입 (types.ts)

```ts
export type AsyncValidateFn<F, C> = (form: F, context: C) => boolean | Promise<boolean>;

/** Promise<boolean>을 반환하는 `isValid`에서 `ignoreWhen`으로 불필요한 API 호출을 줄일 수 있음. */
export interface AsyncFieldConfig<F, C> extends BaseFieldConfig<F, C> {
  maxRetry: number | ((error: unknown) => number);
}

export type AsyncValidatorConfigs<F, C = void> = Record<string, AsyncFieldConfig<F, C>>;
```

- **ignoreWhen**: 동기처럼 “이 조건이면 이 필드 검증 자체를 스킵” → API 호출을 아예 하지 않을 수 있다.
- **maxRetry**: 해당 필드 검증이 실패(throw 또는 false)했을 때 몇 번까지 재시도할지. 숫자 또는 `(error) => number`.

### 3.2 재시도 유틸 (utils.ts)

```ts
interface RetryOptions<R> {
  fn: () => Promise<R>;
  maxCount?: number | ((err: unknown) => number);
  delay?: number;
  continueOnError?: boolean;
}

export function retry<R>(options: RetryOptions<R>): Promise<R> {
  // maxCount 횟수만큼 fn() 재시도, 실패 시 delay 후 다시 시도
}
```

- **AsyncValidator**는 각 필드 검증 시 이 `retry`로 `isValid(form, context)`를 감싸서, 일시적 네트워크 오류 등에서 재시도할 수 있게 한다.

### 3.3 checkAll 흐름 (개념)

```
Promise.all(필드별 검증)
  → ignoreWhen === true 이면 해당 필드 skip
  → 나머지는 retry({ fn: () => isValid(form, context), maxCount }) 로 실행
  → 결과가 false 이거나 throw 이면 { key, errorMessage } 수집
  → { isValid, getFirstError, getAllErrors } 반환 (isValidating 플래그 보유)
```

### 3.4 사용 예시

```ts
const asyncConfigs = {
  emailDuplicate: {
    isValid: async (form: { email: string }) => {
      const res = await api.get('/check-email', { params: { email: form.email } });
      return !res.data.exists;
    },
    ignoreWhen: (form) => !form.email,
    errorMessage: '이미 사용 중인 이메일입니다.',
    maxRetry: 2,
  },
} satisfies AsyncValidatorConfigs<{ email: string }>;

const asyncValidator = new AsyncValidator(asyncConfigs);
const result = await asyncValidator.checkAll({ email: 'user@example.com' });
```

---

## 4. 타입 추론: InferredForm / InferredError

**위치**: `packages/form/src/Validator/types.ts`

```ts
export type InferredForm<T> = T extends BaseValidatorConfigs<infer F, any> ? F : never;
export type InferredContext<T> = T extends BaseValidatorConfigs<any, infer C> ? (IsUnknown<C> extends true ? void : C) : never;
export type InferredError<T> = T extends BaseValidatorConfigs<any, any> ? T[keyof T]['errorMessage'] : never;
```

- **InferredForm&lt;Configs&gt;** : `Configs`에 정의된 필드들이 기대하는 **폼 객체 타입 F**.
- **InferredContext&lt;Configs&gt;** : 검증 시 넘기는 **컨텍스트 C**. 없으면 `void`.
- **InferredError&lt;Configs&gt;** : 각 필드 `errorMessage` 타입의 유니온. `getFirstError()` 반환 타입 등에 쓰인다.

**Validator/AsyncValidator 제네릭**:

```ts
class Validator<
  Configs extends ValidatorConfigs<any, any>,
  F = InferredForm<Configs>,
  C = InferredContext<Configs>
> { ... }
```

- `Configs`만 넘기면 **F, C는 configs에서 자동 추론**된다. 이 추론이 잘 되려면 configs는 [2.2](#22-satisfies-한-번에-이해하기)에서 정리한 대로 **`satisfies ValidatorConfigs<MyForm>`** 형태로 두는 것이 좋다.

---

## 5. 정리·확장 학습

### 5.1 정리

| 구분 | Validator | AsyncValidator |
|------|-----------|----------------|
| **isValid** | `(form, context) => boolean` | `(form, context) => boolean \| Promise<boolean>` |
| **ignoreWhen** | 조건부 스킵으로 규칙 단순화 | 조건부 스킵으로 **불필요한 API 호출** 감소 |
| **재시도** | 없음 | `maxRetry`로 필드 단위 재시도 |
| **checkAll** | 동기 `checkAll(form, context?)` | 비동기 `await checkAll(form, context?)` |

- **폼 검증**은 “언제 실행할지(blur/submit)”와 “무엇을 검사할지(configs)”를 나누어 두면, 규칙 변경 시 설정만 바꾸면 된다.
- **AsyncValidator**의 `ignoreWhen`은 “이미 빈 값이면 API를 호출하지 않는다”처럼 비용을 줄이는 데 쓰인다.

### 5.2 확장 학습

- **제네릭과 `infer`**: `InferredForm` / `InferredContext`에서 쓰는 “설정 객체로부터 폼/컨텍스트 타입을 끌어내는” 패턴.
- **satisfies**: 이 문서 [2.2절](#22-satisfies-한-번에-이해하기)에서 정리한 “구조 검사 + 리터럴 타입 유지”를 함께 쓰는 방법. 다른 설정 객체(예: ParamConfigs, HttpRequestConfig)에서도 같은 패턴이 쓰일 수 있다.
- **재시도 패턴**: `retry({ fn, maxCount, delay })`처럼 “실패 시 일정 횟수·간격으로 다시 시도”하는 공통 유틸이 서비스 레이어(HTTP 재시도)와 어떻게 비슷한지 비교해 보기.

이후 확장 학습 가능 개념: **폼 라이브러리(React Hook Form, Formik)와의 차이**, **서버 검증과의 역할 분담**, **접근성(a11y)과 에러 메시지 노출**.
