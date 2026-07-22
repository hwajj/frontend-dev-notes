# Day 18: Generic

## 키워드

- **Generic** — 타입을 파라미터로 받아 재사용성을 높이는 도구. `Box<T>`.
- **Generic Function** — `function identity<T>(x: T): T`. 입력 타입을 그대로 반환 타입에 전달.
- **Generic Interface** — `interface ApiResponse<T> { data: T }` 처럼 구조를 타입 매개변수화.
- **Generic Constraint (`extends`)** — 타입 매개변수에 제약. `<T extends { id: number }>`.
- **keyof** — 객체 타입의 키들을 유니온으로. `keyof User` → `'id' | 'name'`.
- **extends** — 제약/조건부 타입에서 "~의 하위 타입인가"를 표현.

## 면접 포인트

- **Q. 제네릭을 쓰면 `any`와 뭐가 다른가?**
  → `any`는 타입 정보를 버리지만, 제네릭은 호출 시점의 타입을 **보존·전파**해 입력과 출력의 관계를 유지한다.
- **Q. `keyof`와 제네릭을 함께 쓰는 대표 예시는?**
  → `function get<T, K extends keyof T>(obj: T, key: K): T[K]` — 존재하는 키만 받고 정확한 프로퍼티 타입을 반환.
- **Q. Generic Constraint는 왜 필요한가?**
  → 매개변수 타입에 최소한의 형태를 보장해, 내부에서 `.id` 같은 접근을 안전하게 하기 위해.

## 목표

- 중복되는 타입 로직을 제네릭으로 일반화할 수 있다.
- `keyof` + 제약으로 타입 안전한 접근 유틸을 만든다.
- Day 19 유틸리티 타입이 제네릭으로 구현됨을 이해한다.
