# Node 17+에서 webpack 4(react-scripts 4)가 터지는 이유

> 작성일: 2026-06-08
> 맥락: `npm run dev`나 `react-scripts start`를 돌렸는데 `ERR_OSSL_EVP_UNSUPPORTED` / `digital envelope routines::unsupported`로 개발 서버가 바로 죽을 때

## 이 글의 질문

- Node를 최신으로 올렸는데 왜 갑자기 CRA(react-scripts)만 안 뜨나?
- `error:0308010C`는 프록시·포트 문제인가, 빌드 도구 문제인가?
- 당장 고치려면 Node를 내릴까, 환경 변수를 넣을까?

## 핵심 (먼저 읽기)

| 상황 | 결과 | 이 레포에서 |
|------|------|-------------|
| **Node 16 + webpack 4** | 보통 정상 기동 | `.nvmrc`가 16.20.2를 가리킴 |
| **Node 17+ (OpenSSL 3) + webpack 4** | 해시 단계에서 크래시 | Node 22로 `dev:all` 돌리면 COMMON(5300)이 먼저 죽음 |
| **`NODE_OPTIONS=--openssl-legacy-provider`** | 구 해시 알고리즘 허용 → 우회 가능 | 현재 스크립트에는 없음 (추가 시 로컬 Node 22에서도 기동 가능) |
| **react-scripts 5+ / webpack 5** | OpenSSL 3과 호환 | 대규모 업그레이드 — 당장 dev만 띄울 때는 보통 1·2번 |

**이 레포에서 프록시가 “안 되는 것처럼” 보인 이유:** 프록시(3000)는 살아 있어도, 뒤에 붙일 COMMON 앱(5300)이 OpenSSL 오류로 **먼저** 죽으면 연결 거절만 남는다. ([프록시·업스트림 노트](./2026-06-08_proxy-econnrefused-upstream.md))

## 전제 (30초)

- **Node.js**: 터미널에서 `npm start`를 실행하는 **런타임**(자바스크립트 엔진 + 시스템 라이브러리).
- **webpack**: 소스 파일을 묶어 브라우저용 번들을 만드는 **빌드 도구**. `react-scripts` 4는 내부에 webpack 4를 끼고 있다.
- **OpenSSL**: Node가 암호·해시 작업에 쓰는 **보안 라이브러리**. Node 17부터 버전 3이 기본이다.
- **해시(지문)**: 파일 내용을 짧은 값으로 요약해 캐시·청크 이름에 쓰는 일. webpack 4는 예전 방식(MD4 계열)을 쓴다.

## 한눈에

### 정상 경로 (Node 16 + webpack 4)

```mermaid
flowchart LR
  N[Node 16 / OpenSSL 1.1] --> W[webpack 4 번들]
  W --> H[createHash MD4 계열]
  H --> D[dev server :5300 기동]
```

### 실패 경로 (Node 22 + webpack 4)

