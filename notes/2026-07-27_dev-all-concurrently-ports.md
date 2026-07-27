# 로컬 개발에서 여러 프로세스를 동시에 띄우기

> 작성일: 2026-07-27  
> 맥락: `npm run dev:all`로 띄웠는데 브라우저가 어떤 포트를 열어야 하는지, `start`만 했을 때와 무엇이 다른지 헷갈릴 때  
> 본문 주제: concurrently로 여러 자식 프로세스 병행 · `PORT` 환경 변수 · 브라우저 자동 오픈 억제  
> 관점: 개발 서버가 여러 개면, **주소창에 넣을 포트(진입점)** 와 **실제 앱이 리스닝하는 포트**를 먼저 구분한다  
> 범위: 로컬 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- `dev:all`은 `start`와 무엇이 다른가?
- 왜 앱은 5300에서 뜨는데 문서는 3000으로 접속하라고 하나?
- `BROWSER=none`, `PORT=…`는 각각 무엇을 바꾸는가?

## 핵심 정리 (결론부터)

| 방식 | 뜨는 것 | 브라우저에 넣을 주소 | 언제 쓰나 |
|------|---------|----------------------|-----------|
| A. 단일 앱만 (`start` / `dev`) | CRA(또는 Vite) **한 프로세스** | 그 앱의 `PORT` (예: 5300) | 공통 앱만 볼 때 |
| B. 통합 개발 (`dev:all`) | **앱 서버 + 게이트웨이** 두 프로세스 | **게이트웨이 포트** (예: 3000) | 여러 마이크로 프론트를 path로 묶을 때 |
| C. 앱만 직접 열기 (B인데 5300 접속) | 둘 다 떠 있어도 | 해당 앱만 보임 | 게이트웨이·쿠키·HMR 라우팅을 건너뜀 |

한 줄: **`dev:all`의 “진짜 입구”는 게이트웨이 포트다.** 앱 전용 포트는 백엔드(프록시 뒤)에 가깝다.

## 배경 지식 (짧게만)

- **개발 서버**: 소스 변경을 바로 반영해 HTML/JS를 주는 로컬 HTTP 서버. Create React App(CRA)·Vite 등이 만든다.
- **포트(port)**: 한 컴퓨터 안에서 “몇 번 창구”로 받을지. `localhost:3000`과 `localhost:5300`은 **다른 서버**다.
- **환경 변수 `PORT`**: CRA는 시작할 때 이 값으로 리스닝 포트를 정한다. 없으면 보통 3000.
- **concurrently**: npm 스크립트에서 **여러 명령을 한 터미널에서 동시에** 돌리는 도구. 로그에 이름·색을 붙일 수 있다.
- **게이트웨이(통합 서버)**: 브라우저에는 한 origin만 보이게 하고, path마다 뒤쪽 앱 서버로 넘겨 주는 Express 등.

## 한눈에

### 경로 A — `start`만 (단일 진입점)

```
터미널: npm start
        │
        ▼
   CRA ──리스닝──► :5300
        ▲
브라우저 주소창 = http://localhost:5300
```

### 경로 B — `dev:all` (진입점 ≠ 앱 포트)

