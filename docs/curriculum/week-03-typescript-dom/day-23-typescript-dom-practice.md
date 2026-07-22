# Day 23: TypeScript + DOM 실전

## 키워드

- **DOM Typing** — DOM API 반환값의 타입 다루기. `HTMLInputElement`, `Element | null` 등.
- **Event Typing** — 이벤트 핸들러 타입. `MouseEvent`, `event.target as HTMLInputElement`.
- **Type Narrowing** — `if (el instanceof HTMLElement)`, null 체크로 타입 좁히기.
- **Type Assertion** — `as`로 개발자가 타입을 단언. 남용 시 안전성 저하.
- **Mini Project** — 위 개념을 묶어 작은 앱(예: 타입 안전한 Todo/검색) 구현.

## 면접 포인트

- **Q. `querySelector`의 반환 타입이 왜 `Element | null`인가?**
  → 못 찾을 수 있어 `null` 가능. 그래서 사용 전 null 체크(narrowing)나 제네릭(`querySelector<HTMLInputElement>`) 지정이 필요.
- **Q. `as`(단언)와 narrowing 중 무엇을 우선하나?**
  → narrowing. `as`는 컴파일러 검사를 우회할 뿐 런타임 안전을 보장하지 않는다. 가능하면 `instanceof`/null 체크로 좁혀라.
- **Q. `event.target`과 `event.currentTarget`의 타입 차이는?**
  → `currentTarget`은 리스너가 붙은 요소로 타입이 명확하고, `target`은 실제 발생 요소라 단언/좁히기가 필요할 때가 많다.

## 목표

- DOM 조회·이벤트 핸들러에 정확한 타입을 붙일 수 있다.
- `as` 대신 narrowing을 우선하는 습관을 든다.
- 3주차 개념을 묶어 타입 안전한 미니 프로젝트를 완성한다.
