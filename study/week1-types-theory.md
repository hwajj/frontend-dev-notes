## 1주차 이론 노트 — 타입/타입가드/오버로드/조건부 타입/Validator 설계

> 목표: 런타임 정책을 타입으로 “명세”하고, 안전한 경계를 만든다. 생성형 AI가 구현을 돕더라도, 무엇을/어디에/어떻게 설계할지는 우리의 역할이다.

### 핵심 아웃컴

- 타입가드(타입 프레디킷)로 안전한 다운캐스팅과 분기 내로잉을 구현한다.
- `satisfies`로 설정 객체(config-as-data)의 정확한 추론을 보장한다.
- 제네릭/오버로드/조건부 타입으로 “호출자 친화적”이고 “타입 안전”한 API를 설계한다.
- Validator 패턴(전략 함수 + 구성 데이터)으로 검증 정책을 타입/런타임 일치 상태로 유지한다.
- 클래스 `#private` 캡슐화로 API 계약(메서드 시그니처)만 노출하고 내부 구현은 자유롭게 교체한다.

---

## 0. 선행 개념(기초 → 심화)

이 문서의 뒷부분을 읽기 전에, 아래 용어들이 “이름만 아는 수준”이 아니라 **왜 쓰는지**까지 연결되면 훨씬 수월하다. 처음 보면 한 번에 외울 필요 없고, **막히는 곳에서 다시 와서 읽어도 된다.**

### 0-1. 구조적 타이핑(Structural typing)

TypeScript는 “이름이 같은 타입”이 아니라 **형태(필드와 타입)가 맞으면** 호환된다고 본다.

```ts
type User = { id: number; name: string };
type Person = { id: number; name: string; age?: number };

const u: User = { id: 1, name: "Kim" };
const p: Person = { id: 2, name: "Lee", age: 20 };

// Person에 필드가 더 있어도, User에 필요한 것만 갖췄으면 User 자리에 넣을 수 있음
const u2: User = p;
```

**왜 중요한가:** “덕 타이핑에 가깝다”고들 한다. 인터페이스 이름이 달라도 **같은 모양이면 통과**하기 때문에, 타입가드·Validator처럼 “실제로 어떤 필드가 있는지”를 런타임에 확인하는 패턴과 잘 맞물린다.

---

### 0-2. 유니온(Union)과 인터섹션(Intersection)

- **유니온 `A | B`:** 값이 A이거나 B이다. “여러 가능성 중 하나”.
- **인터섹션 `A & B`:** A와 B의 요구를 **동시에** 만족해야 한다.

```ts
type Id = number | string; // id는 숫자이거나 문자열

type Named = { name: string };
type Aged = { age: number };
type NamedAndAged = Named & Aged; // { name: string; age: number }
```

**왜 중요한가:** API 응답을 `{ ok: true; data: T } | { ok: false; error: ... }`처럼 모델링하는 것이 유니온이다. 분기에서 `ok`를 확인하면 타입이 좁혀지는데, 그때 타입가드/판별 필드(discriminant)가 핵심이 된다.

---

### 0-3. 제네릭(Generic) 함수와 타입

**한 번 정의해 두고**, 나중에 “구체적인 타입”을 끼워 넣어 쓰는 문법이다. `T`는 타입 변수(placeholder)라고 보면 된다.

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([1, 2, 3]); // T는 number로 추론
const s = first(["a", "b"]); // T는 string
```

**왜 중요한가:** `Validator<F, C, R>`처럼 “폼 타입 F, 컨텍스트 C, 규칙 객체 R”을 바깥에서 지정하게 하려면 제네릭이 필요하다. 반복 코드를 줄이면서도 타입 정보를 유지할 수 있다.

---

### 0-4. 타입 프레디킷(`value is T`)과 함수 오버로드

- **타입 프레디킷:** 함수가 `true`를 반환하면, 인자의 타입이 특정 타입 `T`라고 **컴파일러에게 약속**하는 반환 타입 표기. (`v is string`)
- **오버로드:** **호출하는 쪽**에 보여 주는 시그니처를 여러 개 두되, **실제 구현체**는 하나로 묶는 방식.

```ts
function isString(v: unknown): v is string {
  return typeof v === "string";
}

// 오버로드 선언(타입 검사용) + 구현(하나)
function fmt(n: number): string;
function fmt(s: string): string;
function fmt(x: number | string) {
  return String(x);
}
```

**왜 중요한가:** 프레디킷이 있어야 `if (isString(v))` 안에서 `v`가 `string`으로 좁혀진다. 오버로드는 “배열을 넣으면 배열이 나온다”처럼 **사용 경험**을 맞추되, 구현은 `T | T[]` 하나로 처리할 때 쓴다.

---

### 0-5. 조건부 타입, 분배(distributive), `infer`

- **조건부 타입:** `T extends U ? X : Y` — 타입 수준의 if.
- **분배:** `T`가 유니온이면 `T extends U ? X : Y`가 **멤버마다** 풀려서 결과가 유니온으로 합쳐질 수 있다(특정 조건에서).
- **`infer`:** 조건부 타입 안에서 “여기서 타입을 뽑아내겠다”는 선언. 예: 배열의 요소 타입.

```ts
type IsString<T> = T extends string ? "yes" : "no";

