# Day 27: CSR

## 키워드

- **CSR (Client Side Rendering)** — 서버는 빈 HTML+JS를 주고, 브라우저가 JS로 화면을 그림.
- **SPA (Single Page Application)** — 페이지 전환 없이 JS가 라우팅·렌더를 담당하는 앱.
- **Initial Load** — 첫 로드 시 JS 번들을 받고 실행해야 화면이 나와 느릴 수 있음.
- **Client Rendering** — 데이터 fetch·DOM 구성이 클라이언트에서 일어남.
- **SEO** — 초기 HTML이 비어 있어 검색 크롤러가 콘텐츠를 못 볼 수 있는 약점.
- **TTI (Time To Interactive)** — 사용자가 실제 상호작용 가능해지는 시점 지표.

## 면접 포인트

- **Q. CSR의 장단점은?**
  → 장점: 전환이 빠르고 서버 부담↓, 앱 같은 UX. 단점: 초기 로딩 느림(번들·실행), SEO 취약.
- **Q. CSR에서 SEO 문제를 어떻게 완화하나?**
  → SSR/SSG로 초기 HTML 제공, 또는 프리렌더링/동적 렌더링, 메타 태그 관리(Day 28과 연결).
- **Q. 초기 로드를 개선하려면?**
  → 코드 스플리팅, 번들 축소, 중요 리소스 preload, 데이터 프리패치 등.

## 목표

- CSR 동작 흐름(빈 HTML → JS 실행 → 렌더)을 설명할 수 있다.
- CSR의 SEO/초기 로딩 약점과 대응책을 안다.
- SSR과의 차이를 Day 28에서 비교할 준비를 한다.
