# Supabase Session pool — 「15개만 연다」가 무슨 뜻인지

> 작성일: 2026-06-01  
> 맥락: `max clients reached ... pool_size: 15` 를 보고 **「세션을 15개만 연다」** 가 무슨 말인지, **사용자 로그인 세션**과 헷갈릴 때 읽는 글이다.  
> 앞에서 읽었다면: [DB 연결과 풀 — 처음부터 쉽게](./2026-06-01_db-connection-basics.md)

## 이 글의 질문

- Pooler **Session** 모드에서 **「15」** 는 정확히 **무엇 15개**인가?
- **「세션」** 이라는 말이 **로그인 세션**이랑 같은 말인가?
- Session pool(5432)이랑 Transaction pool(6543)은 **뭐가 다르고**, API 서버는 왜 6543을 쓰기도 하나?

## 핵심 (먼저 읽기)

| | **Session pool** (흔히 `:5432`) | **Transaction pool** (흔히 `:6543`) |
|---|------------------------------|-------------------------------------|
| **한 줄** | 클라이언트가 **연결을 잡고 있는 동안** Pooler 슬롯을 **계속 점유** | **쿼리(트랜잭션) 한 덩어리** 끝나면 슬롯을 **바로 반납** |
| **15의 의미** | 지금 **동시에 붙어 있는 클라이언트 연결**이 15개까지 | 한도가 다르고, **같은 수의 API 요청**을 더 받기 쉬움 |
| **비유** | 전화 **통화 중**인 줄이 15개 | **한 마디 말하고 끊는** 창구 — 줄이 빨리 돌아감 |
| **이 레포** | `DATABASE_URL`이 Session이면 dev에서 `EMAXCONNSESSION` 잘 남 | 마이그레이션 후보로 6543을 **시도** (`migration-connection.ts`) |

## 전제 (30초)

| 역할 | 하는 일 |
|------|---------|
| **API 서버** (Node) | 브라우저 대신 DB에 질문. `postgres` 라이브러리가 **연결 풀**을 가짐 |
| **PostgreSQL (DB)** | 진짜 데이터. 동시 접속이 무한은 아님 |
| **Pooler** (Supabase PgBouncer) | API 서버와 DB **사이** 안내 데스크. “연결 15개까지만 동시에 중계” 같은 규칙을 둠 |

**중요:** 여기서 말하는 **「세션」** 은 “로그인한 사용자 1명”이 **아니다**.

## 한눈에 — Session pool에서 「15」

```
[API 서버 프로세스]
   │  postgres 풀: 연결 A, B, C ... (최대 ~10개까지 열 수 있음)
   │
   ▼  각 연결 = Pooler에 "나 통화 시작할게" 한 줄
┌──────────────────────────────────────┐
│  Session Pooler  (슬롯 15칸)          │
│  [1][2][3] ... [15]  ← 꽉 차면 16번째 거부 │
└──────────────────────────────────────┘
   │  슬롯마다 실제 DB 연결로 이어짐 (내부적으로 재사용)
   ▼
[ PostgreSQL DB ]
```

**「세션을 15개만 연다」** 를 풀면:

> Pooler가 **“클라이언트 ↔ Pooler” 구간**에서 **동시에 살아 있는 연결**을 **15개까지만** 받아 준다.

## 한눈에 — Transaction pool (비교)

