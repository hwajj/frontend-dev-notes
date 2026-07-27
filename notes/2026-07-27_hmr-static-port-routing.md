# 정적 자원·HMR WebSocket의 타겟 포트 결정

> 작성일: 2026-07-27  
> 맥락: 통합 게이트웨이(`:3000`)로 여러 앱을 붙였을 때, JS/CSS·HMR 소켓이 **어느 앱 포트**로 가야 하는지 깨지거나 엉킨 앱으로 붙을 때  
> 본문 주제: referer · 쿠키로 upstream 선택 · WebSocket upgrade 프록시 · 런타임 포트 override  
> 관점: HTML path 프록시만으로는 부족하다 — **확장자 없는 “앱 페이지”와 달리, `/static`·WS는 path만 보면 앱을 알 수 없다**  
> 범위: 로컬 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- `/care` 페이지를 보는데 `/static/js/...` 요청은 왜 path에 `care`가 없나?
- HMR(핫 리로드) 소켓은 브라우저가 게이트웨이로 붙는데, 실제로는 어느 포트와 대화하나?
- 기본 포트 표와 다르게 앱을 띄웠을 때 어떻게 고치나?

## 핵심 정리 (결론부터)

| 요청 종류 | URL만으로 앱을 알 수 있나 | 흔한 힌트 | 게이트웨이가 할 일 |
|-----------|---------------------------|-----------|-------------------|
| A. 앱 HTML/라우트 | ✅ path prefix (`/care/...`) | `ROOT_PATH` | path → 포트 프록시 |
| B. 번들·이미지 등 정적 | ❌ `/static/...`, `/@vite` 등 | **Referer** 또는 **currentApp 쿠키** | 힌트로 upstream 선택 |
| C. HMR WebSocket | ❌ `/ws`, SockJS 등 | 동일 (쿠키·Referer) | HTTP가 아닌 **upgrade** 프록시 |
| D. 포트가 표와 다름 | — | override 맵 | 기본 포트 대신 임시 포트 사용 |

한 줄: **페이지는 path로, 정적·HMR은 “지금 보고 있는 앱” 힌트로** upstream을 고른다.

## 배경 지식 (짧게만)

- **정적 자원**: JS/CSS/이미지 등. 번들러가 `/static/js/main.js`처럼 **앱 prefix 없이** 경로를 주는 경우가 많다.
- **Referer 헤더**: “이 요청을 유발한 페이지 URL”. `/care` 페이지에서 받은 스크립트가 `/static/...`을 요청하면 Referer에 `/care`가 남을 수 있다.
- **쿠키**: 게이트웨이가 path 매칭 시 `currentApp=care`처럼 심어 두면, Referer가 비어도 힌트가 남는다.
- **HMR**: 저장 시 화면을 부분 갱신. 브라우저↔개발 서버 사이 **WebSocket(또는 SockJS)** 장연결이 필요하다.
- **HTTP upgrade**: 처음엔 HTTP로 握手한 뒤 프로토콜을 WS로 바꾼다. Express `app.use`만으로는 부족하고, `server.on('upgrade', …)`에서 프록시해야 한다.
- **포트 override**: 상수 표를 고치지 않고, 런타임에 “care는 지금은 5001”처럼 바꾸는 맵.

## 한눈에

### 페이지 요청 (path로 충분)

```
GET http://localhost:3000/care/regist
  Referer: (없어도 됨)
  → path=/care → upstream :5000
  → Set-Cookie: currentApp=care
```

### 정적 요청 (path만보면 모름)

```
GET http://localhost:3000/static/js/bundle.js
  Referer: http://localhost:3000/care/regist
  Cookie: currentApp=care
  → getTargetPort(referer, cookie) → :5000
  → 프록시
```

### HMR (upgrade)

```
브라우저 WS  →  ws://localhost:3000/sockjs-node/...
  Cookie: currentApp=care
  → server 'upgrade'
  → ws://localhost:5000/...  로 중계
```

### override