type Element<T> = T extends (infer U)[] ? U : T;
type E1 = Element<number[]>; // number
type E2 = Element<string>; // string
```

**왜 중요한가:** 라이브러리 타입 유틸(`ReturnType` 등)이 이 패턴으로 만들어진다. 본문에서는 “런타임에서 나눈 경우의 수를 타입에도 반영한다”는 감각만 잡아도 충분하다.

---

### 0-6. `satisfies`와 `as const`의 역할 차이

- **`as const`:** 값을 **가능한 한 리터럴/읽기 전용**으로 좁혀 추론한다. “이 객체는 변하지 않는다”에 가깝다.
- **`satisfies SomeType`:** “이 값이 `SomeType` 조건을 **만족하는지 검사**하되, **추론은 값의 구체적 형태를 유지**한다.”

즉, `as const`는 추론 폭을 줄이고, `satisfies`는 **구조가 틀리면 컴파일 에러**를 내는 동시에 `email` 같은 키 추론을 살리기 좋다. `as const`만 쓰면 “키 이름 오타”나 “필수 필드 누락”을 놓치기 쉬운 경우가 있어, **규칙 객체**에는 `satisfies`가 자주 붙는다.

---

### 0-7. 클래스: 정적 멤버와 `#private`

- **정적(`static`):** 인스턴스가 아니라 **클래스 자체**에 붙는 필드/메서드. 공장 메서드, 카운터 등에 쓴다.
- **`#private`:** 자바스크립트 런타임 수준의 비공개 필드. 클래스 **밖에서는 이름으로 접근할 수 없다**(과거의 `private`보다 강하게 막힌다).

**왜 중요한가:** 외부에는 `get`/`set`/`checkAll`만 보이고, 내부 `Map`이나 규칙 배열은 `#`으로 숨기면 **리팩터링 시 깨질 지점**이 줄어든다.

---

## 1. 타입가드/타입 프레디킷

### 한 줄 요약

런타임에서 `if`로 검사한 뒤, 그 **if 블록 안**에서는 TypeScript가 “아, 이 값은 이 타입이구나” 하고 따라와 주게 만드는 장치다.

### 조금 더 풀어서

`unknown`이나 API에서 온 값은 실행 전에는 타입이 불명확하다. 이때 `as string`처럼 **강제로 믿게 만들면** 거짓이어도 컴파일은 통과한다. 타입가드는 **실제로 검사한 결과가 true일 때만** 좁혀 주므로, “믿음”이 아니라 **증거**에 가깝다.

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

### 왜 이렇게 쓰는가

- `as` 단언은 “컴파일러야 내 말 믿어”이고, 타입가드는 “여기 조건을 통과했으니 이 타입이 맞아”이다.
- 팀 단위 리팩터링 시, 가드가 없으면 런타임에서만 터지는 버그가 늘고, IDE 자동완성·추론 품질도 떨어진다.

---

## 2. config-as-data + `satisfies`

### 한 줄 요약

검증 규칙을 **함수 여기저기에 흩뿌리지 않고**, “필드 이름 → 검사 함수 + 에러 메시지” 형태의 **데이터**로 모은 뒤, `satisfies`로 그 데이터의 모양을 타입으로 고정한다.

### 조금 더 풀어서

`if (!email.includes("@"))` 같은 코드가 컴포넌트·API·유틸에 흩어 있으면, 메시지 변경·규칙 추가가 어렵고 테스트도 번거롭다. 규칙을 객체로 모으면 **한곳을 고치면 전체 정책이 보이고**, `satisfies`로 “모든 규칙은 `isValid`와 `errorMessage`를 가진다”를 컴파일 타임에 강제할 수 있다.

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

### 왜 이렇게 쓰는가

- 정책이 데이터면 **목록을 순회**하거나 **필드별로 UI를 매핑**하기 쉽다.
- `satisfies`로 키 오타·필드 누락을 빌드 단계에서 잡을 수 있다.

---

## 3. 제네릭/오버로드: 호출 경험 설계

### 한 줄 요약

**사용하는 사람이 헷갈리지 않게** “넣은 모양 그대로 돌려받는다”는 느낌을 타입으로 표현하되, **내부 구현은 한 벌**로 유지한다.

### 조금 더 풀어서

