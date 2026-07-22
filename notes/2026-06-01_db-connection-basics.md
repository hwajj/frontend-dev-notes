# DB 연결과 풀 — 처음부터 쉽게

> 작성일: 2026-06-01  
> 맥락: 로컬에서 API가 갑자기 500이 나고, 터미널에 `max clients reached`·`pool_size: 15` 같은 말이 보일 때 — “우리 서비스 사용자가 15명뿐?”이라고 헷갈리기 쉬운 상황을 풀기 위한 글이다.

## 이 글의 질문

- DB에 **“연결(connection)”** 이란 게 정확히 뭔가요?
- **연결 풀(pool)** 은 왜 쓰나요? 매 요청마다 새로 붙이면 안 되나요?
- Supabase에서 **15**라는 숫자는 **동시 사용자 15명** 뜻인가요?
- 왜 **로컬 개발**에서만 가끔 DB 에러가 나고, 재시작하면 잠깐 나아지나요?

## 핵심 (먼저 읽기)

| 구분 | 뜻 | 이 레포에서 |
|------|-----|-------------|
| **DB 연결** | 앱 서버 ↔ DB 사이 **전화 한 통** (질문·답 한 번에 쓰고 끊을 수도, 잠깐 붙잡을 수도 있음) | Express API가 `DATABASE_URL`로 Supabase(PostgreSQL)에 붙음 |
| **연결 풀** | 전화를 **미리 몇 통 열어 두고 돌려 쓰는** 방식 (매번 새로 거는 비용을 줄임) | `postgres` 라이브러리가 프로세스 안에서 풀을 가짐 |
| **15 한도** | **동시에 “통화 중”인 DB 연결 줄** 상한 (사람 수 아님) | Session pooler(보통 포트 5432) 쪽 Supabase 한도에 걸릴 때 `EMAXCONNSESSION` |
| **로컬에서만 잘 남** | dev 서버·Studio·watch 재시작이 **같은 줄을 여러 벌** 쓰기 때문인 경우가 많음 | `client.ts`는 풀 크기를 따로 줄이지 않음 → dev에서 쌓이기 쉬움 |

## 전제 (30초)

등장인물만 짚는다. 브랜드 이름은 나중에 나온다.

| 역할 | 하는 일 |
|------|---------|
| **브라우저** | 화면. DB에 **직접** 붙지 않음. 우리 API 서버에 HTTP 요청만 보냄 |
| **API 서버** (Node + Express) | “상품 목록 줘” 같은 요청을 받고, 필요할 때 **DB에 질문**한 뒤 JSON으로 응답 |
| **DB** (PostgreSQL) | 데이터가 실제로 저장된 곳. 질문은 **연결**을 통해 들어옴 |
| **Pooler** (Supabase가 앞에 둔 안내 데스크) | 연결이 너무 많이 DB까지 가지 않게 **중간에서 줄 세움** |

## 한눈에

**한 명의 사용자가 페이지를 연다** (개념만):

```
[브라우저] --HTTP--> [API 서버] --연결(풀에서 빌림)--> [Pooler?] --> [DB]
                         ↑
                    여러 API 요청이 와도
                    "사용자 1명 = 연결 1개 고정" 은 아님
```

**로컬에서 연결이 꽉 찬다** (증상 나는 쪽):