```
기본: care → 5000
POST /integrated/__port-config { appName: "care", port: 5001 }
이후 care 관련 HTTP·정적·(정책상) 조회 → 5001
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| Referer | 요청을 만든 문서의 URL 헤더 |
| `currentApp` | “지금 어떤 앱 path를 보는지” 쿠키 (이 레포 이름) |
| HMR | Hot Module Replacement — 저장 시 부분 갱신 |
| upgrade | HTTP → WebSocket 전환 핸드셰이크 |
| port override | 기본 포트 표를 런타임에 덮어씀 |
| SockJS | CRA가 쓰는 WS 호환 전송 계층(환경에 따라) |

---

## 관점

“프록시 path 표만 맞으면 통합 끝”이라는 착각이 정적·HMR에서 깨진다.  
`/static`은 **모든 앱이 비슷한 경로**를 쓰기 때문에, 게이트웨이는 **문맥(어느 앱 페이지에서 왔는가)** 이 필요하다.  
판단 축: (1) **누가** 힌트를 주나 — Referer vs 쿠키 vs 둘 다. (2) **언제** 힌트가 사라지나 — 새 탭, Referer 정책, 쿠키 미설정. (3) **얼마나** 포트가 고정인가 — 충돌·자동 +1 포트면 override가 SSOT를 잠깐 바꾼다.

## 한 줄 요약

통합 게이트웨이에서 정적·HMR은 **path 라우팅 + (Referer|쿠키)로 upstream 재선택 + WS upgrade 프록시**가 한 세트다.

## 함정 한 가지

HTML은 `/care`로 맞고 CSS/JS만 다른 앱(또는 5300 공통)에서 오면, **깨진 UI·이상한 HMR·침묵하는 갱신**으로 보인다. Network 탭에서 정적 요청의 **어느 upstream으로 프록시됐는지**(게이트웨이 로그의 확인한다.

## 왜 이렇게인가

### 언제 발생하나

- 같은 게이트웨이 Origin에서 **둘 이상**의 앱 개발 서버를 붙일 때
- 번들 경로가 **앱 prefix를 포함하지 않을** 때
- HMR이 **페이지 Origin(게이트웨이)** 으로 소켓을 열 때

단독으로 `localhost:5000`만 쓰면 Referer 문제가 거의 없다 — 요청이 처음부터 그 포트로 간다. **통합 모드에서만** 이 레이어가 필요하다.

### 왜 Referer와 쿠키를 같이 쓰나

| 힌트 | 강점 | 약점 |
|------|------|------|
| Referer | 페이지 URL에 path가 들어 있음 | 없거나 잘릴 수 있음 |
| 쿠키 | path 진입 시 서버가 심음 → 이후 요청에 첨부 | 첫 요청·잘못된 값이면 오진 |

이 레포 유틸은 **Referer로 앱 이름을 먼저** 찾고, 실패 시 쿠키 `appName`, 그래도 없으면 **common 기본 포트**로 떨어진다.

### WebSocket은 HTTP 미들웨어와 별개

`createProxyMiddleware`의 `ws: true`만으로 부족하거나, upgrade가 다른 서버 인스턴스로 가는 구성이 있다.  
명시적으로:

1. `http.createServer(app)`  
2. `server.on('upgrade', (req, socket, head) => { … proxy.ws(…) })`  
3. 타겟은 `getTargetPort`와 **같은 규칙**

이렇게 맞춰야 “페이지는 care인데 HMR은 common에 붙는” 증상을 줄인다.

### 포트 override가 필요한 경우

- 두 서비스가 표에서 **같은 기본 포트**를 공유  
- OS/CRA가 **포트 점유**로 `5000` 대신 `5001`을 선택  
- 임시로 다른 로컬 브랜치 서버에 붙일 때  

표 파일을 고치면 커밋 잡음이 생기므로, **런타임 맵 + 설정 UI/API**가 실용적이다.

## 참고 코드

path 진입 시 쿠키를 심는 미들웨어(문맥 저장).  
이 레포 `dev/with-common.js`:

```js
app.use((req, res, next) => {
  const matched = DEV_SERVER_LIST.find(({ path }) => req.url.startsWith(path));
  if (matched) {
    res.cookie('currentApp', SERVICE_NAME[matched.name], { path: '/', httpOnly: false });
  }
  next();
});
```

Referer·앱 이름으로 effective 포트를 고른다.  
이 레포 `dev/utils.js`:

```js
const getTargetPort = (referer, appName) => {
  if (referer) {
    const foundAppName = isRefererOf(referer);
    if (foundAppName) return getEffectivePortByApp(foundAppName);
  }
  if (appName in DEV_SERVER_PORT) return getEffectivePortByApp(appName);
  return getEffectivePortByApp(SERVICE_NAME.common);
};
```

정적 요청이면 위 규칙으로 target을 고른 뒤 프록시한다.

```js
const target = `http://localhost:${getTargetPort(referer, currentApp)}`;
return getStaticProxyMiddleware(target)(req, res, next);
```

HMR용 upgrade — HTTP 스택과 같은 포트 선택 함수를 재사용한다.

```js
server.on('upgrade', (req, socket, head) => {
  const currentApp = (req.headers.cookie || '').match(/currentApp=([^;]+)/)?.[1];
  const targetPort = getTargetPort(req.headers.referer, currentApp);
  const proxy = httpProxy.createProxyServer({
    target: `http://localhost:${targetPort}`,
    ws: true,
    changeOrigin: true,
  });
  proxy.ws(req, socket, head);
});
```

override API 예(개념):

```js
app.post(`${ROOT_PATH.integrated}/__port-config`, (req, res) => {
  const updated = setPortOverride(req.body?.appName, Number(req.body?.port));
  if (!updated) return res.status(400).json({ ok: false });
  res.json({ ok: true, config: getPortConfig() });
});
```

## 이 레포에서는

| 항목 | 위치·값 |
|------|---------|
| 쿠키 이름 | `currentApp` |
| 정적 판별 | 확장자 정규식 + `/static/`, `/@vite` 등 |
| WS 프록시 | `http-proxy` + `upgrade` |
| override UI | `/integrated/settings` |
| override API | `/integrated/__port-config` GET/POST/DELETE |
| 기본 표 | `dev/const.js` |

선행: [진입점·concurrently](./2026-07-27_dev-all-concurrently-ports.md) · [path 리버스 프록시](./2026-07-27_path-reverse-proxy-ports.md)

## 더 볼 것 (선택)

- Webpack Dev Server / Vite HMR 소켓 경로
- Referrer-Policy가 Referer를 줄이는 경우
- BFCache와 `Cache-Control: no-store` (이 레포 정적 프록시가 헤더를 덮어쓰는 이유)
