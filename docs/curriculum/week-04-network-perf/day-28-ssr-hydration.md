# Day 28: SSR & Hydration

## 키워드

- **SSR (Server Side Rendering)** — 요청마다 서버가 HTML을 만들어 전달. 초기 화면·SEO에 유리, 서버 비용↑.
- **SSG (Static Site Generation)** — 빌드 시 HTML 생성. CDN/엣지에 올리기 쉬움(→ Day 5·30·13-3 캐시와 맞물림).
- **ISR (Incremental Static Regeneration)** — 정적 페이지를 **주기/이벤트 후 재생성**. SSG의 신선도 보완(Next 등).
- **Hydration** — 서버가 준 정적 HTML에 클라이언트 JS가 이벤트·상태를 "붙여" 상호작용 가능하게 만드는 과정.
- **Streaming** — HTML을 조각으로 나눠 준비되는 대로 흘려보내 체감 속도를 개선(React 18+).
- **Hydration Mismatch** — 서버 렌더 결과와 클라이언트 첫 렌더가 달라 발생하는 경고/오류.
- **Next.js** — SSR/SSG/ISR/스트리밍을 지원하는 대표 React 프레임워크.

## HTML 캐시 vs HTTP 자산 캐시

- **SSG/ISR HTML** — "어느 시점의 페이지 스냅샷"을 CDN에 두는 서버 렌더 전략의 결과물.
- **JS/CSS 해시 캐시(Day 5)** — 자산 바이트의 장기 캐시.
둘을 섞어 말하면 "배포 후 내용이 안 바뀜"의 원인이 HTML인지 자산인지 구분이 안 된다.

## 면접 포인트

- **Q. SSR인데 왜 Hydration이 또 필요한가?**
  → 서버 HTML은 "보이기"만 할 뿐 이벤트 핸들러가 없다. Hydration으로 JS가 DOM에 상태·리스너를 연결해야 실제로 동작한다.
- **Q. Hydration Mismatch는 왜 생기나?**
  → 서버/클라이언트가 다른 값을 렌더할 때(예: `Date.now()`, `window` 접근, 랜덤값). 렌더를 결정적으로 만들거나 클라이언트 전용 처리로 피한다.
- **Q. SSR의 비용은?**
  → 요청마다 서버 렌더 비용(TTFB 증가 가능). 캐싱/SSG/ISR/스트리밍으로 완화.
- **Q. SSG와 ISR 차이는?**
  → SSG는 빌드 시점 고정에 가깝고, ISR은 배포 후에도 주기적으로(또는 on-demand로) 페이지를 다시 만들어 신선도를 맞춘다.

## 목표

- CSR vs SSR vs SSG vs ISR을 초기 HTML·SEO·서버·캐시 관점에서 비교한다.
- Hydration의 필요성과 mismatch 원인을 설명할 수 있다.
- 스트리밍 SSR이 체감 성능을 어떻게 개선하는지 이해한다.
