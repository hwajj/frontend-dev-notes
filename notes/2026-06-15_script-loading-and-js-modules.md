# 스크립트 로딩(defer·module)과 JS 모듈(CommonJS·번들러)

> 작성일: 2026-06-15  
> 맥락: defer가 뭔지, React에서 왜 defer를 직접 안 쓰는지, require는 왜 브라우저에서 안 되는지  
> 범위: JavaScript·브라우저 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- `<script>`를 넣으면 브라우저가 HTML 읽기를 멈추나?
- `defer`, `async`, `type="module"`은 뭐가 다른가?
- React/Vite는 defer를 직접 안 붙여도 되나?
- `require`는 JavaScript 문법인가? 브라우저는 왜 모를까?

## 핵심 정리 (결론부터)

| 방식 | HTML 파싱 | JS 실행 시점 | 실행 순서 |
|------|-----------|--------------|-----------|
| `<script src="app.js">` (기본) | **멈춤** (parser blocking) | 다운로드 직후 | HTML 순서 |
| `<script defer src="app.js">` | 계속 | HTML 파싱 **끝난 뒤** | HTML 순서 |
| `<script async src="app.js">` | 실행할 때 잠깐 멈춤 | **다운로드 끝나면 즉시** | **순서 보장 없음** |
| `<script type="module" src="main.js">` | 계속 | HTML 파싱 **끝난 뒤** | 대체로 defer와 비슷 |

| 구분 | CommonJS | ES Module (표준) |
|------|----------|------------------|
| 등장 | Node.js용 | JavaScript 표준 |
| 보내기 | `module.exports` | `export` |
| 가져오기 | `require("./math")` | `import { add } from "./math.js"` |
| 브라우저 | **원래 모름** → 번들러가 처리 | **브라우저가 직접 이해** |

**한 줄 결론:** React는 defer 속성을 직접 안 쓴다 — `type="module"`이 defer 효과를 이미 주고, 스크립트는 body 맨 아래에 있기 때문. `require`는 JS 문법이 아니라 Node 전용 API다.

## 배경 지식 (짧게만)

- **브라우저:** HTML을 위에서 아래로 읽으며 화면을 만든다.
- **`<script>`:** JS 파일을 가져와 실행한다. 기본 동작은 HTML 읽기를 잠깐 멈춘다.
- **Node.js:** HTML 없이 서버에서 JS만 실행. 파일끼리 연결하려고 `require`를 만들었다.
- **번들러(Webpack 등):** 빌드할 때 여러 JS 파일을 브라우저가 실행할 **하나의 파일**로 합친다.
- **실행 환경 API:** `console.log`, `fetch`, `require`는 JS 문법이 아니라 Chrome·Node가 제공하는 기능이다.

## 한눈에 — 스크립트 로딩 역사 (1→5)

```
1. <head>에 <script>        → HTML 읽기 중단 (parser blocking)
        ↓
2. <body> 맨 아래 script    → 개발자 우회 (DOM 먼저, blocking은 남음)
        ↓
3. <script> 여러 개 + 전역  → 이름 충돌 → Node는 require, 브라우저는 Webpack
        ↓
4. defer / async (HTML5)    → 브라우저가 "언제 실행할지" 공식 속성으로 답
        ↓
5. type="module" (ESM)      → defer + import/export → Vite/React가 이걸 씀
```

React가 `<script defer>`를 직접 안 쓰는 이유는 **5번까지 와 있어서 4번을 HTML에 또 적을 필요가 없기 때문**이다.

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| parser blocking | `<script>`를 만나면 HTML 파싱이 멈추는 것 |
| defer | 다운로드는 미리, 실행은 HTML 다 읽은 뒤 |
| async | 다운로드 끝나면 즉시 실행, 순서 보장 없음 |
| ES Module (ESM) | `import`/`export` — 브라우저·Node 공통 표준 |
| CommonJS | `require`/`module.exports` — Node가 만든 모듈 방식 |
| 번들러 | 빌드 시 여러 파일을 하나로 합치는 도구 |

---

## 1. defer — HTML 읽는 중 JS가 방해하지 않게

### 한 줄 요약

`defer` = 다운로드는 미리 하고, 실행만 HTML 파싱이 끝난 뒤에 한다.

### defer 없을 때 (parser blocking)

```html
<script src="app.js"></script>
```

```
HTML 읽음 → script 발견 → HTML 읽기 중단
  → app.js 다운로드 → 실행 → HTML 읽기 재개
```

JS가 HTML 파싱을 **막는다**.

