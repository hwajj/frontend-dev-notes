# Day 49: Controlled Component

## 키워드

- **Controlled Component** — React state가 input의 현재 값을 관리하고, 사용자의 입력을 `onChange`를 통해 state에 반영하는 방식.
- **Single Source of Truth** — 입력값의 원본을 DOM이 아니라 React state로 관리한다.
- **`value` / `onChange`** — `value`로 현재 state를 input에 전달하고, `onChange`에서 사용자 입력을 state에 반영한다.
- **Uncontrolled Component** — input의 값을 DOM이 직접 관리하고, 필요할 때 `ref`를 통해 값을 가져오는 방식.
- **Form State** — 여러 input의 값을 React state에서 관리하면서 validation, 제출, 초기화 등을 제어할 수 있다.
- **`defaultValue`** — Uncontrolled Component에서 초기값을 지정할 때 사용하는 속성. `value`와 달리 이후 React state로 값을 계속 제어하지 않는다.

## 질문 예시

- **Q. Controlled Component란 무엇인가?**
  → input의 값을 **React state가 관리하는 방식**이다. 일반적으로 `value`로 state를 전달하고 `onChange`에서 사용자 입력을 state에 반영한다.

- **Q. Controlled와 Uncontrolled Component의 차이는?**
  → Controlled Component는 React state가 input 값의 SSOT가 되고, Uncontrolled Component는 DOM이 값을 관리한다. Controlled는 입력값을 실시간으로 검증하거나 다른 UI와 연동하기 쉽고, Uncontrolled는 간단한 폼에서 코드가 상대적으로 적을 수 있다.

- **Q. Controlled Component를 사용하면 왜 `onChange`가 필요한가?**
  → `value`를 React state로 제어하기 때문에 사용자의 입력을 state에 반영해야 한다. `onChange`에서 state를 업데이트하지 않으면 input의 `value`가 변경되지 않아 사용자의 입력을 제대로 반영할 수 없다.

- **Q. `value`와 `defaultValue`의 차이는?**
  → `value`는 React가 현재 값을 계속 제어하는 **Controlled 방식**이고, `defaultValue`는 DOM에 초기값만 제공하는 **Uncontrolled 방식**이다.

- **Q. Controlled Component의 장점은?**
  → React state가 입력값을 가지고 있기 때문에 **실시간 validation, 입력값 변환, 조건부 UI, 다른 state와의 연동** 등을 쉽게 구현할 수 있다. 예를 들어 입력값에 따라 제출 버튼을 활성화하거나 에러 메시지를 즉시 표시할 수 있다.

- **Q. Controlled Component의 단점은?**
  → 모든 입력값을 React state로 관리해야 하므로 폼이 매우 크거나 입력 이벤트가 빈번한 경우 상태 업데이트와 리렌더링 관리가 복잡해질 수 있다. 따라서 상황에 따라 Uncontrolled 방식을 선택할 수 있다.

- **Q. React에서 input을 Controlled로 관리하다가 Uncontrolled로 변경하면 경고가 발생하는 이유는?**
  → 처음에는 `value`가 `undefined`라서 Uncontrolled로 동작하다가 이후 값이 들어오면서 Controlled로 바뀌는 등의 상황에서 발생한다. 처음부터 `value`를 `''` 같은 기본값으로 초기화해 **제어 방식을 일관되게 유지**하는 것이 일반적인 해결 방법이다.

## 목표

- Controlled Component의 개념과 **React state가 input의 SSOT가 되는 이유**를 설명할 수 있다.
- `value`와 `onChange`를 이용해 Controlled input을 구현할 수 있다.
- **Controlled와 Uncontrolled Component의 차이**를 설명할 수 있다.
- `value`와 `defaultValue`의 차이를 설명할 수 있다.
- Controlled Component의 장단점과 **어떤 상황에서 적합한지** 설명할 수 있다.
