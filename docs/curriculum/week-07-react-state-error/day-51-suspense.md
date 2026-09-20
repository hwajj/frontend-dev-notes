# Day 51: Suspense

## 키워드

- **Suspense** — React에서 특정 작업이 완료될 때까지 해당 컴포넌트 대신 `fallback` UI를 보여주는 기능.
- **`Suspense` / `fallback`** — `Suspense`로 로딩을 기다릴 컴포넌트를 감싸고, 대기하는 동안 `fallback`을 렌더링한다.
- **Code Splitting** — `React.lazy`와 Suspense를 이용해 필요한 시점에 컴포넌트를 로딩할 수 있다.
- **Lazy Loading** — 초기 로딩 시 모든 코드를 가져오지 않고 필요한 컴포넌트를 나중에 로드하는 방식.
- **Suspense Boundary** — 로딩을 처리할 UI의 범위를 결정하는 경계. 페이지 전체가 아니라 특정 영역만 로딩 상태로 만들 수 있다.
- **Streaming SSR** — 서버에서 HTML을 한 번에 모두 완성할 때까지 기다리지 않고 준비된 부분부터 전송하는 방식. Suspense Boundary와 함께 활용할 수 있다.

## 질문 예시

- **Q. Suspense란 무엇인가?**
  → 컴포넌트가 렌더링에 필요한 작업이 완료될 때까지 **대체 UI(`fallback`)를 보여주도록 하는 React 기능**이다. 코드 스플리팅이나 데이터 로딩과 함께 사용할 수 있다.

- **Q. `React.lazy`와 Suspense는 어떤 관계인가?**
  → `React.lazy`는 컴포넌트 코드를 **동적으로 로딩**하고, 로딩이 완료될 때까지 Suspense가 `fallback` UI를 보여준다.

- **Q. Suspense를 사용하면 API 요청의 모든 로딩 상태를 자동으로 처리할 수 있는가?**
  → 아니다. Suspense가 모든 `fetch` 요청을 자동으로 감지하는 것은 아니다. **Suspense를 지원하는 데이터 패칭 방식이나 프레임워크**가 필요하다. 일반적인 `useEffect + fetch`에서는 보통 `isLoading` 같은 상태를 직접 관리한다.

- **Q. Suspense Boundary를 여러 개 사용하는 이유는?**
  → 로딩 범위를 세분화하기 위해서다. 예를 들어 페이지 전체를 하나의 Suspense로 감싸면 일부 데이터만 늦어져도 전체가 fallback으로 바뀔 수 있다. 주요 영역별로 Boundary를 나누면 **준비된 UI는 먼저 보여주고 필요한 부분만 로딩 상태로 유지**할 수 있다.

- **Q. Suspense와 일반적인 `isLoading` 상태 관리의 차이는?**
  → `isLoading` 방식은 컴포넌트가 로딩 상태를 직접 관리하고 조건에 따라 UI를 렌더링한다. Suspense는 **로딩을 처리하는 경계를 컴포넌트 트리 바깥에서 선언적으로 정의**할 수 있다는 차이가 있다.

- **Q. Suspense와 Error Boundary는 어떻게 함께 사용할 수 있는가?**
  → Suspense는 **로딩 중인 상태**, Error Boundary는 **렌더링 오류가 발생한 상태**를 처리한다. 따라서 하나의 기능을 `ErrorBoundary`와 `Suspense`로 감싸 각각 오류와 로딩에 대한 fallback UI를 제공할 수 있다.

## 목표

- Suspense의 역할과 **`fallback`의 동작 방식**을 설명할 수 있다.
- `React.lazy`와 Suspense를 이용한 **Code Splitting / Lazy Loading**을 설명할 수 있다.
- Suspense가 일반적인 `fetch`의 로딩 상태를 **자동으로 처리하는 기능은 아니라는 점**을 이해한다.
- Suspense Boundary를 적절하게 분리해 **부분적인 로딩 UI**를 설계할 수 있다.
- **Suspense와 Error Boundary의 역할 차이**를 설명할 수 있다.
