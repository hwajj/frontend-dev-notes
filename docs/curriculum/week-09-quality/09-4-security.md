# 프론트 보안 (XSS · CSRF · CSP)

## 키워드

- **XSS** — 악성 스크립트 주입. `innerHTML`/`dangerouslySetInnerHTML` 남용이 대표 경로.
- **CSRF** — 로그인 상태를 악용한 위조 요청. 쿠키 자동 전송이 원인.
- **CSP (Content Security Policy)** — 실행 가능한 스크립트 출처를 제한하는 헤더. XSS 완화.
- **SameSite 쿠키** — CSRF 완화(Lax/Strict).
- **토큰 저장 위치** — HttpOnly 쿠키 vs localStorage의 트레이드오프(→ Day 6·26).
- **Clickjacking** — iframe으로 UI를 덮어 의도치 않은 클릭 유도. `X-Frame-Options` / CSP `frame-ancestors`.
- **SRI (Subresource Integrity)** — CDN 스크립트 해시 검증. 변조되면 실행 거부.
- **HTTPS / Mixed Content** — HTTPS 페이지에서 HTTP 자원 로드가 차단·경고. 쿠키 `Secure`와도 연결.

## 면접 포인트

- **Q. XSS를 어떻게 막나?**
  → 기본은 출력 이스케이프(React는 기본 이스케이프). `dangerouslySetInnerHTML`은 sanitize(DOMPurify) 후 사용, CSP로 2차 방어.
- **Q. CSRF와 XSS의 차이는?**
  → XSS는 "스크립트 실행", CSRF는 "정상 사용자를 사칭한 요청". CSRF는 SameSite·CSRF 토큰, XSS는 이스케이프·CSP로 대응.
- **Q. 토큰을 localStorage에 두면 왜 위험한가?**
  → XSS가 발생하면 JS로 토큰을 탈취당한다. HttpOnly 쿠키는 JS 접근이 막혀 상대적으로 안전(대신 CSRF 대비 필요).
- **Q. Clickjacking 방어는?**
  → 페이지가 임의 iframe에 임베드되지 않게 `frame-ancestors`/`X-Frame-Options`로 제한.
- **Q. SRI는 언제 쓰나?**
  → 제3자 CDN에서 받는 JS/CSS가 **우리가 기대한 바이트인지** 해시로 검증할 때.

## 목표

- XSS/CSRF의 원인과 방어책을 구분해 설명할 수 있다.
- CSP·SameSite·Clickjacking·SRI·Mixed Content를 한 세트로 말한다.
- 토큰 저장 전략의 트레이드오프를 판단한다.
