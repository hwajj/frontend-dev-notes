# Nginx 리버스 프록시 · 서브도메인 · 라우팅

## 키워드

- **리버스 프록시** — 클라이언트 요청을 뒤의 앱 서버로 전달. `proxy_pass`.
- **서브도메인 라우팅** — `server_name`(app.example.com 등)으로 가상 호스트 분기.
- **location 블록** — 경로별 처리(`/api` → 백엔드, `/` → 프론트).
- **SPA fallback** — `try_files $uri $uri/ /index.html;` — 새로고침 404 해결(→ 8주차 라우팅과 연결).
- **업스트림(upstream)** — 뒤에 붙는 실제 서버 그룹.

## 면접 포인트

- **Q. SPA 배포 후 새로고침하면 404가 나는 이유와 Nginx 해법은?**
  → 클라이언트 경로를 Nginx가 모르기 때문. `try_files ... /index.html`로 모든 경로를 SPA 진입점으로 fallback.
- **Q. `/api`만 백엔드로 보내려면?**
  → `location /api { proxy_pass http://backend; }` + `location / { try_files ... }`로 경로 분기. same-origin이라 CORS도 회피.
- **Q. 502 Bad Gateway가 뜨는 대표 원인은?**
  → 업스트림(앱 서버)이 안 떠 있거나 포트 불일치. Nginx 설정이 아니라 "뒤 서버 미기동"인 경우가 많다.

## 관련 실무 노트

- `notes/2026-06-08_proxy-econnrefused-upstream.md`
- `notes/2026-05-29_cors-local-dev.md`

## 목표

- 리버스 프록시·서브도메인·location 분기를 설정할 수 있다.
- SPA fallback으로 새로고침 404를 해결한다.
- 502/ECONNREFUSED가 "업스트림 미기동" 신호임을 안다.
