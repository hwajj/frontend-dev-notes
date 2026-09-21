# Day 50: Error Boundary

## 키워드

- **Error Boundary** — React 컴포넌트 트리에서 발생한 렌더링 오류를 감지하고, 전체 애플리케이션이 중단되지 않도록 대체 UI를 보여주는 기능.
- **`componentDidCatch`** — Error Boundary에서 자식 컴포넌트의 오류를 감지했을 때 호출되는 생명주기 메서드.
- **`getDerivedStateFromError`** — 오류 발생 후 Error Boundary의 상태를 변경해 fallback UI를 렌더링할 때 사용한다.
- **Fallback UI** — 오류가 발생했을 때 사용자에게 보여주는 대체 화면.
- **Error Isolation** — 특정 컴포넌트 영역의 오류를 해당 영역으로 격리해 나머지 UI가 계속 동작하도록 하는 것.
- **Error Boundary의 한계** — 모든 종류의 JavaScript 오류를 잡는 것은 아니다. 이벤트 핸들러, 비동기 코드, 서버 사이드 렌더링 과정 등에서 발생한 오류는 기본 Error Boundary가 직접 잡지 못한다.

## 질문 예시

- **Q. Error Boundary란 무엇인가?**
  → 자식 컴포넌트에서 발생하는 **렌더링 중 오류를 감지하고 fallback UI를 보여주는 React 기능**이다. 특정 영역의 오류가 애플리케이션 전체로 전파되는 것을 막을 수 있다.

- **Q. Error Boundary는 어떤 오류를 잡을 수 있는가?**
  → 주로 자식 컴포넌트의 **렌더링 과정, 생명주기 메서드, constructor에서 발생하는 오류**를 잡는다.

- **Q. Error Boundary가 모든 에러를 처리할 수 있는가?**
  → 아니다. 대표적으로 **이벤트 핸들러에서 발생한 오류, 비동기 코드의 오류, 서버 사이드 렌더링 오류** 등은 일반적인 Error Boundary가 직접 잡지 못한다. 이런 오류는 각각의 상황에 맞게 `try/catch`, Promise의 `catch`, 서버 측 에러 처리 등을 사용해야 한다.

- **Q. Error Boundary를 사용하는 이유는?**
  → 하나의 컴포넌트에서 오류가 발생했다고 해서 **애플리케이션 전체가 깨지는 것을 방지**하기 위해서다. 예를 들어 결제 영역에 문제가 생겨도 헤더나 다른 페이지 영역은 계속 사용할 수 있도록 오류 범위를 격리할 수 있다.

- **Q. Error Boundary에서 `getDerivedStateFromError`와 `componentDidCatch`의 역할은?**
  → `getDerivedStateFromError`는 오류가 발생했을 때 상태를 변경해 **fallback UI를 렌더링**하는 데 사용한다. `componentDidCatch`는 오류 정보를 받아 **로깅이나 에러 모니터링** 같은 부수 작업을 처리하는 데 사용한다.

- **Q. 함수형 컴포넌트에서 Error Boundary를 만들 수 있는가?**
  → React의 기본 Error Boundary는 `componentDidCatch`와 `getDerivedStateFromError`를 기반으로 하기 때문에 **직접 구현할 때는 클래스 컴포넌트가 필요하다.** 다만 라이브러리를 사용하면 함수형 컴포넌트 기반 코드에서도 Error Boundary를 활용할 수 있다.

- **Q. Error Boundary를 애플리케이션 전체에 하나만 적용하면 되는가?**
  → 반드시 그렇지는 않다. 하나만 두면 전체 UI가 하나의 오류 경계에 묶인다. 실제 서비스에서는 **페이지 단위나 주요 기능 단위로 적절하게 분리**해 오류가 발생한 영역만 fallback UI로 교체하는 방식이 유리하다.

## 목표

- Error Boundary의 역할과 **오류 격리 개념**을 설명할 수 있다.
- `getDerivedStateFromError`와 `componentDidCatch`의 차이를 설명할 수 있다.
- Error Boundary가 **잡을 수 있는 오류와 잡을 수 없는 오류**를 구분할 수 있다.
- Fallback UI를 사용하는 이유를 설명할 수 있다.
- 실제 서비스에서 **어느 범위에 Error Boundary를 배치할지** 판단할 수 있다.