```
[dev 서버 프로세스] ── 최대 ~10연결 ──┐
[이전에 죽지 않은 dev 프로세스] ──?──┼──> [Pooler: 동시 15줄까지] --> [DB]
[Drizzle Studio 등] ────────────────┘
         ↑
    16번째가 붙으려 하면 거부 (EMAXCONNSESSION)
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| **연결(connection)** | 앱과 DB 사이에 맺는 **통신 채널** 한 개 |
| **풀(pool)** | 연결을 **여러 개 만들어 두고 재사용**하는 방식 |
| **동시 연결** | 지금 이 순간 **동시에 열려 있는** 연결 개수 |
| **Pooler** | DB 앞에서 연결을 **대신 받아 주는** 중간 계층 (Supabase가 제공) |
| **Session pooler** | 한 클라이언트가 연결을 **잡고 있는 동안** 슬롯을 오래 쓰는 모드 (흔히 포트 **5432**) |
| **Transaction pooler** | **쿼리 한 번** 끝나면 슬롯을 빨리 돌려주는 모드 (흔히 포트 **6543**) |
| **EMAXCONNSESSION** | “Session pool에 **빈 자리 없음**” 이라는 뜻에 가까운 에러 |
| **DATABASE_URL** | API 서버가 DB(또는 Pooler)에 붙을 때 쓰는 **주소 문자열** (비밀번호 포함, git에 올리지 않음) |

## 목차

1. [DB “연결”이 뭔지](#1-db-연결이-뭔지)
2. [연결 풀이 왜 있는지](#2-연결-풀이-왜-있는지)
3. [“15명만 쓸 수 있다” 착각 풀기](#3-15명만-쓸-수-있다-착각-풀기)
4. [로컬에서만 가끔 DB 에러](#4-로컬에서만-가끔-db-에러)

---

## 1. DB “연결”이 뭔지

지금 절에서는 **연결**이 무엇인지, 왜 API 서버만 DB에 붙는지 설명한다.

### 한 줄 요약 (또는 정책 한 줄)

DB 연결(connection)은 앱 서버와 DB 사이에 맺어진 통신 채널 하나다.

### 오해하기 쉬운 부분

"사용자가 로그인하면 DB 연결도 하나 생긴다."

→ 아니다.

브라우저는 DB에 직접 붙지 않는다.

브라우저
  ↓ HTTP
API 서버
  ↓ DB 연결
PostgreSQL

DB 연결은 API 서버 ↔ DB 사이에 생긴다.

### 왜 이렇게인가

브라우저가 DB에 직접 접근하는 구조는 보안·권한 관리·비즈니스 로직 처리 측면에서 문제가 많다.
그래서 일반적인 웹 서비스는
브라우저 → API 서버 → DB
구조를 사용한다.
우리 앱도 React 화면 → Express API → PostgreSQL(Supabase) 순으로 동작한다.
사용자가 상품 목록을 요청하면 브라우저는 Express API에 HTTP 요청을 보내고, Express가 필요할 때 DB에 질의한 뒤 결과를 다시 브라우저에 반환한다.
DB 연결은 이 과정에서 **Express ↔ DB** 구간에 생성된다.


### 참고 코드

Express 라우트가 `db`로 질의하는 모습 — “요청 올 때마다 서버가 DB에 물어봄”.

```18:30:server/src/routes/products.ts
router.get('/', async (req, res, next) => {
  try {
    // ...
    if (nursingHomeId) {
      const allowedCenterIds = await selectLogisticsCenterIdsForNursingHome(nursingHomeId);
```

DB 클라이언트는 앱이 켜질 때 **한 번** 만들어 두고 여러 라우트가 공유한다.
즉, 요청이 들어올 때마다
new postgres(...) 를 만드는 것이 아니라,
애플리케이션 전체가 하나의 연결 풀(pool)을 공유한다.

```11:12:server/src/db/client.ts
const connection = postgres(connectionString);
export const db = drizzle(connection, { schema });
```


---

## 2. 연결 풀이 왜 있는지

지금 절에서는 **매번 새 전화선을 뽑지 않고** 풀을 쓰는 이유를 설명한다.

### 한 줄 요약 (또는 정책 한 줄)

**풀**은 “연결을 **미리 몇 개** 만들어 두고, 요청이 올 때마다 **빌려 쓰고 반납**”하는 방식이다.

### 함정 한 가지

**“연결 1개면 동시 요청 1개만 처리된다”**고만 보면 헷갈린다.  
풀에 연결이 여러 개 있으면, **여러 요청이 동시에** 각각 다른 연결을 빌려 쓸 수 있다. 다만 풀 **최대 개수**를 넘으면 기다리거나, DB/Poller 쪽에서 **거절**한다.

### 왜 이렇게인가

연결을 새로 맺는 일(핸드셰이크, 인증)은 **느리고 비용이 크다**. 매 API 요청마다 새로 붙었다 끊었다 하면 서버가 버거워진다.  
그래서 Node 쪽 `postgres` 라이브러리는 기본적으로 프로세스 안에 **작은 연결 풀**(대략 최대 10개 전후)을 둔다.  
반대로 풀을 **너무 크게** 잡으면, DB 앞 Pooler의 “동시 줄 수”를 넘어서 **지금 겪은 에러**가 난다.

### 참고 코드

마이그레이션 스크립트는 **일부러** 연결을 1개만 쓰도록 맞춘 예시다 (한 번에 하나만 DDL).

```23:23:server/src/db/migrate.ts
  const sql = postgres(connectionString, { max: 1 });
```

일반 API용 `client.ts`는 `max`를 적지 않아 **라이브러리 기본 풀**을 쓴다.

```11:11:server/src/db/client.ts
const connection = postgres(connectionString);
```

### 이 레포에서는

| 구분 | 설정 |
|------|------|
| 일반 API | `client.ts` — 기본 풀 크기 |
| 마이그레이션 | `migrate.ts` — `max: 1` |
| 마이그레이션 URL 후보 | `migration-connection.ts` — Session pool 한계를 **알고** direct·6543 등을 시도 |

---

## 3. “15명만 쓸 수 있다” 착각 풀기

지금 절에서는 에러에 나온 **15**가 **사용자 수 제한이 아님**을 설명한다.

### 한 줄 요약 (또는 정책 한 줄)

**pool_size: 15**는 “로그인 가능 인원 15명”이 아니라, **지금 동시에 Pooler에 붙어 있는 DB 연결 줄이 15개까지**라는 뜻에 가깝다.
("동시에 유지 가능한 DB연결 수가 최대 15개)

### 함정 한 가지

**“우리 서비스는 15명밖에 못 쓴다”** → **아니다.**  
손님(브라우저 사용자)이 100명이어도, 각 요청은 연결을 **잠깐만** 쓰면 된다. 문제는 **동시에 열려 있는 연결**이 15를 넘을 때다.

### 왜 이렇게인가

Supabase 같은 호스팅은 DB 앞에 **Pooler**를 둔다. **Session** 모드(흔히 포트 5432)는 “한 연결이 세션을 오래 잡는” 방식이라, **동시 연결 상한**이 낮게 잡혀 있는 플랜이 많다.  
에러 메시지 `(EMAXCONNSESSION) max clients reached ... pool_size: 15` 는 **그 상한에 걸렸다**는 신호이지, 요금제의 “MAU 15명” 같은 의미가 아니다.

비유:

| 비유 | 15의 의미 |
|------|-----------|
| 식당 | 주방으로 가는 **통로 칸** 15개 |
| 손님 | 테이블에 앉은 **인원 수** (훨씬 많을 수 있음) |

### 참고 코드

레포 주석 — Session pooler(5432)에서 연결이 많으면 실패할 수 있다고 **이미 적어 둠**.

```7:8:server/src/db/migration-connection.ts
 * Supabase Session pooler(5432)는 EMAXCONNSESSION 으로 DDL·단발 스크립트가 실패할 수 있다.
 * 시도 순서: DATABASE_DIRECT_URL → direct 호스트 → transaction pooler(6543) → 원본 URL
```

### 이 레포에서는

| 질문 | 답 |
|------|-----|
| 사용자 15명 제한? | **아님** |
| 무엇이 15개? | Pooler(Session)에 동시에 잡힌 **연결 슬롯** |
| 프로덕션에서도 똑같이 터지나? | 트래픽·설정에 따라 다름. 보통 **Transaction pooler(6543)**·풀 `max` 조정으로 완화 |

---

## 4. 로컬에서만 가끔 DB 에러

지금 절에서는 **로컬 dev**에서 `max clients reached`가 잘 보이는 이유와 당장 할 수 있는 확인을 정리한다.

### 한 줄 요약 (또는 정책 한 줄)

로컬은 **dev 서버 + 코드 저장 시 자동 재시작 + DB GUI(Studio)** 가 같은 `DATABASE_URL`을 쓰며, **연결이 반납되지 않고 쌓이기** 쉽다 — 그래서 “가끔만, 재시작하면 잠깐 나음”이 흔하다.

### 함정 한 가지

**“내 코드 버그라서 products API만 깨진다”**고만 보면 엇나감.  
로그에 `products`·`categories` SELECT가 보여도, 원인은 **그 쿼리 문법**이 아니라 **연결 줄이 이미 꽉 찬 상태**인 경우가 많다.

### 왜 이렇게인가

1. **dev 서버 1개**가 `postgres` 기본 풀로 **최대 ~10연결**까지 열 수 있다.  
2. **`tsx watch`** 로 파일 저장 시 프로세스가 바뀌는데, **이전 프로세스의 연결**이 잠시 남을 수 있다.  
3. **Drizzle Studio**, 마이그레이션, 테스트가 **같은 DB URL**을 쓰면 줄이 더 찬다.  
4. 위가 합쳐져 Pooler **15칸**을 넘기면, 그다음 어떤 API든 같은 에러가 난다.

**프로덕션**은 프로세스가 하나로 정리되고, 사용자 수와 연결 수가 1:1이 아니어서 **같은 증상이 덜하거나**, 설정을 맞추면 **사용자 수백 명**도 가능한 구성이 일반적이다.

### 이 레포에서 증상을 못 느낀 / 잘 느끼는 경우

| 상황 | 연결 |
|------|------|
| 평소 화면만 쓸 때 | 요청마다 짧게 쓰면 **한도에 안 걸림** |
| 오래 dev 켜 두고 저장 반복 | watch 재시작 → **쌓임** |
| Studio + `npm run dev` 동시 | **같은 15칸** 경쟁 |
| `client.ts`에 풀 상한 없음 | Supabase Session 한도와 **맞춤 조정 안 됨** |

### 당장 확인·완화 (코드 없이)

1. `npm run dev` **완전히 중지** 후 다시 실행  
2. Drizzle Studio·마이그레이션·테스트 **종료**  
3. 1~2분 기다린 뒤 같은 API 재시도  
4. Supabase 대시보드에서 연결/풀 모드 확인 (Session 5432인지)

구조적으로는 `DATABASE_URL`을 Transaction pooler(6543)로 두고 `prepare: false`, `max`를 작게 두는 식으로 맞추는 경우가 많다 — **별도 작업·스펙 확정 후** 적용하는 편이 안전하다.

### 참고 코드

에러가 터졌을 때 스택에 자주 보이는 경로 (연결 고갈 **이후**의 피해자).

```47:47:server/src/lib/nh-allowed-centers.ts
  const rows = await db
```

```77:77:server/src/routes/products.ts
    const [allProducts, allCategories] = await Promise.all([
```

### 이 레포에서는

| 파일 | 메모 |
|------|------|
| `server/src/db/client.ts` | 앱 런타임 연결 — 풀 옵션 미설정 |
| `server/src/db/migration-connection.ts` | 마이그레이션만 Session 한계 우회 시도 |
| `server/.env` | `DATABASE_URL` 형태(호스트·포트)가 Session인지에 따라 dev 민감도가 달라짐 |

---

## 더 볼 것 (선택)

- [Supabase — Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres) (Session vs Transaction)
- postgres.js 문서의 `max` 옵션 (풀 크기)

## 면접 한 줄 (선택)

“DB 연결 풀 고갈은 **동시 사용자 수 제한이 아니라**, 앱·도구가 **동시에 잡은 DB 연결 수**가 Pooler/DB 한도를 넘었을 때 난다. 로컬에서는 watch·Studio가 겹쳐 더 잘 보인다.”
