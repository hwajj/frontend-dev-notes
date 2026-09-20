이건 Day 1~3에서 배운 내용을 **하나의 스토리로 연결하는 챕터**로 두면 좋습니다. 다만 현재 키워드에는 `TCP/TLS`가 빠져 있어서, "주소창에 URL을 입력하면?"을 제대로 답하려면 넣는 게 좋습니다.

````markdown
# (참고) 웹 동작 원리

## 키워드

- 웹 동작 원리
- URL 구조
- DNS Lookup
- TCP
- TLS / HTTPS
- HTTP Request / Response
- CORS
- 쿠키 / 세션 / 토큰
- HTTP 상태 코드
- 브라우저 캐시
- DOMContentLoaded
- load
- defer / async

## 질문 예시

### 1. "브라우저에 URL을 입력하면 무슨 일이 일어나나요?"

전체 흐름:

```text
URL 입력
 ↓
URL 파싱
 ↓
DNS Lookup
 ↓
IP 주소 획득
 ↓
TCP 연결
 ↓
TLS Handshake (HTTPS)
 ↓
HTTP Request
 ↓
HTTP Response
 ↓
HTML 파싱
 ↓
DOM 생성
 ↓
CSSOM 생성
 ↓
Render Tree
 ↓
Layout
 ↓
Paint
 ↓
Composite
 ↓
화면 표시
```
````

면접에서는 이 흐름을 단순 암기하지 않고
각 단계에서 **왜 필요한지** 설명할 수 있어야 한다.

---

### 2. DNS Lookup

도메인 이름을 IP 주소로 변환하는 과정.

```text
example.com
 ↓
DNS
 ↓
93.xxx.xxx.xxx
```

브라우저는 DNS 조회 전에
캐시된 DNS 정보를 확인할 수도 있다.

---

### 3. TCP

클라이언트와 서버가 데이터를 주고받기 위한
연결을 수립하는 과정.

TCP 3-way handshake:

```text
Client → SYN → Server
Client ← SYN + ACK ← Server
Client → ACK → Server
```

HTTPS에서는 이후 TLS handshake가 진행된다.

---

### 4. TLS / HTTPS

HTTPS는 HTTP를 TLS 위에서 사용하는 구조.

TLS를 통해:

- 통신 내용 암호화
- 서버 인증
- 데이터 무결성 보장

등을 제공한다.

---

### 5. HTTP Request / Response

브라우저가 서버에 요청을 보내고
서버가 응답을 반환한다.

```text
Request
GET /users
Authorization: ...

        ↓

Response
200 OK
Content-Type: application/json

{ ... }
```

---

# CORS

브라우저의 동일 출처 정책(Same-Origin Policy) 때문에
다른 Origin의 리소스에 접근할 때 발생하는 제약.

Origin은 다음 세 요소로 판단한다.

```text
Protocol + Host + Port
```

예:

```text
https://example.com
https://api.example.com
```

Host가 다르므로 다른 Origin이다.

서버는 응답 헤더를 통해
허용할 Origin을 지정할 수 있다.

```http
Access-Control-Allow-Origin: https://example.com
```

중요:

> CORS는 브라우저가 적용하는 보안 정책이며,
> 서버 간 통신 자체를 막는 개념은 아니다.

---

# 쿠키 / 세션 / 토큰

## Cookie

브라우저에 저장되는 작은 데이터.

HTTP 요청 시 조건에 따라 자동으로 서버에 전송된다.

주요 옵션:

- `HttpOnly`
- `Secure`
- `SameSite`
- `Domain`
- `Path`
- `Expires / Max-Age`

---

## Session

서버가 사용자의 상태를 관리하는 방식.

```text
Browser
 ↓ session id
Server
 ↓
Session Store
```

브라우저에는 일반적으로 세션을 식별하기 위한
Session ID가 저장된다.

---

## Token

