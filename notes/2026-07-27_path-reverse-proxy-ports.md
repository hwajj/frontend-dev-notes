# 경로 기반 리버스 프록시

> 작성일: 2026-07-27  
> 맥락: 브라우저는 `localhost:3000`만 보는데 `/care`, `/common`마다 실제로는 다른 개발 서버가 응답하는 로컬 통합 환경을 이해할 때  
> 본문 주제: reverse proxy · path prefix로 백엔드(앱 개발 서버) 선택 · 동일 Origin 유지  
> 관점: 여러 로컬 앱을 “한 사이트”로 보이게 하려면, **브라우저 Origin을 하나로 고정**하고 path만으로 뒤쪽 포트를 고른다  
> 범위: 로컬 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- `http://localhost:3000/care/...` 요청이 왜 5000번 서버로 가나?
- 각 앱을 5300·5000에 직접 열면 안 되나? 프록시가 왜 필요한가?
- path ↔ 포트 표는 어디에 두고, 잘못되면 어떤 증상이 나나?

## 핵심 정리 (결론부터)

| 구성 | 브라우저 Origin | API·쿠키·상대 경로 | 로컬 멀티 앱에 |
|------|-----------------|---------------------|----------------|
| A. 앱마다 직접 접속 (`:5300`, `:5000`) | **포트마다 Origin이 다름** | 쿠키 공유·절대 URL이 깨지기 쉬움 | ❌ 통합 UX와 다름 |
| B. path 리버스 프록시 (`:3000` + `/care` 등) | **Origin 하나** | path만 보고 뒤 포트로 전달 | ✅ 로컬 통합에 흔함 |
| C. 프로덕션 게이트웨이(nginx 등) | 배포 Origin 하나 | 같은 아이디어, 대상이 원격/컨테이너 | 운영과 대응 |

한 줄: **프록시는 “주소를 숨기는 마법”이 아니라, 브라우저에게는 한 Origin을 보여 주고 서버 쪽에서 path로 라우팅하는 장치다.**

## 배경 지식 (짧게만)

- **Origin**: 스킴 + 호스트 + 포트. `http://localhost:3000`과 `http://localhost:5000`은 **다른 Origin**.
- **리버스 프록시**: 클라이언트가 프록시에 요청하면, 프록시가 **다른 서버**에 대신 물어보고 응답을 돌려준다. 클라이언트는 뒤 서버 주소를 몰라도 된다.
- **path prefix**: URL 경로 앞부분(`/care`, `/common`). 라우팅 키로 쓴다.
- **동일 Origin의 이점**: 쿠키 `Path=/` 공유, 상대 URL(`/static/...`), CORS preflight 감소(같은 탭·같은 Origin 기준).
- **개발 서버(뒤쪽)**: 여전히 각자 포트에서 리스닝. 프록시는 **중계**만 한다. 뒤 서버가 꺼져 있으면 502/ECONNREFUSED류가 난다.

## 한눈에

### 시나리오 A — 앱 포트 직통 (Origin이 갈라짐)

```
브라우저 탭1  Origin http://localhost:5300  →  공통 앱
브라우저 탭2  Origin http://localhost:5000  →  케어 앱

쿠키·리다이렉트·“한 사이트” 가정이 깨지기 쉬움
```

### 시나리오 B — 게이트웨이 + path (이 글의 기본)

```
브라우저
  Origin: http://localhost:3000
       │
       ▼
  Express 게이트웨이 :3000
       │
       ├── /common/**     →  http://localhost:5300/common/**
       ├── /care/**       →  http://localhost:5000/care/**
       ├── /community/**  →  http://localhost:5500/community/**
       └── … (표에 등록된 path들)
```

### 시나리오 C — path는 맞는데 뒤 서버가 없음