```
[API 서버]  "SELECT ..." 한 번
      │
      ▼  붙음 → 쿼리 실행 → 끊음 (슬롯 반납)
┌──────────────────────────────────────┐
│  Transaction Pooler                   │
│  슬롯이 빨리 돌아감 → 같은 15칸으로도   │
│  더 많은 요청을 순서대로 처리하기 쉬움   │
└──────────────────────────────────────┘
      ▼
[ PostgreSQL DB ]
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| **클라이언트 연결** | API 서버(또는 Studio)가 Pooler에 맺는 **TCP 연결 1개** |
| **Pooler 슬롯** | Pooler가 “지금 이 클라이언트 연결을 받아서 DB까지 이어 주는 **자리**” |
| **pool_size: 15** | 그 **자리가 15개**라는 설정(플랜·모드에 따라 다를 수 있음) |
| **Session (pool 모드)** | 연결이 **끊기기 전까지** 슬롯을 **계속 잡고 있음** |
| **Transaction (pool 모드)** | **트랜잭션 단위**로 슬롯을 잡았다 **놓음** |
| **postgres 풀 `max`** | **한 Node 프로세스** 안에서 Pooler에 열 수 있는 연결 **상한** (기본 ~10) |
| **로그인 세션** | JWT·쿠키로 “누구인지” 기억하는 것 — **이 글의 Session과 무관** |

---

## 목차

1. [Session pool — 「15개만 연다」 뜻풀이](#1-session-pool--15개만-연다-뜻풀이)
2. [Session vs Transaction — 언제 뭘 쓰나](#2-session-vs-transaction--언제-뭘-쓰나)

---

## 1. Session pool — 「15개만 연다」 뜻풀이

지금 절에서는 **Session** 이 무엇인지, **15** 가 무엇 15개인지, 로그인 세션과 어떻게 다른지 설명한다.

### 한 줄 요약

**Session pool의 「세션」= “API 서버 ↔ Pooler 사이 전화 통화가 끊기지 않은 상태”** 이고, **15 = 그 통화가 동시에 15통까지**라는 뜻이다.

### 「세션」이 로그인이 아닌 이유

| 말 | 의미 |
|----|------|
| **로그인 세션** | “김 OO 님이 로그인함” — **사용자** 단위, 브라우저·JWT |
| **DB / Pooler Session** | “이 **연결**으로 대화 중” — **전화선** 단위, Node·Studio·CLI |

로그아웃해도 dev 서버가 Pooler에 연결을 열어 두면 **DB Session 슬롯**은 그대로 잡힐 수 있다. 반대로 로그인 사용자가 50명이어도, 연결을 짧게만 쓰면 **슬롯 15**를 안 넘을 수 있다.

### 「15개만 연다」를 단계로

**1단계 — API 서버가 Pooler에 연결을 연다**

`postgres(connectionString)` 은 프로세스가 살아 있는 동안 **풀**을 만든다. 풀 안의 연결 하나 = Pooler에 **“나 줄 하나 쓸게”** 한 번.

**2단계 — Session Pooler는 “줄을 오래 쥔다”**

Session 모드에서는 클라이언트(Node)가 **끊기 전까지** Pooler의 **슬롯 1개**를 계속 점유한다.  
“한 번 물어보고 끊기”가 아니라 **“통화 유지”** 에 가깝다.

**3단계 — 슬롯이 15개**

Supabase Session pool 설정에서 **pool_size** 가 15면:

- 지금 **살아 있는** 클라이언트 연결이 15개면 **만석**
- 16번째 연결 시도 → `EMAXCONNSESSION` / `max clients reached`

에러 문장을 직역하면:

> Session 모드에서 **최대 클라이언트 수**에 도달했다. 한도는 **pool_size: 15**.

**4단계 — 왜 dev에서 금방 찰까**

한 dev 서버만 봐도:

```
프로세스 1개 × postgres 기본 max(~10)  ≈  Pooler에 최대 ~10줄 점유 가능
```

여기에 더해지는 것:

| 추가 요인 | 왜 슬롯을 먹나 |
|-----------|----------------|
| `tsx watch` 재시작 | **옛 프로세스** 연결이 잠깐 안 끊김 → 10 + α |
| Drizzle Studio | **또 다른 클라이언트** |
| 마이그레이션·테스트 | 같은 `DATABASE_URL` |

그래서 **“코드 한 줄이 15를 쓴다”** 가 아니라 **“프로그램 여러 개 + 프로세스마다 풀”** 이 15를 채운다.

### 비유로 다시 — 「통화 중인 줄 15개」

- **Pooler** = 콜센터 **대기 큐 담당**
- **Session** = 상담원이 **고객과 통화를 끊을 때까지** 그 줄을 못 비움
- **15** = 동시 통화 **최대 15건**
- **손님(웹 사용자)** = 콜센터 밖 사람. 직접 DB에 전화 안 함. **API 서버**만 전화함

“우리 서비스 회원 15명”이 아니라 **“지금 Pooler와 통화 중인 프로그램 연결이 15개”** 다.

### 함정 한 가지

**「세션 15개 = 동시 접속 사용자 15명」**  
→ **아니다.**  
한 사용자가 페이지를 열면 API 요청이 여러 개 와도, 보통은 **풀에서 연결을 빌렸다가 반납**한다. 다만 Session pool에서는 **“반납”이 Pooler 슬롯까지 바로 비우는 게 아니라**, Node가 **연결 자체를 유지**하는 동안 슬롯이 잡혀 있다.

또 하나:

**「SELECT 한 번 = 슬롯 1개만 잠깐」** (Transaction에 가까운 그림)  
→ Session pool에서는 **Node가 연결을 끊지 않으면** 슬롯이 **계속 잡혀 있을 수 있다.**

### 왜 이렇게인가 (Session pool이 존재하는 이유)

PostgreSQL은 연결 하나마다 **메모리·프로세스 비용**이 든다. DB에 클라이언트가 **수천 개** 직접 붙으면 DB가 먼저 쓰러진다.  
Pooler는 **많은 앱 연결**을 받아서 **적은 수의 DB 연결**로 묶어 준다.

Session 모드는 **PostgreSQL 기능 중 “연결이 유지되는 동안만 의미 있는 것”**(일부 prepared statement, SET 변수, LISTEN 등)을 **덜 깨뜨리기** 위해 쓴다. 대신 **슬롯을 오래 쥐므로** 동시 한도에 **빨리 닿는다.**

### 참고 코드

마이그레이션 쪽 주석 — Session(5432)에서 연결이 많으면 실패할 수 있음.

```7:8:server/src/db/migration-connection.ts
 * Supabase Session pooler(5432)는 EMAXCONNSESSION 으로 DDL·단발 스크립트가 실패할 수 있다.
 * 시도 순서: DATABASE_DIRECT_URL → direct 호스트 → transaction pooler(6543) → 원본 URL