```
터미널: npm run dev:all  (concurrently)
        │
        ├── COMMON ──► CRA :5300   (BROWSER=none → 자동으로 안 연다)
        └── INTEGRATED ──► Express :3000  (게이트웨이)
                              ▲
브라우저 주소창 = http://localhost:3000
        │
        └── /common/** 요청을 :5300으로 프록시
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| concurrently | 여러 shell 명령을 병렬 실행하는 npm 도구 |
| `PORT` | CRA 등이 바인딩할 포트 번호 |
| `BROWSER=none` | CRA가 시작 직후 기본 브라우저를 열지 않음 |
| 진입점 | 사람이 주소창에 넣는 origin(호스트+포트) |
| 게이트웨이 | path로 여러 로컬 앱에 나눠 주는 앞단 서버 |
| CRA | Create React App / `react-scripts`·`react-app-rewired` 기반 개발 서버 |

---

## 관점

흔한 착각은 “개발 서버가 떴으니 로그에 찍힌 아무 포트나 열면 된다”는 것이다.  
`dev:all`에서는 **프로세스가 둘**이므로, “누가 사람용 입구인가”를 먼저 정해야 한다.  
판단 축은 셋이다. (1) **누가** 브라우저를 여는가 — CRA 자동 vs 사람이 게이트웨이 URL. (2) **언제** 통합이 필요한가 — 한 앱만 vs path로 여러 앱. (3) **어느 포트**가 SSOT인가 — 앱 `PORT` vs 게이트웨이 listen 포트.  
도구 이름(concurrently, rewired)보다 **진입점과 백엔드 포트의 분리**가 본질이다.

## 한 줄 요약

통합 로컬 개발에서는 **브라우저 → 게이트웨이 포트**, **게이트웨이 → 각 앱 포트**로 역할을 나눈다.

## 함정 한 가지

`dev:all`인데 주소창에 **앱 포트(예: 5300)** 를 직접 넣으면, 게이트웨이가 심어 주는 path·쿠키·HMR 업그레이드 경로를 타지 않는다. “서버는 살아 있는데 통합만 안 된다”로 보인다.

## 왜 이렇게인가

### 언제 여러 프로세스가 필요한가

마이크로 프론트·레포 여러 개를 로컬에서 **한 사이트처럼** 보려면, 각 앱이 **각자 개발 서버(각자 포트)** 를 띄운 뒤, 앞단에 **하나의 origin**을 두는 패턴이 흔하다.  
한 프로세스에 모든 앱을 넣지 않는 이유: 번들러·HMR·의존성이 앱마다 다르고, 평소에는 한 앱만 단독으로도 돌리기 쉽기 때문이다.

### `PORT`가 하는 일

CRA 계열은 시작 시 `process.env.PORT`를 읽는다. OS별로 환경 변수 넣는 문법이 다르다.

| OS 계열 | 예 |
|---------|-----|
| Windows cmd | `set PORT=5300 && …` |
| Unix (mac/Linux) | `export PORT=5300 && …` 또는 `PORT=5300 …` |

같은 `package.json`에 `dev`(export)와 `start`(set)가 나란히 있는 경우가 많다 — **쉘이 다르면 한쪽만 동작**한다.

### `BROWSER=none`이 하는 일

CRA 기본은 서버가 ready되면 브라우저를 연다. 통합 모드에서는 **앱 포트로 자동 오픈하면 진입점이 틀어진다.**  
그래서 앱 쪽 명령에 `BROWSER=none`을 걸어, **사람이 게이트웨이 URL만 열도록** 유도한다.

### concurrently가 하는 일

한 npm 스크립트 문자열 안에 명령이 두 개면, 보통은 앞이 끝나야 뒤가 돈다.  
`concurrently`는 둘을 **동시에** 띄우고, `-n`으로 로그 prefix, `-c`로 색, `--handle-input`으로 입력을 자식에 전달한다.  
한쪽이 죽어도 정책에 따라 전체가 종료되거나(기본) 남을 수 있다 — 게이트웨이만 재시작 루프를 두는 설계도 있다.

## 참고 코드

일반적으로 npm 스크립트에서 “앱 + 게이트웨이”를 한 줄로 묶는 형태다.  
이 레포(`carenation`)에서는 `dev:all`이 그 역할을 한다.

```json
"start": "set PORT=5300 && react-app-rewired start",
"dev:all": "concurrently --handle-input -n COMMON,INTEGRATED -c yellow,blue \"set BROWSER=none && set PORT=5300 && react-app-rewired start\" \"node dev/__init__.js\""
```

게이트웨이 쪽은 죽으면 다시 띄우는 얇은 래퍼를 둘 수 있다.  
이 레포에서는 `dev/__init__.js`가 `with-common.js`를 spawn하고, 비정상 종료 시 1초 뒤 재시작한다.

```js
function resilientStart() {
  const child = spawn('node', ['dev/with-common.js'], { stdio: 'inherit' });
  child.on('exit', (code, signal) => {
    if (code === 0 || signal === 'SIGINT') process.exit(0);
    setTimeout(resilientStart, 1000);
  });
}
```

게이트웨이가 **어느 포트에 listen**하는지는 상수로 고정하는 편이 안전하다.  
이 레포에서는 `DEV_SERVER_PORT.integrated === 3000`이다.

```js
server.listen(DEV_SERVER_PORT.integrated, () => {
  console.log(`Local: http://localhost:${DEV_SERVER_PORT.integrated}`);
});
```

## 이 레포에서는

| 개념 | 이 레포 값 |
|------|------------|
| 공통 앱(CRA) | `PORT=5300`, 라벨 `COMMON` |
| 게이트웨이 | `node dev/__init__.js` → `dev/with-common.js`, 포트 **3000**, 라벨 `INTEGRATED` |
| 권장 주소창 | `http://localhost:3000` |
| 단독 실행 | `npm start` → `http://localhost:5300` |
| path → 포트 표 | `dev/const.js`의 `DEV_SERVER_PORT` / `ROOT_PATH` |

다음 글: [경로 기반 리버스 프록시](./2026-07-27_path-reverse-proxy-ports.md) — 3000이 path로 5300·5000 등에 넘기는 방식.

## 더 볼 것 (선택)

- CRA `PORT` / `BROWSER` 환경 변수 문서
- concurrently README (`-n`, `-c`, `--kill-others`)
- [정적·HMR 타겟 포트](./2026-07-27_hmr-static-port-routing.md)
