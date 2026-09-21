# Day 3: 브라우저 렌더링(1)

## 키워드

- Browser Rendering
- DOM
- CSSOM
- Render Tree
- Critical Rendering Path
- HTML Parsing
- CSS Parsing

## 질문 예시

### 1. 브라우저 렌더링 과정 설명

> 브라우저는 HTML을 파싱해서 DOM을 만들고, CSS를 파싱해서 CSSOM을 만듭니다.
> DOM과 CSSOM을 결합해 Render Tree를 만들고,
> 이후 Layout → Paint → Composite 과정을 거쳐 화면에 렌더링합니다.

**HTML → DOM**
**CSS → CSSOM**
**DOM + CSSOM → Render Tree**
**Render Tree → Layout → Paint → Composite**

---

### 2. DOM이란?

- HTML 문서를 브라우저가 파싱한 객체 트리
- JavaScript를 통해 요소를 조회하거나 수정할 수 있음
- HTML의 모든 요소가 Render Tree에 포함되는 것은 아님

예:

- `<div>` → DOM에 존재
- `display: none` → DOM에는 존재하지만 Render Tree에는 포함되지 않음

---

### 3. CSSOM이란?

- CSS를 파싱해서 생성한 CSS Object Model
- 각 요소에 적용될 스타일 정보를 브라우저가 계산하는 데 사용됨
- DOM과 함께 Render Tree 생성에 사용됨

---

### 4. Render Tree란?

- 실제 화면에 렌더링할 요소들로 구성된 트리
- DOM과 CSSOM을 기반으로 생성됨
- `display: none`인 요소는 Render Tree에 포함되지 않음

단, `visibility: hidden`은 공간을 차지하기 때문에 Render Tree에 포함됨.

---

### 5. Critical Rendering Path

브라우저가 HTML 응답을 받은 이후 화면을 표시하기까지의 핵심 과정

```text
HTML
 ↓
DOM
 ↓
CSSOM
 ↓
Render Tree
 ↓
Layout
 ↓
Paint
 ↓
Composite
```

렌더링 성능을 이야기할 때 자주 등장하는 개념.

---

### 6. JavaScript가 렌더링에 미치는 영향

일반적인 `<script>`는 HTML 파싱을 중단시키고 JavaScript를 실행할 수 있음.

```html
<script src="app.js"></script>
```

따라서 스크립트의 로딩과 실행이 HTML 파싱을 지연시킬 수 있음.

`async`, `defer`를 사용하면 이러한 영향을 줄일 수 있음.

```html
<script src="app.js" defer></script>
```

---

## 목표

- 브라우저가 HTML을 DOM으로 변환하는 과정을 설명할 수 있다.
- CSS가 CSSOM으로 변환되는 과정을 설명할 수 있다.
- DOM과 CSSOM으로 Render Tree가 만들어지는 이유를 이해한다.
- `display: none`과 `visibility: hidden`의 렌더링 차이를 설명할 수 있다.
- Critical Rendering Path를 순서대로 설명할 수 있다.
- JavaScript와 CSS가 초기 렌더링에 어떤 영향을 주는지 설명할 수 있다.
- 면접에서 "브라우저에 URL을 입력하고 화면이 나타나는 과정"을 네트워크 단계와 렌더링 단계까지 연결해서 설명할 수 있다.

```



> **HTML은 DOM, CSS는 CSSOM으로 파싱되고, 둘을 결합해 Render Tree를 만든 뒤 Layout → Paint → Composite 과정을 거쳐 화면에 표시됩니다.**

그리고 **Day 3(1)**에서는 여기까지 잡고, 다음 Day 3(2)나 Day 4에서 **Layout/Reflow, Paint/Repaint, Composite, GPU, `transform`/`opacity`, 렌더링 최적화**로 들어가는 게 좋습니다.

이렇게 하면 면접에서 단순히 "렌더링 과정 외웠습니다"가 아니라 **왜 특정 CSS 변경이 성능에 영향을 주는지**까지 연결할 수 있습니다.

```