### defer 있을 때

```html
<script defer src="app.js"></script>
```

```
HTML 읽음 + app.js 다운로드 (동시)
  → HTML 파싱 완료 → app.js 실행
```

defer 여러 개면 **다운로드는 병렬**, **실행은 a → b → c 순서 보장**.

### async와 차이

`async`는 다운로드 끝나는 즉시 실행. b, c, a 순으로 실행될 수도 있다.

### 왜 그런가 — 역사 1~4를 알아야 defer가 이해된다

| 단계 | 방식 | 무엇을 해결했나 |
|------|------|-----------------|
| 1 | `<head>`에 script | (문제) 파싱 중단, DOM 없을 때 JS 실행 |
| 2 | `<body>` 맨 아래 | (우회) DOM 먼저 만들기 — 표준이 아닌 관례 |
| 3 | script 여러 개 + 전역 | (문제) 변수 충돌 → Node/Webpack으로 모듈화 |
| 4 | defer / async | (표준) "언제 실행할지"를 HTML 속성으로 정의 |
| 5 | `type="module"` | defer 효과 + `import`/`export` |

defer만 보면 "파싱 안 막는 속성"으로만 보인다. **1~3의 고통 뒤에 나온 4번 해법**이라는 맥락이 있어야 한다.

### React는 defer를 직접 안 쓴다

**이유 1 — `type="module"`이 이미 defer처럼 동작**

```html
<script type="module" src="/assets/index.js"></script>
```

HTML 파싱 안 막음 → HTML 끝까지 읽음 → 모듈 실행.

**이유 2 — 스크립트가 body 맨 아래**

```html
<body>
  <div id="root"></div>
  <script type="module" src="main.js"></script>
</body>
```

`root` div를 먼저 만든 뒤 React가 mount한다. 옛날 `<head>` + `getElementById` null 문제와 다르다.

### 주의할 점

defer를 쓰면 **첫 화면이 SSR만큼 빨라지는 건 아니다.** HTML 5KB, JS 2MB라면 defer를 써도 JS 다운로드 → 실행 → 렌더는 그대로다. SPA에서 사용자가 보는 UI는 대부분 JS 실행 후에 만들어진다 — defer와는 별개의 이야기다.

---

## 2. CommonJS·require·Webpack

### 한 줄 요약

`require`는 JavaScript 문법이 아니라 **Node가 제공하는 함수**. 브라우저는 제공하지 않는다.

### 역사 (짧게)

```
전역 스크립트 시대 (<script> 여러 개, window에 함수 올림)
  ↓
CommonJS (Node — 파일 하나 = 모듈, require/module.exports)
  ↓
Webpack 시대 (브라우저는 require 모름 → 빌드 때 bundle.js로 합침)
  ↓
ES Module (import/export — 브라우저가 직접 이해)
```

### require는 JS 문법이 아니다

| 환경 | `require("./add")` |
|------|---------------------|
| Node | 동작 — Node가 제공 |
| Chrome | `ReferenceError: require is not defined` |

`console.log`, `fetch`, `require`는 전부 **실행 환경이 제공하는 기능**이다.

### 계산기 홈페이지 비유 (Webpack)

```
project/
  add.js   ← module.exports = add
  app.js   ← const add = require("./add")
```

- **Node:** `node app.js` → Node가 require 처리 → 동작.
- **브라우저:** `<script src="app.js">` → require에서 바로 에러.

**Webpack (빌드 시 실행):**

1. `require("./add")`를 **분석** — "add.js 필요하구나"
2. add.js + app.js를 **합쳐서** bundle.js 생성
3. bundle.js 안에는 require 호출이 **없음**

```javascript
// bundle.js (느낌만)
function add(a, b) { return a + b; }
console.log(add(1, 2));
```

브라우저는 require를 **실행한 적이 없다**. Webpack이 합쳐 준 결과물만 받는다.

> 정확히: "Node의 add 기능"이 아니라 **내가 만든 add.js**(또는 lodash)를 번들에 넣어 주는 것.

### ES Module — 브라우저가 import를 이해한다

`import` / `export`는 JavaScript **표준**이다. 모던 브라우저는 `type="module"` 스크립트 안에서 `import` 경로를 **스스로** 따라가며 파일을 가져온다.

```html
<script type="module" src="main.js"></script>
```

```javascript
// main.js
import { add } from "./add.js";
```

Webpack 없이도 브라우저가 `main.js` → `add.js` 순으로 요청·실행할 수 있다. CommonJS 시절에는 브라우저가 `require`를 몰랐기 때문에, **돌아가게 만드는 일** 자체를 Webpack이 맡았다.

