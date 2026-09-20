# (참고) 브라우저 렌더링 파이프라인

## 키워드

- CRP (Critical Rendering Path)
- DOM / CSSOM / Render Tree
- Layout (Reflow)
- Paint (Repaint)
- Composite
- 브라우저 렌더링 파이프라인
- Layout → Paint → Composite
- requestAnimationFrame
- IntersectionObserver
- 강제 동기 레이아웃 (Forced Synchronous Layout)
- Layout Thrashing

## 브라우저 렌더링 파이프라인

```text
HTML
 ↓
DOM

CSS
 ↓
CSSOM

DOM + CSSOM
 ↓
Render Tree
 ↓
Layout
 ↓
Paint
 ↓
Composite
 ↓
화면 출력
```

### Layout

각 요소의 위치와 크기를 계산하는 단계.

다음과 같은 변경은 Layout을 다시 발생시킬 수 있음.

- width / height
- margin / padding
- top / left
- font-size
- DOM 구조 변경

---

### Paint

Layout 결과를 바탕으로 실제 픽셀을 그리는 단계.

예:

- color
- background
- border
- box-shadow
- text

---

### Composite

이미 그려진 레이어들을 합성해서 최종 화면을 만드는 단계.

GPU가 관여할 수 있으며,
`transform`, `opacity`와 같은 속성은 상황에 따라
Layout/Paint를 다시 수행하지 않고 Composite 단계에서 처리할 수 있음.

---

# Reflow vs Repaint

## Reflow (Layout)

레이아웃을 다시 계산하는 것.

```text
DOM/CSS 변경
 ↓
Layout 재계산
 ↓
Paint
 ↓
Composite
```

영향 범위가 클수록 비용이 커질 수 있음.

---

## Repaint

레이아웃은 그대로지만
픽셀을 다시 그리는 것.

```text
스타일 변경
 ↓
Paint
 ↓
Composite
```

일반적으로 Reflow보다 비용이 작지만,
Paint 자체가 무거운 경우 성능 문제가 발생할 수 있음.

---

# 강제 동기 레이아웃

브라우저가 아직 Layout을 계산하지 않은 상태에서
레이아웃 정보를 읽으면 브라우저가 즉시 Layout을 계산해야 할 수 있음.

```js
element.style.width = "100px";

console.log(element.offsetWidth);
```

쓰기 → 읽기가 반복되면 Layout 계산이 여러 번 발생할 수 있음.

---

# Layout Thrashing

레이아웃 변경과 레이아웃 조회를 반복하면서
불필요한 Layout 계산을 발생시키는 현상.

```js
for (const element of elements) {
  element.style.width = element.offsetWidth + 10 + "px";
}
```

가능하면

```text
읽기
읽기
읽기
 ↓
쓰기
쓰기
쓰기
```

처럼 DOM 읽기와 쓰기를 묶는다.

---

# requestAnimationFrame

브라우저가 다음 프레임을 그리기 전에
실행할 작업을 예약하는 API.

```js
requestAnimationFrame(() => {
  element.style.transform = `translateX(${x}px)`;
});
```

애니메이션이나 화면 업데이트를
브라우저의 렌더링 주기에 맞춰 수행할 때 사용한다.

특히 `setTimeout`으로 애니메이션을 구현하는 것과 비교해서
브라우저의 프레임 생성 흐름에 맞춰 작업할 수 있다는 점이 중요하다.

---

# IntersectionObserver

요소가 viewport와 교차하는지 비동기적으로 관찰하는 API.

```js
const observer = new IntersectionObserver((entries) => {
  // 화면에 들어왔는지 확인
});

observer.observe(element);
```

대표적인 활용:

- 이미지 Lazy Loading
- 무한 스크롤
- 화면에 들어왔을 때 애니메이션 실행
- 광고 노출 감지

스크롤 이벤트에서 매번 `getBoundingClientRect()`를 호출해
직접 위치를 계산하는 방식보다 적절한 경우 성능상 유리하다.

---

# 스크롤/애니메이션이 느려지는 이유

면접에서는 단순히

> "Reflow가 발생해서 느립니다."

라고 끝내지 않는다.

다음 순서로 설명한다.

### 1. 메인 스레드가 바쁜가?

JavaScript 실행이 너무 오래 걸리면
브라우저가 다음 프레임을 제때 만들지 못한다.

