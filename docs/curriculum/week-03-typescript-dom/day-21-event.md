# Day 21: Event

## 키워드

- **Event** — 사용자/브라우저 동작(click, input 등)을 나타내는 객체. `addEventListener`로 구독.
- **Event Bubbling** — 이벤트가 타깃에서 최상위(document)로 **올라가며** 전파.
- **Capturing** — 반대로 최상위에서 타깃으로 **내려오며** 전파(`{ capture: true }`).
- **Event Delegation** — 부모에 리스너 하나를 두고 자식 이벤트를 위임 처리(버블링 활용).
- **preventDefault** — 브라우저 기본 동작 취소(예: 폼 제출, 링크 이동).
- **stopPropagation** — 이벤트 전파(버블링/캡처링) 중단.

## 면접 포인트

- **Q. 이벤트 위임의 장점은?**
  → 자식이 많거나 동적으로 추가돼도 리스너 하나로 처리 → 메모리·등록 비용 절감. `event.target`으로 실제 요소 판별.
- **Q. `preventDefault`와 `stopPropagation`의 차이는?**
  → 전자는 "기본 동작"을 막고, 후자는 "전파"를 막는다. 서로 독립적이라 둘 다 필요할 수도 있다.
- **Q. 이벤트 흐름 3단계는?**
  → 캡처링 → 타깃 → 버블링. `addEventListener`는 기본이 버블링 단계.

## 목표

- 버블링/캡처링 전파 순서를 코드로 예측할 수 있다.
- 이벤트 위임으로 목록형 UI를 효율적으로 처리한다.
- `preventDefault`/`stopPropagation`을 상황에 맞게 사용한다.