인증 정보를 토큰 형태로 전달하는 방식.

대표적으로 JWT가 있다.

```text
Authorization: Bearer <token>
```

세션과 토큰은 단순히
"세션 = 서버 저장 / 토큰 = 클라이언트 저장"으로만
구분하면 안 된다.

핵심은 **인증 상태를 어디에서 어떻게 관리하느냐**이다.

---

# HTTP 상태 코드 패턴

### 2xx — 성공

- `200 OK`
- `201 Created`
- `204 No Content`

### 3xx — 리다이렉션

- `301 Moved Permanently`
- `302 Found`
- `304 Not Modified`

### 4xx — 클라이언트 요청 문제

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`

### 5xx — 서버 문제

- `500 Internal Server Error`
- `502 Bad Gateway`
- `503 Service Unavailable`

면접에서는 모든 상태 코드를 외우기보다
**2xx / 3xx / 4xx / 5xx의 의미와 대표 코드**를 이해한다.

---

# 브라우저 캐시

브라우저가 이전에 받은 리소스를 저장해
다음 요청에서 재사용하는 기능.

대표적인 HTTP 캐시 헤더:

```http
Cache-Control
ETag
Last-Modified
Expires
```

예를 들어:

```http
Cache-Control: max-age=3600
```

캐시된 리소스를 재사용할 수 있다.

캐시가 유효하지 않거나 재검증이 필요한 경우
서버에 조건부 요청을 보낼 수 있다.

```http
If-None-Match: "abc123"
```

변경되지 않았다면:

```http
304 Not Modified
```

를 반환할 수 있다.

---

# DOMContentLoaded / load

## DOMContentLoaded

HTML 파싱이 완료되고
DOM이 만들어진 이후 발생.

이미지나 일부 외부 리소스가
모두 로드될 때까지 기다리는 이벤트는 아니다.

---

## load

문서와 관련 리소스까지 로딩이 완료된 이후 발생.

```text
DOMContentLoaded
 ↓
load
```

일반적으로 DOM 자체가 준비되었는지가 중요하다면
`DOMContentLoaded`가 더 적절하다.

---

# defer / async

JavaScript가 HTML 파싱에 미치는 영향을 이해하는 것이 핵심.

## 일반 script

```html
<script src="app.js"></script>
```

HTML 파싱 중 script를 만나면
스크립트를 가져오고 실행하는 동안
HTML 파싱이 중단될 수 있다.

```text
HTML Parsing
     ↓
   script
     ↓
Parsing 중단
     ↓
JS 실행
     ↓
HTML Parsing 재개
```

---

## defer

```html
<script src="app.js" defer></script>
```

HTML 파싱과 동시에 스크립트를 다운로드하고,
HTML 파싱이 완료된 후 실행한다.

```text
HTML Parsing ───────────→ 완료
       │
       └── JS Download
                           ↓
                       JS 실행
```

`defer` 스크립트는 문서 순서를 유지한다.

---

## async

```html
<script src="analytics.js" async></script>
```

HTML 파싱과 동시에 다운로드하고
다운로드가 완료되는 즉시 실행한다.

따라서 실행 순서를 보장할 필요가 없는
독립적인 스크립트에 적합하다.

```text
HTML Parsing ───────────────→
             ↓
          Download
             ↓
          JS 실행
             ↓
