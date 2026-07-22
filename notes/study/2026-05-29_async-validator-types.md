# AsyncValidator — satisfies로 검증 타입까지 잡기

> 작성일: 2026-05-29  
> 맥락: 필드별 비동기 검증 결과에서 `key`가 `string`으로만 나와, **어떤 필드 에러인지** 타입으로 UI에 못 연결한다.

## 먼저 이것만

1. 검증 **설정 객체**(`configs`)를 `satisfies`로 선언하면, 클래스 제네릭이 **필드 이름**까지 추론한다.
2. `checkAll(form)` 반환의 `key`는 `'email' | 'phone'`처럼 **configs 키와 동일**해진다.
3. `satisfies` 없이 넘기면 `key`가 넓은 `string`으로 퍼진다.

## 이 글의 질문

- `as const`와 `satisfies` 중 뭘 쓰나?
- `AsyncValidatorConfigs<Form, Ctx>`의 `Form`·`Ctx`는?

## 핵심 (먼저 읽기)

| 선언 방식 | `checkAll` 결과의 `key` 타입 |
|-----------|------------------------------|
| 일반 객체 literal | `string` (넓음) |
| `satisfies AsyncValidatorConfigs<Form, void>` | `'email' \| 'phone'` (configs 키) |
| `as const`만 | 값 리터럴은 좁지만 **configs 스키마 검사**는 약할 수 있음 |

| 제네릭 | 의미 |
|--------|------|
| `Form` | 검증할 폼 데이터 shape (`{ email: string; phone: string }`) |
| `Ctx` | 검증 시 같이 넘기는 컨텍스트 (`void`면 form만) |

## 전제 (30초)

- **비동기 검증**: API 중복 확인 등 `Promise<boolean>`.
- **satisfies**: 값은 그대로 두고, 타입이 **스키마를 만족하는지**만 검사.
- **제네릭 클래스**: `Configs` 타입에서 `Form`·에러 키를 **계산**.

## 한눈에

```
interface Form { email: string; phone: string }

const configs = { email: {...}, phone: {...} }
  satisfies AsyncValidatorConfigs<Form, void>

new AsyncValidator(configs)
  .checkAll(form)
  → getAllErrors(): { key: 'email' | 'phone', errorMessage: ... }[]
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `satisfies` | 타입을 **좁히지 않고** 상한만 검사 |
| `ignoreWhen` | 조건이면 이 필드 검증 스킵 |
| `maxRetry` | `isValid` 실패 시 재시도 횟수 |

## 함정 한 가지

**착각**: `new AsyncValidator({ email: { ... } })`만 써도 TS가 키를 좁혀 준다.  
**실제**: 라이브러리 주석대로 **`satisfies` 없이** 넘기면 `key`가 `string` — `errors.email` 접근이 unsafe.

## 왜 이렇게인가

런타임에는 평범한 객체다. 컴파일 타임에 “이 폼의 규칙 집합”을 **하나의 타입**으로 고정해야 필드별 에러 UI·i18n 키를 안전하게 매핑한다. `Promise.all`로 필드 병렬 검사, `retry`는 일시적 API 오류용이다.

## 실무 체크포인트

### Before / After (타입 관점)

```typescript
// ❌ key: string
const configs = {
  email: {
    isValid: async (form: Form) => !!(await checkEmail(form.email)),
    errorMessage: '이메일 중복',
  },
};
const v1 = new AsyncValidator(configs);

// ✅ key: 'email'
const configs2 = {
  email: {
    isValid: async (form: Form) => !!(await checkEmail(form.email)),
    errorMessage: '이메일 중복',
  },
} satisfies AsyncValidatorConfigs<Form, void>;

const v2 = new AsyncValidator(configs2);
const { getAllErrors } = await v2.checkAll({ email: 'a@b.c', phone: '010' });
// getAllErrors()[0].key → 'email' (리터럴 유니온)
```

### 사용 흐름

```typescript
const { isValid, getFirstError, getAllErrors } = await validator.checkAll(form);

if (!isValid) {
  const first = getFirstError(); // 첫 메시지
  for (const { key, errorMessage } of getAllErrors()) {
    setFieldError(key, errorMessage); // key가 필드명과 일치
  }
}
```

### `satisfies` vs `as const` (한 줄)

- **`as const`**: 값을 읽기 전용·리터럴로 — 필드 **값**은 좁혀짐.  
- **`satisfies`**: “이 객체가 `AsyncValidatorConfigs` 형태다”를 **검증** — 제네릭 추론의 **입력**으로 쓰기 좋음.

## 참고 코드 — checkAll 반환 (요지)

```typescript
return {
  isValid: result.length === 0,
  getFirstError: () => result[0]?.errorMessage ?? '',
  getAllErrors: () => result, // { key, errorMessage }[]
};
```

## 부록 — backoffice-shared

`@backoffice-fe/form`의 `AsyncValidator`. constructor 주석: **configs는 `satisfies`로 정의할 것**.

```typescript
const configs = {
  email: { isValid: async (f) => ..., errorMessage: '...', maxRetry: 2 },
  phone: { isValid: async (f) => ..., errorMessage: '...', ignoreWhen: (f) => !f.phone },
} satisfies AsyncValidatorConfigs<Form, void>;

const validator = new AsyncValidator(configs);
```

## 면접 한 줄

「폼 검증 DSL은 satisfies + 제네릭으로 설정 객체를 타입의 SSOT로 만든다.」
