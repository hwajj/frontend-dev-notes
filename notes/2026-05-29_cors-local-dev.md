# 로컬 개발 — CORS, `/api`, 프록시, 서버 두 번 켜기

> 작성일: 2026-05-29  
> 맥락: CORS가 뭔지는 대충 아는데, **이 프로젝트에서는 왜 안 보이지?** / **Network에 URL이 왜 5173이지?** 가 안 풀릴 때.

---

## 먼저 이것만 — `client.ts` 한 줄이 하는 일

프로젝트에서 API 부를 때 **주소 앞부분**을 여기서 정한다.

```6:10:src/lib/api/client.ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
```

아래는 **위 한 줄을 위에서부터** 읽는 방법이다. 모르면 여기만 먼저 끝까지 읽어도 된다.

### ① `baseURL`이 뭐냐

axios로 `apiClient.get('/orders')` 처럼 부르면, 브라우저는 **baseURL + '/orders'** 를 합쳐서 요청한다.

| baseURL | 코드 | 브라우저가 실제로 치는 주소 |
|---------|------|---------------------------|
| `'/api'` | `get('/orders')` | **`/api` + `/orders`** → `/api/orders` (아래 ③ 참고) |
| `'http://localhost:3001/api'` | `get('/orders')` | `http://localhost:3001/api/orders` |

**기억:** `baseURL` = “API 주소의 **앞부분**을 미리 박아 두는 것”.

### ② `import.meta.env.VITE_API_BASE_URL` 이 뭐냐

- 프로젝트 **루트**에 `.env` 또는 `.env.local` 파일이 있으면, 그 안에 적은 값을 Vite가 읽어 온다.
- 이름이 **`VITE_`로 시작**해야 프론트 코드에서 쓸 수 있다.
- **파일이 없거나, 그 줄이 없으면** → 값은 `undefined`(비어 있음).

예시 (파일이 있을 때만):

```bash
# .env.local — 이 줄이 있으면 "왼쪽"이 채워진다
VITE_API_BASE_URL=http://localhost:3001/api
```

**이 레포 기본:** 보통 이 env **없음** → `VITE_API_BASE_URL`은 비어 있다.

### ③ `|| '/api'` 가 뭐냐 (진짜 중요)

JavaScript에서 `A || B` 는:

- **A가 있으면** → A 쓴다  
- **A가 비어 있으면(undefined)** → **B 쓴다**

그래서 이 프로젝트는:

```text
baseURL = (env에 VITE_API_BASE_URL 있나?)  ||  (없으면 '/api')
```

| 내 PC 상태 | baseURL이 되는 값 | 한 줄 설명 |
|------------|-------------------|------------|
| `.env`에 `VITE_API_BASE_URL=http://localhost:3001/api` **있음** | `http://localhost:3001/api` | 브라우저가 **3001을 직접** 친다 → CORS 나기 **쉬움** |
| env **없음** (팀 기본) | `'/api'` | 브라우저는 **지금 화면 주소에** `/api`만 붙인다 → CORS 안 나는 편 |

**`'/api'`만 있을 때 브라우저가 하는 일**

주소창이 `http://localhost:5173` 이면:

```text
'/api'  →  "호스트 없는 주소"  →  지금 탭 주소에 붙임
       →  http://localhost:5173/api/orders
```

**5173을 client.ts에 안 적었는데 5173으로 가는 이유**가 이거다.  
**3001은 브라우저가 직접 안 친다.** 3001로 가는 건 다음 절 `vite.config` 프록시.

### ④ 한 번에 그림 (env 없을 때 = 대부분)

```text
[1] client.ts
    baseURL = '/api'

[2] 코드
    apiClient.get('/orders')

[3] 브라우저가 치는 URL (Network 탭에 보이는 것)
    http://localhost:5173/api/orders
    ↑ 화면이 5173이니까 5173에 붙음

[4] Vite(5173)가 받아서 뒤에서
    http://localhost:3001/api/orders 로 대신 요청
    ↑ 이 구간은 브라우저 밖 → CORS 검사 없음

[5] Express(3001) 응답 → Vite → 브라우저
```

