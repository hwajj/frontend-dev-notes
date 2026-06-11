# Conditional & Distributive Types (TS 고급 타입 핵심)

## 1. Conditional Type = 타입 세계의 if문

```ts
type If<C extends boolean, T, F> = C extends true ? T : F;
```

- C가 true면 T, false면 F
- JS의 `condition ? A : B`와 동일 개념

---

## 2. Distributive Conditional Type (분산 조건부 타입)

```ts
type Test<T> = T extends string ? "S" : "N";
type R = Test<string | number>; // 'S' | 'N'
```

- T가 유니온이면 자동으로 쪼개서 적용됨(= 분산)
  - 내부적으로 `Test<string> | Test<number>`

---

## 3. 분산 막기: 튜플로 감싸기

```ts
type Test2<T> = [T] extends [string] ? "S" : "N";
type R2 = Test2<string | number>; // 'N'
```

- `[T] extends [U]`로 감싸면 유니온을 통째로 검사

한 줄 요약

| 문법              | 동작                   |
| ----------------- | ---------------------- |
| `T extends U`     | 유니온이면 분산됨      |
| `[T] extends [U]` | 유니온이면 통째로 검사 |

---

## 4. 유니온 필터링 vs 검증

필터링(분산 활용)

```ts
type OnlyString<T> = T extends string ? T : never;
type A = OnlyString<string | number | boolean>; // string
```

검증(분산 차단)

```ts
type OnlyString2<T> = [T] extends [string] ? T : never;
type B = OnlyString2<string | number>; // never
```

---

## 5. `[keyof T]` = 객체 value 유니온 뽑기

```ts
type Obj = { a: number; b: string };
type V = Obj[keyof Obj]; // number | string
```

- `Obj["a" | "b"] → Obj["a"] | Obj["b"] → number | string`
- 객체의 value 타입들을 유니온으로 얻기

---

## 6. FunctionKeys 패턴(고전)

목표: 객체에서 함수인 프로퍼티의 key만 뽑기

```ts
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
```

동작

```ts
// 1) 임시 객체
// { id: never; save: "save"; load: "load" }
// 2) [keyof T]로 값 유니온 추출 → "save" | "load"
```

포인트

- 값 위치는 “임시 메모장” 역할
- 타입스크립트에는 key 필터링 전용 문법이 없어서 생긴 우회

---

## 7. 최신 문법: Key Remapping (TS 4.1+)

```ts
type FunctionKeys2<T> = keyof {
  [K in keyof T as T[K] extends Function ? K : never]: any;
};
```

- key 단계에서 조건으로 바로 필터
- value는 의미 없음(any)
- 더 직관적

---

## 8. 왜 이런 “괴물 타입”이 생기나?

타입 레벨에서 JS 로직을 흉내 내려는 시도이기 때문

JS

```js
Object.values(obj)
  .filter(v => typeof v === 'function')
  .map(fn => ...)
```

TS 타입 대응표

| JS 개념       | 타입스크립트     |
| ------------- | ---------------- |
| Object.keys   | `keyof T`        |
| for/map       | `[K in keyof T]` |
| if/filter     | `extends ? :`    |
| 구조분해      | `infer`          |
| Object.values | `[keyof T]`      |

→ 배열이 없으니 “객체 + 유니온 + never”로 조합

---

## 9. 실무 요약

언제 분산을 쓴다

- 유니온 각 원소별 규칙 적용(필터링)

언제 분산을 막는다

- 타입 “검증” 목적(정확히 이 타입인지)
- `never/any/unknown` 등의 판별

치트시트

- `T extends U ? A : B` → 타입 if문
- 유니온 + conditional → 자동 분산
- `[T] extends [U]` → 분산 차단
- `[keyof T]` → value 유니온
- mapped type + `[keyof T]` → map/filter 흉내
- key remap(`as`) → 최신 & 직관적

---

핵심

> 고급 타입은 “JS 데이터 처리(map/filter/values)”를 타입 레벨에서 흉내 낸 결과물이다.  
> d.ts에서 복잡한 패턴이 보이면 “아, 타입으로 map/filter/extract 하고 있구나”로 해석하면 된다.