오버로드 **선언**은 여러 개여도 되지만, **구현 시그니처**는 보통 넓은 타입 하나(`T | T[]`)로 받는다. TypeScript는 호출 시 어떤 오버로드에 맞는지를 보고 **반환 타입**을 정해 준다. 제네릭 `T`와 함께 쓰면 `string`을 넣었을 때 반환도 `string`으로 고정된다.

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

### 왜 이렇게 쓰는가

- 호출부 코드가 짧고 자연스러우면 실수가 줄고, 문서 없이도 “IDE가 알려 주는 대로” 쓰기 쉽다.
- 구현이 하나라서 버그 수정·로깅 같은 횡단 관심사를 넣기도 쉽다.

---

## 4. 조건부/분배 타입 + `infer`

### 한 줄 요약

값이 아니라 **타입 자체**에 “만약 ~이면 ~, 아니면 ~”를 걸고, 필요하면 `infer`로 안쪽 타입을 꺼낸다.

### 조금 더 풀어서

런타임에서 `Array.isArray(x)`로 나누듯, 타입 수준에서도 `extends`로 나눌 수 있다. `never`는 “없는 타입”에 가깝게 써서 유니온에서 제거하는 데 자주 쓴다. `infer U`는 “배열이면 요소 타입을 U라고 부르겠다”처럼 **패턴 매칭**에 가깝다.

```ts
// Error 타입이라면 제거
type IfNotError<T> = T extends Error ? never : T; // string | Error → string

// 배열이면 요소, 아니면 그대로
type UnwrapArray<T> = T extends (infer U)[] ? U : T;

type A = IfNotError<string | Error>; // string
type B = UnwrapArray<number[]>; // number
type C = UnwrapArray<string>; // string
```

### 왜 이렇게 쓰는가

- 함수/라이브러리 경계에서 “들어온 제네릭을 가공한 타입”을 자동으로 만들 때 유리하다.
- 분기 이후에 매번 `as`를 쓰는 대신, **타입 정의 한 번**으로 호출부를 정리할 수 있다.

---

## 5. 클래스 캡슐화와 `#private`

### 한 줄 요약

바깥에는 **무엇을 할 수 있는지(메서드)**만 보이게 하고, 안에 쓰는 `Map` 같은 저장소는 **건드리지 못하게** 막는다.

### 조금 더 풀어서

`public map = new Map()`처럼 열어 두면 다른 코드가 `cache.map.clear()`로 내부를 망가뜨릴 수 있다. `#private` 필드는 클래스 **문법 밖**에서 접근이 안 되므로, “캐시 교체 시 이 메서드들만 보면 된다”는 계약이 명확해진다.

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

### 왜 이렇게 쓰는가

- 내부 표현을 `Map`에서 다른 구조로 바꿔도 **공개 메서드 시그니처**가 같으면 사용자 코드는 깨지지 않기 쉽다.
- 변경 범위를 클래스 안으로 가두어 유지보수 비용을 줄인다.

---

## 6. Validator 설계(전략 + 구성)

### 한 줄 요약

각 필드의 검사는 **작은 함수(전략)**로 두고, 어떤 필드를 어떤 순서로 검사할지는 **규칙 객체(구성)**에 모은다. 공통 루프는 `Validator` 클래스가 맡는다.

### 조금 더 풀어서

`ignoreWhen`은 “이 조건일 땐 이 규칙은 스킵” 같은 **현실적인 예외**를 데이터로 표현한다. 제네릭 `F`(폼), `C`(컨텍스트), `R`(규칙 맵)을 쓰면 같은 엔진으로 로그인 폼·설정 폼을 재사용할 수 있다.

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

### 왜 이렇게 쓰는가

- 규칙 단위로 **단위 테스트**하기 쉽다.
- 필드 추가/삭제가 “객체에 한 줄 추가/삭제” 수준이 되어 협업·리뷰가 수월하다.

---

## 7. 타입 안전 API 경계(성공/실패 유니온 + 가드)

### 한 줄 요약

서버 응답을 “성공 한 가지 모양 | 실패 한 가지 모양”으로 정해 두고, `isSuccess` 같은 가드로 나눈 뒤 **각 가지에서만** `data` 또는 `error`에 접근하게 한다.

### 조금 더 풀어서

`ok`처럼 **공통으로 두고 값이 다른 필드**를 두는 패턴을 판별 유니온(discriminated union)이라고 부르는 경우가 많다. `ok === true`일 때만 `data`가 있다고 타입이 좁혀지면, `data`를 쓸 때마다 `?.` 지옥을 줄일 수 있다.

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

### 왜 이렇게 쓰는가

- 실패 경로를 빼먹으면 컴파일러가 잡아 줄 여지가 생긴다.
- `as`로 억지 단언하지 않고도 후속 로직을 안전하게 이어 쓸 수 있다.

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