```

앱 런타임은 **별도 옵션 없이** `DATABASE_URL` 그대로 연결.

```11:11:server/src/db/client.ts
const connection = postgres(connectionString);
```

### 이 레포에서는

| 항목 | 내용 |
|------|------|
| 에러가 난 경로 | `products` 등은 **만석 이후** 들어온 요청 |
| `DATABASE_URL` | Supabase 대시보드에서 **Session / 5432** 이면 이 글의 15 한도와 직결 |
| 사용자 수 | **제한 아님** — 연결 슬롯 제한 |

---

## 2. Session vs Transaction — 언제 뭘 쓰나

지금 절에서는 **5432(Session)** 와 **6543(Transaction)** 차이와, API·마이그레이션에 어떤 걸 쓰는지 정리한다.

### 한 줄 요약

**Session** 은 “연결을 오래 잡음 → 슬롯이 금방 찬다”, **Transaction** 은 “쿼리 묶음마다 슬롯 반납 → 같은 한도로도 더 많이 돌아감” — **일반 API 서버**는 Transaction(6543) + `prepare: false` 조합을 많이 쓴다.

### 비교 표

| | Session (`5432` 흔함) | Transaction (`6543` 흔함) |
|---|----------------------|---------------------------|
| **슬롯 점유** | 클라이언트 연결이 살아 있는 동안 | 트랜잭션 끝나면 반납 |
| **동시 API 많을 때** | 한도에 **빨리** 도달 | **버티기 쉬움** |
| **prepared statement** | Session에서 유리한 경우 있음 | Pooler 경유 시 **`prepare: false` 권장** (postgres.js) |
| **DDL·마이그레이션** | 연결 많으면 **실패하기 쉬움** | 후보 URL로 **6543 시도** (이 레포) |
| **직접 DB 연결** | `db.xxx.supabase.co` — Pooler 없음, 다른 한도 |

### 왜 API는 Transaction pooler를 쓰기도 하나

Express API는 대부분:

1. 요청 들어옴  
2. `SELECT` / `INSERT` 몇 번  
3. 응답  

→ **“연결을 몇 분간 붙잡을 이유”** 가 적다. Session pool에 붙이면 **슬롯만 오래 점유**하고 이득이 적은 경우가 많다.

Transaction pool은 **“한 요청 처리 = 슬롯 잠깐 빌림”** 에 가깝게 동작해서, **같은 pool_size 숫자**라도 **체감 동시 처리량**이 달라진다.

(숫자 15가 Transaction에서도 똑같은지는 **Supabase 플랜·설정**을 봐야 한다. 중요한 건 **모드에 따른 “슬롯을 얼마나 오래 쥐느냐”** 다.)

### 함정 한 가지

**「6543으로 바꾸면 무한 사용자」** → **아니다.**  
한도는 여전히 있고, Transaction은 **“슬롯을 빨리 돌려준다”** 뿐이다.  
또 **URL만 6543으로 바꾸고 `prepare: true`(기본)를 유지**하면 다른 오류가 날 수 있어, postgres.js + Supabase 조합에서는 **`prepare: false`** 를 같이 맞추는 경우가 많다 (구현 시 스펙에서 확정).

### 왜 마이그레이션은 Session이 싫은가

DDL(`CREATE TABLE` 등)은 **연결을 붙잡은 채** 여러 단계를 밟는다.  
이미 dev 서버·Studio가 Session pool 슬롯을 쓰고 있으면, 마이그레이션 스크립트가 **16번째**가 되어 `EMAXCONNSESSION` 이 난다.

그래서 이 레포는 **direct URL** 또는 **6543 Transaction** 을 **후보**로 돌린다.

```34:39:server/src/db/migration-connection.ts
      const transaction = new URL(pooled);
      transaction.port = '6543';
      transaction.searchParams.delete('pgbouncer');
      candidates.push({
        url: transaction.toString(),
        label: 'Supabase transaction pooler (:6543)',
```

반면 **일반 API `client.ts`** 는 아직 `DATABASE_URL` 한 줄만 쓰므로, env가 Session(5432)이면 **이 글 1절의 15 한도**에 그대로 노출된다.

### 이 레포에서 증상을 못 느낀 / 잘 느낀 이유

| 설정 | 결과 |
|------|------|
| `DATABASE_URL` = Session + dev 오래 켬 | **EMAXCONNSESSION** 잘 보임 |
| 마이그레이션만 6543/direct 시도 | 마이그는 되는데 **API는 여전히 Session** 이면 API만 터질 수 있음 |
| dev 서버 재시작 | 슬롯 비워져서 **잠깐 나아짐** (증상과 일치) |

### 실무에서 나누는 그림 (개념)

```
[브라우저] → [API 서버]
                 │
                 ├─ 평소 API  → Transaction pooler :6543 (+ prepare: false, max 작게)
                 │
                 ├─ 마이그레이션 → direct 또는 6543 (이 레포 후보 로직)
                 │
                 └─ (지금) client.ts → env의 DATABASE_URL 그대로 → Session이면 15 이슈
```

코드 변경은 **별도 작업**이다. 이 글은 **왜 6543 이야기가 나오는지** 이해용이다.

### 이 레포에서는

| 파일 | 역할 |
|------|------|
| `server/src/db/client.ts` | 런타임 — pool 모드·`max`·`prepare` **미분리** |
| `server/src/db/migration-connection.ts` | Session 한계 **인지**, URL 후보 |
| `server/.env` | `DATABASE_URL` / `DATABASE_DIRECT_URL` — **포트·호스트**로 Session 여부 판별 |

**확인 방법 (비밀번호 없이):** `DATABASE_URL` 호스트에 `pooler.supabase.com` 이 있고 포트가 **5432** 이면 Session pool 가능성이 크다. **6543** 이면 Transaction pool URL일 가능성이 크다.

---

## 더 볼 것 (선택)

- [Supabase — Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [PgBouncer — Pool modes](https://www.pgbouncer.org/features.html) (Session / Transaction / Statement)

## 면접 한 줄 (선택)

“Session pool의 15는 **로그인 세션 수**가 아니라 **Pooler에 동시에 붙어 있는 클라이언트 연결 수**다. Session은 슬롯을 오래 잡아서 dev에서 금방 차고, API 런타임은 Transaction pooler와 작은 `max`로 맞추는 경우가 많다.”