**질문:** “vite에 3001 있는데 왜 client는 `/api`야?”  
**답:** client는 **브라우저에게** 주소를 알려 주고, 3001은 **Vite가 몰래** 넘기는 곳이다.

### ⑤ env 넣으면 뭐가 바뀌나 (직통)

`.env.local`에 넣고 **dev 서버 재시작** 후:

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

```text
baseURL = http://localhost:3001/api
get('/orders') → http://localhost:3001/api/orders

화면은 여전히 http://localhost:5173
요청은 http://localhost:3001  → 포트 다름 → CORS 검사 대상
```

학습 끝나면 env **지우고** 재시작하는 걸 권장 (팀 기본은 env 없음).

---

## 내가 헷갈렸던 점

- vite에 3001 있는데 client는 `/api` → **브라우저 vs Vite** 역할이 다름 (위 ④).
- 5173이든 5174든 CORS 안 남 → **`/api`면 항상 “지금 Vite 포트”/api** (위 ③).
- server dev + 루트 dev → CORS가 아니라 **3001 두 번 켜기** 문제가 많음 (§3).

---

## 이 레포 나머지 코드 (위를 이해한 뒤)

**Vite — 브라우저가 `/api`로 온 요청만 3001로 넘김**

```11:18:vite.config.ts
    server: {
      port: Number(env.VITE_DEV_PORT) || 5173,
      proxy: {
        '/api': {
          target: `http://localhost:${env.VITE_API_PROXY_PORT || 3001}`,
          changeOrigin: true,
        },
      },
```

읽는 법: `'/api'`로 들어온 요청 → `target` 주소(기본 3001)로 **대신** 보낸다.

**Express — 브라우저가 3001을 직접 칠 때만 CORS 헤더가 중요**

```44:48:server/src/app.ts
app.use(
  cors({
    origin: IS_DEV ? "*" : (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'),
    credentials: true,
  }),
```

개발 모드는 `origin: "*"` 라 직통해도 **많은 경우** 통과한다. 그래도 Network에 **3001**이 보이면 “직통 모드”다.

**실행 — 루트에서 한 번만**

```7:9:package.json
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "npm run dev --prefix server",
```

---

## 1. CORS가 언제 나오나 (짧게)

- **브라우저** + **화면 주소(5173) ≠ API 주소(3001)** 일 때.
- 기본(`/api` + proxy)는 브라우저가 **5173/api**만 보므로 **안 나는 편**.
- env로 **3001 직통**이면 **나올 수 있음**.

Postman은 브라우저가 아니라서 CORS 규칙 자체가 없다.

---

## 2. 집에서 확인하는 방법 (손으로 따라 하기)

1. `npm run dev` (루트, 한 번만)
2. Chrome **F12 → Network**
3. 목록 아무 API 클릭 → **Request URL** 한 줄 적기

| Request URL | 의미 |
|-------------|------|
| `http://localhost:5173/api/...` | 정상 기본. CORS보다 **3001 서버 살아 있는지** |
| `http://localhost:3001/api/...` | env 직통. `.env`에 `VITE_API_BASE_URL` 있는지 |

4. 루트에 `.env.local` 있는지 열어 보기 → `VITE_API_BASE_URL` 줄 있으면 위 표 아래쪽.

---

## 3. 서버 두 번 켰을 때

`server/`에서 dev 켠 상태로 루트 `npm run dev`까지 하면 **3001을 두 번** 띄우려 해서 `EADDRINUSE`, `ECONNREFUSED`, `proxy error`가 난다. 이건 CORS가 아니다.

| 하고 싶은 것 | 이렇게 |
|--------------|--------|
| 그냥 개발 | 루트 **`npm run dev`만** |
| server만 따로 켜 둠 | 루트 **`npm run dev:client`만** |

CORS로 착각해서 `VITE_API_BASE_URL=3001` 넣으면 **오히려 진짜 CORS**가 날 수 있다.

---

## 면접 한 줄

dev에서 `/api` + 프록시는 브라우저가 same-origin만 보게 하고, Vite가 3001로 넘긴다. `VITE_API_BASE_URL`은 그 우회를 끄고 브라우저가 3001을 직접 보게 한다.
