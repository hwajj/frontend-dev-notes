# Day 24: Fetch

## 키워드

- **Fetch API** — 브라우저 내장 HTTP 요청 API. `fetch(url, options)`가 Promise를 반환.
- **Promise** — 비동기 결과를 표현하는 객체(Day 15 연결). fetch는 Promise 기반.
- **async / await** — Promise를 동기처럼 읽게 하는 문법. `const res = await fetch(...)`.
- **Response** — 응답 객체. `res.ok`, `res.status`, `res.json()`, `res.text()` 제공.
- **JSON** — `res.json()`으로 본문을 파싱(이 자체도 Promise 반환).
- **Error Handling** — 네트워크 실패는 reject, HTTP 에러(4xx/5xx)는 reject되지 않으므로 `res.ok` 체크 필요.
- **CORS** — 다른 Origin 요청을 브라우저가 막는 정책. 서버가 허용 헤더로 풀어줘야 한다.
- **AbortController** — 진행 중 fetch 취소. 언마운트·중복 요청 정리에 필수.

## 면접 포인트

- **Q. fetch는 404/500일 때 왜 catch로 안 가나?**
  → fetch는 "네트워크 자체가 실패"할 때만 reject한다. HTTP 상태 코드는 성공적으로 응답을 받은 것으로 보므로 `if (!res.ok) throw ...`로 직접 처리해야 한다.
- **Q. `await fetch()` 후 왜 `await res.json()`을 또 하나?**
  → 응답 헤더가 도착하면 fetch가 resolve되지만, 본문 스트림을 읽어 파싱하는 것은 별도 비동기 작업이라 한 번 더 `await`가 필요하다.
- **Q. 요청을 취소하려면?**
  → `AbortController`의 `signal`을 fetch 옵션에 넘기고 `controller.abort()` 호출.

## CORS 심화

브라우저가 **교차 출처(Cross-Origin)** 응답을 JS에 넘기기 전에 검사한다. 콘솔의 CORS 에러는 대부분 **서버가 허용 헤더를 안 준 것**(또는 credentials 불일치)이다. 프론트만으로 "고치는" 문제가 아니다.

### Simple Request vs Preflight

- **Simple Request** — 특정 조건(예: GET/POST + 단순 Content-Type 등)을 만족하면 본 요청만 나간다.
- **Preflight** — 그 밖(커스텀 헤더, `PUT`/`DELETE`, `application/json` 등)이면 먼저 **`OPTIONS`**로 "이런 요청 해도 되나?"를 묻는다. 통과해야 실제 요청이 간다.

### 핵심 헤더

- `Access-Control-Allow-Origin` — 어떤 Origin을 허용할지 (`*` 또는 구체 Origin)
- `Access-Control-Allow-Credentials` — 쿠키 등 credentials 허용 여부
- `Access-Control-Allow-Methods` / `Allow-Headers` — 프리플라이트에서 허용 메서드·헤더

`fetch(..., { credentials: 'include' })`를 쓰면 Origin을 `*`로 둘 수 없다. **구체 Origin + Allow-Credentials**가 맞아야 한다.

### CORS vs SameSite (혼동 금지)

- **CORS** — "다른 Origin의 JS가 이 응답을 읽어도 되나?"
- **SameSite (쿠키)** — "이 요청에 쿠키를 실어 보낼까?" (주로 CSRF 완화, → Day 26 · 09-4)

둘 다 "출처"와 관련되지만 목적과 실패 증상이 다르다.

### 실무에서 CORS를 피하는 방법

같은 사이트 Origin으로 API를 받게 **Nginx 리버스 프록시**(→ 13-2)를 두면 브라우저는 same-origin으로 보고 CORS가 필요 없다. 로컬 개발의 Vite/webpack proxy도 같은 아이디어다.

## AbortController

```js
const c = new AbortController();
fetch(url, { signal: c.signal });
c.abort(); // 언마운트·검색어 변경 시
```

## 목표

- fetch + async/await로 GET/POST 요청을 작성할 수 있다.
- `res.ok`와 try/catch를 조합해 견고한 에러 처리를 한다.
- Simple vs Preflight, ACAO·Credentials로 CORS 에러를 진단할 수 있다.
- AbortController로 요청 취소를 설명할 수 있다.
