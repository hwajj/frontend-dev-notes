# Day 17: Type Inference & Type System

## 키워드

- **Type Inference** — 명시하지 않아도 컴파일러가 타입을 추론. `let x = 3` → `number`.
- **Interface** — 객체 구조를 정의. 선언 병합(declaration merging)과 `extends` 상속이 가능.
- **Type Alias** — `type`으로 타입에 이름 부여. 유니온·튜플·원시 타입 별칭도 가능.
- **Union (`|`)** — 여러 타입 중 하나. `string | number`.
- **Intersection (`&`)** — 여러 타입을 모두 만족. `A & B`.
- **Literal Type** — 특정 값 자체가 타입. `'GET' | 'POST'`, `type Yes = true`.

## 면접 포인트

- **Q. `interface`와 `type`의 차이는?**
  → `interface`는 선언 병합·객체 확장에 강하고, `type`은 유니온·튜플·조건부 타입 등 표현력이 넓다. 객체 형태는 interface, 그 외 조합은 type을 선호하는 편.
- **Q. 타입 추론이 있는데 왜 명시적 타입을 쓰나?**
  → 함수의 공개 API(파라미터·반환값)는 명시해 의도를 문서화하고 실수를 방지. 내부 지역 변수는 추론에 맡겨 간결하게.
- **Q. Union을 안전하게 쓰려면?**
  → 타입 좁히기(`typeof`, `in`, 판별 유니온 discriminated union)로 각 케이스를 분기해야 한다.

## 목표

- 추론에 맡길 곳과 명시할 곳을 구분할 수 있다.
- Union/Intersection/Literal을 조합해 실제 도메인 타입을 설계할 수 있다.
- 판별 유니온으로 안전한 분기를 작성한다.
