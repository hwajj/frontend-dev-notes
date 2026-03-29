## 1주차 이론 노트 — 타입/타입가드/오버로드/조건부 타입/Validator 설계

> 목표: 런타임 정책을 타입으로 “명세”하고, 안전한 경계를 만든다. 생성형 AI가 구현을 돕더라도, 무엇을/어디에/어떻게 설계할지는 우리의 역할이다.
> git

### 핵심 아웃컴

- 타입가드(타입 프레디킷)로 안전한 다운캐스팅과 분기 내로잉을 구현한다.
- `satisfies`로 설정 객체(config-as-data)의 정확한 추론을 보장한다.
- 제네릭/오버로드/조건부 타입으로 “호출자 친화적”이고 “타입 안전”한 API를 설계한다.
- Validator 패턴(전략 함수 + 구성 데이터)으로 검증 정책을 타입/런타임 일치 상태로 유지한다.
- 클래스 `#private` 캡슐화로 API 계약(메서드 시그니처)만 노출하고 내부 구현은 자유롭게 교체한다.

---

## 0. 선행 개념(기초 → 심화)

- 구조적 타이핑, 유니온/인터섹션, 제네릭 함수/타입
- 타입 프레디킷(`value is T`), 함수 오버로드, 조건부/분배 타입, `infer`
- 실무 문법: `satisfies`(구성 객체의 정확 추론), `as const`의 한계
- 클래스: 정적 필드/메서드, `#private` 필드(캡슐화)

---

## 1. 타입가드/타입 프레디킷

개념: 런타임 체크 결과를 TS 타입 시스템에 알려 “분기 내부”에서 안전한 타입 축소를 보장.

시그니처: `function isX(v: unknown): v is X`

```ts
export function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

type DateRange = { start: Date; end: Date };
export function isDateRange(v: unknown): v is DateRange {
  return (
    typeof v === "object" &&
    v !== null &&
    Object.prototype.hasOwnProperty.call(v, "start") &&
    Object.prototype.hasOwnProperty.call(v, "end") &&
    v["start"] instanceof Date &&
    v["end"] instanceof Date &&
    v["start"] <= v["end"]
  );
}
```

왜 이렇게 쓰는가

- `as` 단언은 “신뢰”, 가드는 “검증”이다. 리팩터링/협업 시 조기 오류 발견과 IDE 추론 품질이 크게 향상된다.

---

## 2. config-as-data + `satisfies`

개념: 검증/정책을 “데이터(객체)”로 선언하고, `satisfies`로 구조·키·함수 시그니처를 강제.

장점: 정책 추가/수정 시 컴파일 타임에 구조 위반을 차단. 테스트·확장·생성형 AI 스캐폴딩에 유리.

```ts
type LoginForm = { email: string; password: string };

const loginRules = {
  email: {
    isValid: (f: LoginForm) => /\S+@\S+\.\S+/.test(f.email),
    errorMessage: "올바른 이메일 형식",
  },
  password: {
    isValid: (f: LoginForm) => f.password.length >= 8,
    errorMessage: "비밀번호는 8자 이상",
  },
} satisfies Record<
  string,
  {
    isValid: (f: any) => boolean;
    errorMessage: string;
  }
>;
```

왜 이렇게 쓰는가

- “정책=데이터”로 만들어야 조합/교체가 쉽고, 타입 안전성이 유지된다.

---

## 3. 제네릭/오버로드: 호출 경험 설계

개념: 오버로드로 “여러 호출 형태”를 제공하되, 구현은 단일화(유지보수 용이).

```ts
// 하나를 넣으면 하나, 배열을 넣으면 배열을 돌려주는 호출 UX
export function getOneOrMany<T>(arg: T[]): T[];
export function getOneOrMany<T>(arg: T): T;
export function getOneOrMany<T>(arg: T | T[]) {
  return Array.isArray(arg) ? arg : arg;
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (a, k) => {
      (a as any)[k] = obj[k];
      return a;
    },
    {} as Pick<T, K>,
  );
}
```

왜 이렇게 쓰는가

- 호출자 관점의 자연스러운 API를 제공하면서도 내부 복잡도는 낮춘다.

---

## 4. 조건부/분배 타입 + `infer`

개념: `T extends U ? X : Y`로 타입 분기, 유니온이면 각 멤버로 “분배” 평가. `infer`로 제네릭 내부 타입을 추론 변수로 꺼낸다.

```ts
// Error 타입이라면 제거
type IfNotError<T> = T extends Error ? never : T; // string | Error → string

// 배열이면 요소, 아니면 그대로
type UnwrapArray<T> = T extends (infer U)[] ? U : T;

type A = IfNotError<string | Error>; // string
type B = UnwrapArray<number[]>; // number
type C = UnwrapArray<string>; // string
```