HTML Parsing 재개
```

---

# defer vs async

|             | defer                            | async              |
| ----------- | -------------------------------- | ------------------ |
| 다운로드    | HTML 파싱과 병렬                 | HTML 파싱과 병렬   |
| 실행 시점   | HTML 파싱 완료 후                | 다운로드 완료 즉시 |
| 실행 순서   | 보장                             | 보장되지 않음      |
| 적합한 경우 | DOM에 의존하는 일반적인 스크립트 | 독립적인 스크립트  |

---

## 면접 포인트: 스크립트 로딩이 렌더에 미치는 영향

### 일반 script

HTML 파싱을 중단시킬 수 있기 때문에
DOM 생성과 초기 렌더링을 지연시킬 수 있다.

### defer

HTML 파싱을 막지 않고 다운로드한 뒤
DOM 생성이 끝난 후 실행되므로
초기 페이지 로딩에 유리하다.

### async

다운로드가 끝나는 즉시 실행되므로
실행 시점에 따라 HTML 파싱을 중단시킬 수 있다.

따라서 **실행 순서가 중요한 스크립트에는 async를 함부로 사용하면 안 된다.**

---

# 스토리텔링 예시

면접에서:

> "브라우저에 URL을 입력하면 어떤 일이 일어나나요?"

라고 질문받았다면,

```text
먼저 URL을 파싱하고 도메인에 대한 DNS Lookup을 수행해서
서버의 IP 주소를 확인합니다.

HTTPS라면 서버와 TCP 연결을 수립한 다음
TLS Handshake를 통해 보안 연결을 구성합니다.

그 후 브라우저가 HTTP Request를 보내고
서버가 HTTP Response를 반환합니다.

HTML을 받으면 브라우저는 HTML을 파싱해서 DOM을 만들고,
CSS를 파싱해서 CSSOM을 만듭니다.

DOM과 CSSOM을 기반으로 Render Tree를 만든 다음
Layout, Paint, Composite 과정을 거쳐
최종적으로 화면에 표시합니다.

이 과정에서 JavaScript가 일반 script로 로드되면
HTML 파싱을 중단시킬 수 있기 때문에
렌더링이 지연될 수 있고,
defer나 async를 사용해서 로딩과 실행 방식을 조절할 수 있습니다.
```

## 목표

- URL 입력부터 화면 표시까지 전체 흐름을 설명할 수 있다.
- DNS → TCP → TLS → HTTP → 브라우저 렌더링을 하나의 흐름으로 연결할 수 있다.
- CORS가 왜 존재하고 브라우저에서 어떻게 동작하는지 설명할 수 있다.
- 쿠키 / 세션 / 토큰의 차이를 설명할 수 있다.
- HTTP 상태 코드의 큰 분류와 대표 코드를 설명할 수 있다.
- 브라우저 캐시가 왜 필요한지 설명할 수 있다.
- `DOMContentLoaded`와 `load`의 차이를 설명할 수 있다.
- `defer`와 `async`의 차이를 설명할 수 있다.
- "스크립트 로딩이 렌더링에 어떤 영향을 주나요?"에 답변할 수 있다.
- **주소창 → 네트워크 → HTTP → 렌더링 → 화면 출력**을 끊김 없이 스토리텔링할 수 있다.

````

### 이 챕터에서 면접용으로 제일 중요한 그림

```text
[URL 입력]
    ↓
[DNS]
    ↓
[TCP]
    ↓
[TLS]
    ↓
[HTTP Request / Response]
    ↓
[HTML]
    ↓
[DOM + CSSOM]
    ↓
[Render Tree]
    ↓
[Layout]
    ↓
[Paint]
    ↓
[Composite]
    ↓
[화면]
````

그리고 지금까지 만든 Day 1~3을 합치면 꽤 좋은 구조가 됩니다.

**Day 1 HTTP 기초**
→ Request / Response 자체를 이해

**Day 2 네트워크 연결 흐름**
→ DNS / TCP / TLS를 이해

**Day 3 브라우저 렌더링**
→ HTML을 받은 뒤 브라우저가 화면을 만드는 과정을 이해

**참고: 웹 동작 원리**
→ 위 세 개를 **"URL을 입력하면 무슨 일이 일어나는가?"라는 하나의 면접 답변으로 통합**

이렇게 두면 같은 내용을 네 번 공부하는 게 아니라, **각 Day에서 배운 조각을 마지막에 하나의 스토리로 조립하는 구조**가 됩니다.