```text
JavaScript
 ↓
렌더링 작업
 ↓
프레임 생성 지연
 ↓
Jank
```

### 2. Layout 비용이 큰가?

DOM 변경으로 Layout을 반복적으로 발생시키고 있는지 확인한다.

### 3. Paint 비용이 큰가?

복잡한 그림자, 큰 영역의 시각적 변경 등으로
Paint 비용이 증가할 수 있다.

### 4. Composite 단계에서 처리할 수 있는가?

애니메이션이라면 가능한 경우

```css
transform
opacity
```

등을 활용해 Layout/Paint 부담을 줄인다.

### 5. 불필요한 작업이 반복되고 있는가?

스크롤 이벤트마다 무거운 JavaScript를 실행하거나
DOM을 반복해서 읽고 쓰는지 확인한다.

---

# 브라우저 성능 문제를 보는 구조

```text
사용자 입력
 ↓
JavaScript
 ↓
Style
 ↓
Layout
 ↓
Paint
 ↓
Composite
 ↓
Frame
```

어느 단계에서 병목이 발생했는지를 찾는다.

---

## 질문 예시

### Q. 스크롤이 왜 버벅이나요?

단순히 스크롤 이벤트가 많아서가 아니라,

- 스크롤 이벤트에서 무거운 JS 실행
- DOM 레이아웃 정보 반복 조회
- 강제 동기 레이아웃
- Layout/Paint 비용 증가
- 너무 많은 DOM 처리

등으로 메인 스레드가 프레임을 제때 처리하지 못할 수 있다고 설명한다.

---

### Q. 애니메이션이 느려졌다면 어떻게 개선하겠어요?

1. Performance로 병목 구간 확인
2. Long Task / JS 실행 시간 확인
3. Layout/Paint 발생 여부 확인
4. DOM 읽기/쓰기 패턴 확인
5. 가능한 경우 `transform`, `opacity` 사용
6. `requestAnimationFrame` 활용
7. 불필요한 이벤트 처리 최소화
8. 화면 밖 요소는 `IntersectionObserver` 등을 활용해 처리

---

### Q. Reflow와 Repaint의 차이는?

- **Reflow:** 요소의 위치와 크기를 다시 계산
- **Repaint:** 계산된 레이아웃을 기반으로 픽셀을 다시 그림
- Layout 변경은 일반적으로 이후 Paint와 Composite까지 영향을 줄 수 있음
- Repaint는 Layout을 다시 계산하지 않고 Paint부터 다시 수행할 수 있음

---

### Q. transform이 애니메이션에 자주 사용되는 이유는?

`transform`은 상황에 따라 Layout을 다시 계산하지 않고
Composite 단계에서 처리할 수 있기 때문이다.

따라서 위치 이동 등의 애니메이션에서
Layout/Paint 비용을 줄이는 데 유리할 수 있다.

단, **transform을 쓴다고 무조건 GPU에서 모든 작업이 처리되거나
무조건 성능이 좋아지는 것은 아니다.**

---

## 목표

- CRP를 설명할 수 있다.
- DOM → CSSOM → Render Tree → Layout → Paint → Composite 흐름을 설명할 수 있다.
- Reflow와 Repaint의 차이를 설명할 수 있다.
- 강제 동기 레이아웃과 Layout Thrashing을 설명할 수 있다.
- `requestAnimationFrame`이 왜 애니메이션에 적합한지 설명할 수 있다.
- `IntersectionObserver`의 용도와 장점을 설명할 수 있다.
- 스크롤/애니메이션 성능 문제를 JS → Layout → Paint → Composite 관점에서 분석할 수 있다.
- "왜 이게 느리죠?"라는 질문에 **원인 → 측정 → 개선 방법** 순서로 답변할 수 있다.

```

특히 마지막 목표가 중요합니다.

**면접 답변의 기본 프레임을 이것으로 고정**해두면 됩니다.

> **"일단 Performance로 병목을 확인하고, JS 실행 시간이 긴지, Layout/Paint 비용이 큰지 확인합니다. 그다음 불필요한 DOM 작업이나 강제 동기 레이아웃이 있는지 보고, 애니메이션이라면 transform/opacity나 requestAnimationFrame 등을 고려합니다."**

이렇게 말하면 `Reflow가 뭔가요?` 수준을 넘어서 **실제로 성능 문제를 디버깅해본 개발자처럼 답변**할 수 있습니다.
```
