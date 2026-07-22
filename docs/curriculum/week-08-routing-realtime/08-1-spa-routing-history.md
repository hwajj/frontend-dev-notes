# SPA 라우팅 & History API

## 키워드

- **History API** — `pushState` / `replaceState` / `popstate`. 새로고침 없이 URL만 바꿔 SPA 라우팅을 구현하는 기반.
- **pushState vs replaceState** — push는 히스토리 스택에 쌓아 뒤로가기 가능, replace는 현재 항목을 교체(뒤로가기 대상 안 됨).
- **client-side routing** — 서버 왕복 없이 JS가 경로에 맞는 컴포넌트를 렌더.
- **동적 라우트 / 중첩 라우트** — `/users/:id`, 레이아웃 중첩.
- **라우트 가드** — 인증·권한에 따른 접근 제어, 이탈 차단(blocker).

## 면접 포인트

- **Q. SPA에서 새로고침하면 404가 나는 이유는?**
  → 클라이언트 라우팅 경로를 서버가 모르기 때문. 서버/Nginx에서 모든 경로를 `index.html`로 fallback 시켜야 한다(→ 13주차 Nginx와 연결).
- **Q. `pushState`와 `replaceState`는 언제 나눠 쓰나?**
  → 사용자가 뒤로가기로 돌아와야 하면 push, 필터/탭 전환처럼 히스토리를 남기기 싫으면 replace.
- **Q. 이탈 차단(작성 중 나가기 방지)의 함정은?**
  → `beforeunload`는 새로고침·닫기용, SPA 내부 이동은 라우터 blocker가 필요. 두 경로를 모두 막아야 완전하다.

## 관련 실무 노트

- `notes/2026-07-02_url-replace-no-history.md`
- `notes/study/2026-05-29_use-blocker-pitfalls.md`

## 목표

- History API로 최소한의 클라이언트 라우터 동작 원리를 설명할 수 있다.
- SPA 새로고침 404의 원인과 서버 fallback 해법을 안다.
- push/replace와 이탈 차단을 상황에 맞게 적용한다.
