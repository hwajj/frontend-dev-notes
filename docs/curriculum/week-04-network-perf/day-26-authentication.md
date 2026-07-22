# Day 26: Authentication

## 키워드

- **Cookie** — 브라우저에 저장되어 요청 시 자동 전송되는 작은 데이터. `HttpOnly`, `Secure`, `SameSite` 옵션 중요.
- **Session** — 서버가 로그인 상태를 저장하고, 클라이언트는 세션 ID(주로 쿠키)로 식별.
- **JWT** — 서명된 토큰(header.payload.signature). 서버 저장 없이 자체 검증 가능(stateless).
- **Access Token** — 짧은 수명의 인증용 토큰. API 요청에 첨부.
- **Refresh Token** — 긴 수명. Access Token 만료 시 재발급에 사용.
- **Authorization** — 인증(누구인가) 이후 "무엇을 할 수 있는가"(권한) 판단. `Authorization: Bearer <token>`.

## 면접 포인트

- **Q. Session 방식과 JWT 방식의 차이는?**
  → Session은 서버가 상태를 저장(stateful)해 무효화가 쉬우나 확장 시 저장소 공유 부담. JWT는 stateless라 확장에 유리하나 발급 후 즉시 무효화가 어렵다.
- **Q. 토큰을 어디에 저장해야 안전한가?**
  → `HttpOnly` 쿠키가 XSS로부터 상대적으로 안전(JS 접근 불가). localStorage는 XSS에 취약. 대신 쿠키는 CSRF 대비(`SameSite`) 필요.
- **Q. Access/Refresh Token을 나누는 이유는?**
  → Access는 짧게 두어 유출 피해를 최소화하고, Refresh로 사용자 재로그인 없이 갱신해 UX와 보안을 절충한다.

## 목표

- 인증(Authentication)과 인가(Authorization)를 구분해 설명할 수 있다.
- 쿠키 옵션(HttpOnly/Secure/SameSite)의 역할을 이해한다.
- Access/Refresh 토큰 흐름을 그림으로 설명한다.