```
GET http://localhost:3000/care/foo
  → 프록시가 :5000 으로 전달
  → care 개발 서버 미기동
  → 프록시 onError / 연결 실패 로그
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| reverse proxy | 클라이언트 ↔ (숨긴) 업스트림 서버 중계 |
| upstream | 프록시가 실제로 붙는 뒤쪽 서버(`localhost:포트`) |
| path prefix | `/care`처럼 라우팅에 쓰는 경로 앞부분 |
| `http-proxy-middleware` | Express에 붙이는 Node용 HTTP 프록시 미들웨어 |
| `ROOT_PATH` | 이 글에서 path prefix 상수 이름 |
| `DEV_SERVER_PORT` | 이 글에서 앱 이름 → 기본 포트 표 |

---

## 관점

“포트가 여러 개라서 복잡하다”가 아니라, **브라우저에게 몇 개의 Origin을 보이게 할 것인가** 문제다.  
앱마다 직접 열면 디버깅은 단순해 보이지만, 쿠키·리다이렉트·상대 정적 경로가 **프로덕션(한 도메인)** 과 달라진다.  
판단 축: (1) **누가** Origin을 하나 유지해야 하나 — 통합 QA·쿠키 의존 기능. (2) **언제** 직통이 나은가 — 한 앱만 고칠 때. (3) **얼마나** path 표가 SSOT인가 — 표와 실제 `PORT`가 어긋나면 “프록시는 도는데 빈 화면/에러”.

## 한 줄 요약

로컬 멀티 SPA 통합의 기본형은 **게이트웨이 한 포트 + path → upstream 포트 표**다.

## 함정 한 가지

표에 적힌 **기본 포트**와, 실제로 `npm start`한 앱의 `PORT`가 다르면 프록시는 “맞는 path”로 보이지만 **빈 포트**로 붙는다. (포트 충돌로 CRA가 5301을 고른 경우 등.) 이때는 override API나 표 수정이 필요하다 — 다음 글 참고.

## 왜 이렇게인가

### 조건 — 언제 path 프록시가 의미 있나

- 브라우저가 **하나의 호스트:포트**만 주소창에 두고
- URL path의 **앞부분**으로 “어느 제품/앱인지”를 구분하며
- 각 앱은 **이미 자기 포트에서** 개발 서버를 돌릴 때

서버 간(Node→Node) 호출이나 Postman으로 upstream에 직접 치면, Origin 문제는 없다. **탭의 JS·쿠키·상대 URL**이 얽힐 때 프록시 가치가 커진다.

### 목적 — CORS·쿠키만이 아니다

동일 Origin이면 CORS 이슈가 줄어드는 것은 부수 효과에 가깝다.  
더 직접적인 목적은 **프로덕션과 비슷한 URL 구조**(`/care/...`)를 로컬에서도 쓰고, 정적 파일·리다이렉트가 “다른 포트로 튀지” 않게 하는 것이다.

### 라우팅 규칙

1. 요청 URL이 `/care`로 시작하면 → care upstream  
2. `/common`이면 → common upstream  
3. 매칭 실패 시 → 게이트웨이 자체 정적(인덱스) 또는 404/토스트  

업스트림 URL은 보통 `http://localhost:{port}` + **원래 path를 유지**한 채 전달한다. (path rewrite를 하는 설정도 있으나, CRA `homepage`/basename과 맞추는 쪽이 이 패턴과 잘 맞는다.)

### 도구 비교 (같은 HTTP, 다른 주체)

| 시나리오 | 전체 URL 예 | 페이지 Origin | 누가 검사하나 |
|----------|-------------|---------------|---------------|
| A — Postman → upstream | `GET http://localhost:5000/care/x` | 없음 | 브라우저 규칙 없음 |
| B — 브라우저 직통 | 주소창 `http://localhost:5000/care/x` | `:5000` | 그 Origin 기준 쿠키·상대경로 |
| C — 브라우저+프록시 | 주소창 `http://localhost:3000/care/x` Request도 `:3000` | `:3000` | 프록시가 `:5000`으로 중계 |

HTTP 메서드·path가 같아도 **B와 C는 Origin이 다르다.**

## 참고 코드

일반적으로 “이름 → path → 기본 포트”를 한곳에 둔다.  
이 레포에서는 `carenation/dev/const.js`가 SSOT다.

```js
const DEV_SERVER_PORT = {
  integrated: 3000,
  care: 5000,
  common: 5300,
  community: 5500,
  /* … */
};
const ROOT_PATH = {
  care: '/care',
  common: '/common',
  /* … */
};
```

Express에 앱마다 프록시 미들웨어를 붙인다.  
이 레포에서는 `createServiceProxy(appName)`이 `ROOT_PATH[appName]` → `localhost:effectivePort`로 넘긴다.

```js
const proxy = createProxyMiddleware(rootPath, {
  target: `http://localhost:${targetPort}`,
  changeOrigin: true,
  logLevel: 'silent',
  onProxyReq: (_, request) => {
    console.log(`${request.method} ${request.url} → http://localhost:${targetPort}`);
  },
});
```

게이트웨이 부트스트랩에서 목록을 순회해 `app.use`한다.

```js
DEV_SERVER_LIST.forEach((server) => {
  app.use(createServiceProxy(server.name));
});
```

## 이 레포에서는

| path | 기본 upstream 포트 | 비고 |
|------|-------------------|------|
| (게이트웨이 listen) | 3000 | `integrated` |
| `/common` | 5300 | `dev:all`이 CRA를 같이 뜸 |
| `/care` | 5000 | care 레포를 따로 `start` |
| `/community` 등 | `const.js` 표 | 앱마다 기동 필요 |
| `/visitcare` | 표상 3000 | 게이트웨이와 **포트 숫자 충돌 여지** — override 검토 |

선행: [여러 프로세스·진입점](./2026-07-27_dev-all-concurrently-ports.md)  
다음: [정적·HMR이 어느 포트로 가는지](./2026-07-27_hmr-static-port-routing.md)

## 더 볼 것 (선택)

- HTTP reverse proxy vs forward proxy
- CRA `homepage` / React Router `basename`과 path prefix 정합
- nginx `location /care/` ↔ `proxy_pass` (운영 대응물)