왜 이렇게 쓰는가

- 런타임 분기를 타입에 반영해 “분기 이후 코드”에서 단언을 제거한다.

---

## 5. 클래스 캡슐화와 `#private`

개념: 내부 상태를 `#private`로 은닉, 외부와의 계약(메서드 시그니처)만 유지 → 내부 교체가 쉬움.

```ts
class Cache<K, V> {
  #map = new Map<K, V>();
  set(k: K, v: V) {
    this.#map.set(k, v);
  }
  get(k: K) {
    return this.#map.get(k);
  }
  has(k: K) {
    return this.#map.has(k);
  }
}
```

왜 이렇게 쓰는가

- 변경 파급을 최소화하고 API 표면을 안정화한다.

---

## 6. Validator 설계(전략 + 구성)

개념: “전략 함수(Strategy)”와 “구성 데이터(config-as-data)” 조합. 컨텍스트 의존·조건부 무시까지 지원.

```ts
type FieldRule<F, C> = {
  isValid: (form: F, context?: C) => boolean;
  errorMessage: string;
  ignoreWhen?: (form: F, context?: C) => boolean;
};

class Validator<F, C, R extends Record<string, FieldRule<F, C>>> {
  #entries: [keyof R, FieldRule<F, C>][];
  constructor(readonly rules: R) {
    this.#entries = Object.entries(rules) as any;
  }
  checkAll(form: F, context?: C) {
    const errors: Array<{ key: keyof R; errorMessage: string }> = [];
    for (const [key, rule] of this.#entries) {
      if (rule.ignoreWhen?.(form, context)) continue;
      if (!rule.isValid(form, context))
        errors.push({ key, errorMessage: rule.errorMessage });
    }
    return {
      isValid: errors.length === 0,
      getFirstError: () => errors[0]?.errorMessage ?? "",
      isErrorOf: (field: keyof R) => errors[0]?.key === field,
      getAllErrors: () => errors,
    };
  }
}
```

왜 이렇게 쓰는가

- 규칙을 함수로 모델링하면 테스트/조합이 쉽고, 데이터로 묶으면 추가/삭제가 간단하다.

---

## 7. 타입 안전 API 경계(성공/실패 유니온 + 가드)

개념: 성공/실패를 차별 유니온으로 모델링하고, 가드로 분리.

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

function isSuccess<T>(
  r: ApiResponse<T>,
): r is Extract<ApiResponse<T>, { ok: true }> {
  return (r as any).ok === true;
}

async function handle<T>(p: Promise<ApiResponse<T>>) {
  const res = await p;
  if (isSuccess(res)) return res.data;
  throw new Error(res.error.message);
}
```

왜 이렇게 쓰는가

- 이후 코드에서 `as` 없이 안전한 분기·오류 전파가 가능하다.

---

## 8. 베스트 프랙티스 체크리스트

- [ ] 다운캐스팅이 필요하면 `as` 대신 타입가드로 분기/내로잉한다.
- [ ] 검증/정책은 “데이터(객체)”로 선언하고 `satisfies`로 타입을 고정한다.
- [ ] 오버로드는 호출자 경험을 개선하되, 구현 시그니처는 단일로 유지한다.
- [ ] 조건부/분배 타입으로 런타임 분기를 타입에 반영한다.
- [ ] 클래스 내부 상태는 `#private`로 캡슐화한다.
- [ ] API 응답은 성공/실패 유니온으로 모델링하고 가드로 분리한다.

---

## 9. 자주 발생하는 실수 → 대안

- 단언(`as`) 남발 → 타입가드/프레디킷으로 교체
- `as const`만 사용 → `satisfies`로 구조·키 강제
- 모든 상태를 전역/Redux로 → 서버 상태(Query)/도메인 상태(Redux)/로컬 상태 분리
- Effect에 계산/비즈 로직 포함 → Effect는 “외부 동기화(구독/타이머/리스너)”에만 사용

---

## 10. 미니 실습(이론 중심)

1. 타입가드 3종: `isNonEmptyString`, `isDateRange`, `isRefObject<T>`
2. 로그인 Validator: 이메일/비밀번호 정책을 config-as-data로 작성, `satisfies` 적용
3. `ApiResponse<T>` + `isSuccess` 가드로 성공/실패 분기 처리 함수 작성
4. 오버로드 함수 1개 설계: `pick` 또는 `getOneOrMany`

---

## 이후 확장 학습 가능 개념

- 타입: Discriminated Union 기반 상태머신, Branded Type(ID/토큰 구분)
- 검증: zod/io-ts와 TS 타입의 경계(런타임 스키마 vs 정적 타입)
- 아키텍처: Feature-Sliced Design, Adapter/Strategy/Builder 심화