```mermaid
flowchart LR
  N[Node 22 / OpenSSL 3] --> W[webpack 4 번들 시작]
  W --> H[createHash 시도]
  H --> X["ERR_OSSL_EVP_UNSUPPORTED"]
  X --> Z[5300에 아무도 없음]
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `react-scripts` | Create React App의 빌드·dev 서버 스크립트 묶음 (여기선 4.0.3) |
| webpack 4 | CRA 4가 끼는 구버전 번들러 |
| OpenSSL 3 | Node 17+ 기본 암호 라이브러리 — 일부 구 알고리즘 제거 |
| `ERR_OSSL_EVP_UNSUPPORTED` | “이 OpenSSL 버전에서는 그 해시/암호 방식을 지원하지 않음” |
| `NODE_OPTIONS` | Node 프로세스 전역 옵션 (예: legacy OpenSSL 모드) |
| `--openssl-legacy-provider` | 제거된 구 알고리즘을 다시 허용하는 우회 플래그 |

---

## 한 줄 요약

**최신 Node의 보안 라이브러리가 너무 엄격해져서, 옛 webpack이 쓰던 “파일 지문 알고리즘”이 막힌 것**이다. 프록시나 API가 아니라 **번들러가 서버를 못 띄운 것**이다.

## 함정 한 가지

**착각:** “ECONNREFUSED가 떴으니 프록시 설정이 틀렸다.”  
**실제:** 로그 **위쪽**에 `digital envelope routines::unsupported`가 있으면, 5300 포트에 dev 서버가 **한 번도 안 올라온 것**이다. 프록시는 빈 자리에 연결만 시도했다.

## 언제 발생하나

| 조건 | 터지나? |
|------|---------|
| Node **17 이상** | 예 |
| `react-scripts` **4.x** (webpack 4) | 예 |
| Vite·webpack 5·Next 등 최신 스택 | 보통 아니오 (다른 원인일 수 있음) |
| `npm run build` / `start` 모두 | 둘 다 webpack 해시를 쓰면 동일 증상 |

## 왜 이렇게인가

Node 17부터 OpenSSL 3이 기본이 되면서, 보안상 약하다고 분류된 해시 알고리즘(MD4 등)이 **기본 경로에서 제거**되었다. webpack 4는 번들 파일 이름·캐시 키를 만들 때 `crypto.createHash('md4')` 같은 호출을 쓰는데, OpenSSL 3 환경에서는 “unsupported”로 실패한다.

팀이 `.nvmrc`에 16을 적어 둔 이유도 여기에 가깝다: **앱 코드가 바뀌지 않아도 Node만 올리면 빌드 체인이 깨질 수 있기 때문**이다.

대안은 세 가지다. (1) Node 16 사용 — `.nvmrc`와 맞춤, 가장 예측 가능. (2) `NODE_OPTIONS=--openssl-legacy-provider` — 스크립트에 한 줄 추가, Node 22 유지 가능하지만 “구 알고리즘 허용”이라 장기 해법은 아님. (3) react-scripts 5 / webpack 5 이상으로 올리기 — 근본적이지만 마이그레이션 비용이 크다.

## 참고 코드

일반적으로 `react-scripts` 4는 package.json에 고정되어 있고, `start` 스크립트가 내부 webpack을 호출한다.

이 레포에서는 carenation(common)이 아래 조합이다.

```53:53:carenation/package.json
    "react-scripts": "4.0.3",
```

```67:69:carenation/package.json
    "dev": "set PORT=5300 && react-app-rewired start",
    "start": "set PORT=5300 && react-app-rewired start",
    "dev:all": "set PATH=%SystemRoot%\\System32;%PATH%&& concurrently --handle-input -n COMMON,INTEGRATED -c yellow,blue \"set BROWSER=none && set PORT=5300 && react-app-rewired start\" \"node dev/__init__.js\"",
```

에러 스택에 `webpack/lib/util/createHash.js`, `react-scripts/scripts/start.js`가 보이면 이 주제가 맞다.

## 이 레포에서는

| 항목 | 값·위치 |
|------|---------|
| 권장 Node | `carenation/.nvmrc` → `16.20.2` |
| 문제가 난 실행 | `dev:all`의 **COMMON** 프로세스 (`react-app-rewired start`, PORT 5300) |
| 증상 코드 | `ERR_OSSL_EVP_UNSUPPORTED`, `error:0308010C` |
| 우회(미적용) | `set NODE_OPTIONS=--openssl-legacy-provider&&` 를 start/dev:all 앞에 붙이는 패턴 (다른 레포에서 흔히 씀) |

## 더 볼 것 (선택)

- [Node.js OpenSSL 3 migration 가이드](https://nodejs.org/api/crypto.html#openssl-3-0)
- [webpack issue: OpenSSL 3.0](https://github.com/webpack/webpack/issues/14532) — 왜 webpack 5에서 바뀌었는지
- 같은 레포: [`.nvmrc`와 버전 불일치](./2026-06-08_nvmrc-node-drift.md), [프록시 ECONNREFUSED](./2026-06-08_proxy-econnrefused-upstream.md)
