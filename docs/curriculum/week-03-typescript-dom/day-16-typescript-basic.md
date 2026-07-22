# Day 16: TypeScript Basic

## 키워드

- **Static Typing** — 실행 전(컴파일 타임)에 타입을 검사. 런타임 전에 오류를 잡는다.
- **Primitive Type** — `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`.
- **Object Type** — 객체의 구조(프로퍼티 이름·타입)를 명시. `{ name: string; age: number }`.
- **Array / Tuple** — 배열 `number[]`, 튜플은 길이·순서·타입이 고정 `[string, number]`.
- **Enum** — 이름 있는 상수 집합. `enum Role { Admin, User }`. 런타임 객체가 생성된다.
- **Any / Unknown / Never** — `any`(검사 포기), `unknown`(안전한 any, 좁혀야 사용), `never`(값이 없음, 도달 불가).

## 면접 포인트

- **Q. `any`와 `unknown`의 차이는?**
  → `any`는 타입 검사를 꺼버려 무엇이든 허용하지만, `unknown`은 사용 전 반드시 타입 좁히기(narrowing)를 강제해 더 안전하다.
- **Q. `never`는 언제 쓰나?**
  → 절대 반환하지 않는 함수(예외 throw, 무한 루프)나, 유니온을 모두 소진했을 때 남는 타입(exhaustive check)에 쓴다.
- **Q. Enum 대신 무엇을 쓸 수 있나?**
  → `as const` 객체 + union 리터럴. 번들 크기와 트리셰이킹 면에서 유리한 경우가 많다.

## 목표

- 기본 타입을 붙여 변수·함수 시그니처를 작성할 수 있다.
- `any` 남용을 피하고 `unknown`으로 안전하게 다루는 습관을 든다.
- 배열과 튜플의 차이를 예시로 설명할 수 있다.