### 개발과 배포 — 번들러 역할이 바뀐다

ESM 이후 Vite·Next 같은 도구를 쓰면 **개발**과 **배포**가 이렇게 갈라진다.

**개발 (`npm run dev`)**  
브라우저는 `type="module"`로 `src/main.tsx`를 받고, `import`를 만날 때마다 Vite가 **그 파일만** 변환해 응답한다. 수백 개 파일을 미리 하나로 합치지 않는다. ESM 덕분에 “일단 돌아가게” 하려면 dev에서 거대한 bundle이 **필수는 아니다**.

**배포 (`npm run build`)**  
Rollup 등이 의존성 그래프를 분석해 `assets/index-xxxxx.js`처럼 **합치고·압축한** 파일 몇 개를 만든다. 사용자 브라우저는 이 **빌드 결과물**만 받는다 — dev 때처럼 파일마다 import 요청을 날리지 않는다.

| | Webpack + `require` | ESM + Vite/Next |
|---|---------------------|-----------------|
| 브라우저 | `require` 모름 | `import` 이해 |
| 개발 | 보통 bundle 후 서빙 | **파일 단위** 서빙 |
| 배포 | bundle.js | `build` → **합친·압축된** chunk |
| 번들러 | **없으면 실행 불가** | dev는 거의 불필요, **배포에서 최적화** |

배포에서 번들하는 이유는 “dev에서도 했으니까”가 아니다. dev는 **속도·디버깅**을 위해 파일 단위로 두고, **배포할 때** 비로소 묶는다. 소스가 import로 파일 200개로 쪼개져 있으면 그대로 올리면 요청이 200번 날아갈 수 있다. minify·tree-shaking(안 쓰는 코드 제거)·gzip, 라우트별 `dynamic import()` 분할, CommonJS만 제공하는 npm 패키지 변환 — 이건 **실사용자에게 나가는 JS**를 줄이고 나누기 위한 **배포 단계** 작업이다.

```
개발 (npm run dev)
  브라우저 ← type="module" ← src/main.tsx
  import마다 → Vite가 해당 파일만 변환·응답

배포 (npm run build)
  Rollup이 그래프 분석 → assets/*.js 몇 개
  브라우저 ← 합쳐진 빌드 결과만
```

정리하면, ESM은 **「브라우저가 모듈을 직접 로드할 수 있다」** 는 뜻이지 **「번들러가 사라진다」** 는 뜻이 아니다. 번들러 일은 **「require 대신 해석」** 에서 **「배포 최적화」** 로 옮겨 갔다.

### 주의할 점

`require`는 Node API이므로 브라우저에서 쓰려면 `import`로 바꾸거나, 빌드 때 번들러가 처리해야 한다. ESM을 쓴다고 build가 없어지는 건 아니고, React/Vite/Next 실서비스는 보통 `npm run build` 결과를 올린다.

---

## 기억할 것

| 주제 | 기억 한 줄 |
|------|------------|
| defer | HTML 파싱 안 막고, JS는 문서 다 읽은 뒤 실행 |
| 역사 1→5 | head blocking → body 끝 → 전역/번들 → defer → module |
| type="module" | defer 효과 + import/export — React/Vite가 사용 |
| SPA 첫 화면 | defer는 파싱 막힘만 줄임. 콘텐츠 표시는 여전히 JS 실행·렌더가 필요 |
| require | Node 전용 API, JS 문법 아님 |
| Webpack | require를 실행이 아니라 **분석**해서 bundle로 합침 |
| ESM + 배포 | dev는 파일 단위 / `build`에서 bundle·minify |

## 흔한 오해

| 착각 | 실제 |
|------|------|
| require는 JS 문법이다 | Node가 만든 함수. 브라우저는 기본 제공 안 함 |
| Webpack이 Node 코드를 가져온다 | **내가 쓴 모듈 파일**(또는 npm 패키지)을 bundle에 넣음 |
| body 끝 = defer와 같다 | body 끝은 관례적 우회. defer/module은 표준 동작 |
| ESM이면 번들러 불필요 | dev는 필수 아님. 실서비스는 `build`로 번들·최적화 |

## 더 볼 것 (선택)

- `async` — GA·광고처럼 순서 무관한 스크립트용
- dynamic `import()` — 필요할 때만 JS 로드 (code splitting)
- SSR/SSG — 첫 HTML에 콘텐츠를 넣어 LCP 개선 (defer와 별개 주제)
