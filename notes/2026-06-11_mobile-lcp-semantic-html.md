# 모바일 LCP·geo-static·시맨틱 HTML (리뉴얼 SEO)

> 작성일: 2026-06-11
> 맥락: Lighthouse 모바일 Performance 49·LCP 30s인데 SEO는 100이다. 히어로 영상 때문인 줄 알았는데 모바일에서는 영상을 안 쓴다. geo-static을 없애고 시맨틱 HTML만 쓰면 되는지, 무엇이 LCP를 잡는지 알고 싶다.
> 범위: 로컬 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- 모바일 Lighthouse가 느린데 **영상 때문이 아니라면** 뭐 때문인가?
- `geo-static` 숨김 HTML이 **LCP를 악화**시키나?
- 새 Next 프로젝트에서 **시맨틱 HTML**만으로 SEO·LCP가 해결되나?

## 핵심 정리 (결론부터)

| 구분 | 지금 (SPA + geo-static) | 리뉴얼 (시맨틱 + Server HTML) |
|------|-------------------------|----------------------------------|
| 크롤러 본문 | 숨김 `main.geo-static` | 보이는 `<main>` 본문 |
| 사용자 첫 화면 | JS 후 `MainPage` | **같은 HTML**에 H1·히어로 |
| LCP 후보 | JS 체인 끝 + CSS 배경 PNG | **`<img priority>`** 또는 텍스트 |
| SEO Lighthouse | 메타·JSON-LD 통과 (100) | 유지 + **실검색은 CWV도 반영** |
| 모바일 영상 | **로드 안 함** (`1024px` 미만) | 동일 정책 가능 |

**한 줄:** 모바일 LCP는 **영상이 아니라 SPA + blocking CSS + ~1MB CSS 배경 PNG**다. `geo-static`은 LCP **직접 원인은 아니지만**, “보이는 LCP를 HTML에 안 둔” 구조와 한 세트다. 시맨틱은 **필수 도구**이고, **Server Component로 보이는 본문·LCP 이미지**까지 같이 가야 한다.

## 배경 지식 (짧게만)

- **LCP (Largest Contentful Paint)**: 사용자 눈에 **보이는** 가장 큰 요소가 그려진 시각.
- **FCP**: 첫 픽셀이라도 그려진 시각.
- **Lighthouse SEO 점수**: 메타·robots 등 **체크리스트** — Core Web Vitals 점수와 **별개**.
- **시맨틱 HTML**: `main`, `article`, `section`, `h1`~`h2`처럼 **의미 있는 태그**로 본문 구조를 짓는 것.
- **Server Component (Next)**: 서버·빌드 시점에 HTML에 **문자열로 포함**되는 React 컴포넌트.

## 한눈에

### 지금 — 모바일 `/` (Moto G + Slow 4G)

```
① HTML 도착
   └── geo-static (숨김, clip) → LCP 후보 ❌

② CSS 4~5개 blocking (reset, common, mobile, overrides)

③ JS 번들 (App.tsx, router, redux, …)

④ ClientAppMount → MainPage

⑤ MainLayout CSS ready 대기 (로딩 모달)

⑥ mobile.css 로드 후 background-image 요청
   └── bg_main_m02.png (~312KB) + bg_main_m03.png (~758KB)

⑦ LCP 확정 (~30s)  ← 영상 요청 없음
```

### 리뉴얼 목표

```
① HTML에 <main><h1>…</h1><img priority …></main>  ← LCP 후보 즉시

② 해당 라우트 CSS만 (blocking 줄임)

③ 히어로 영상은 client·idle 후 (PC만)
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| geo-static | SEO용 텍스트를 DOM에만 두고 화면에서 숨기는 클래스 |
| ClientAppMount | Next HTML 위에 legacy SPA를 `useEffect`로 올리는 컴포넌트 |
| CWV | Core Web Vitals — LCP·INP 등 실사용 성능 지표 |
| `priority` | next/image 등에서 LCP 이미지 우선 로드 힌트 |

---

## 1. 모바일 LCP — 영상이 아닌 이유

### 한 줄 요약

1024px 미만에서는 `MainHeroVideo`가 **`src`를 안 넣고**, CSS로 `video { display: none }` — **MP4 요청 자체가 없다**.

### 왜 이렇게인가

모바일 히어로는 `mobile.css`의 **`background-image`** 두 장(합 ~1MB)이다. 문제는 (1) **SPA라 JS 전에는 화면이 비어 있고**, (2) **CSS가 blocking**이라 PNG 요청이 **mobile.css 이후**에야 시작되고, (3) **`<img>`가 아니라 CSS 배경**이라 Lighthouse가 “늦게 발견”한다는 점이다.

**비중 (모바일 `/`):**

| 순위 | 원인 |
|------|------|
| 1 | SPA — UI가 JS 이후 |
| 2 | render-blocking CSS |
| 3 | 큰 배경 PNG (CSS 경유) |
| 없음 | 히어로 MP4 |

### 함정 한 가지

**“SEO 100이면 검색도 OK”**가 아니다. Lighthouse SEO는 LCP를 점수에 넣지 않지만, **Google 검색은 CWV를 반영**한다. 메타만 완벽해도 LCP 30s면 체감 노출·순위에 불리할 수 있다.

---

## 2. geo-static과 LCP

### 한 줄 요약

`geo-static`은 **시각적으로 숨겨져 LCP 후보가 될 수 없다** — 30s의 **주범은 아니다**. 다만 **보이는 콘텐츠를 SPA에만 맡긴 선택**과 같이 가며, HTML에 빠른 LCP 후보가 없게 만든다.

### 왜 이렇게인가

`globals.css`에서 `clip-path`, 1px 박스 등으로 가려진 `main.geo-static`은 DOM에는 있으나 **페인트 대상이 아니다**. 리뉴얼 시 같은 H1·요약을 **사용자에게도 보이게** 넣으면 그 요소가 **오히려 LCP에 도움**이 될 수 있다.

---

## 3. geo-static 대신 시맨틱 HTML

### 한 줄 요약

**숨긴 SEO 블록 대신 보이는 시맨틱 페이지가 곧 SEO 페이지** — 단, **App Router 페이지 + metadata + JSON-LD + LCP용 서버 렌더**가 한 세트다.

### 왜 이렇게인가

| 기존 | 리뉴얼 |
|------|--------|
| 숨김 geo-static + SPA UI | **한 번 렌더된 본문 = 사용자·크롤러 동일** |
| catch-all + ClientAppMount | `app/service/care/page.tsx` 등 **라우트 = 페이지** |
| 메타만 Next | `metadata` + 본문 `h1` + JSON-LD **같은 출처** |

시맨틱 태그 역할:

| 태그 | 용도 |
|------|------|
| `main` | 페이지 주요 콘텐츠 (1개) |
| `article` | 독립 콘텐츠 단위 |
| `section` + `h2` | 주제별 구역 |
| `dl/dt/dd` | FAQ (스키마와 맞추기 쉬움) |

**Server / Client 경계 예 (메인 `/`):**

- **서버:** H1, 서브카피, CTA, LCP용 **히어로 이미지** (`priority`)
- **클라이언트:** `MainHeroVideo`(idle 후), 슬라이더, 팝업

### 함정 한 가지

**시맨틱만으로 LCP가 해결되지 않는다.** `h1` 텍스트가 LCP가 될 수는 있지만, 지금처럼 **큰 배경 이미지**가 LCP 후보라면 **`<img>` + 용량 최적화**가 필요하다. CSS `background-image`만 퍼블에 바꿔 달라고 해도 **개발 쪽 `next/image`·preload** 협업이 붙는다.

### 이 레포에서는

| 항목 | 위치 |
|------|------|
| geo-static | `src/app/[[...slug]]/page.tsx` + `globals.css` |
| SPA 마운트 | `ClientAppMount.tsx` |
| 모바일 배경 | `public/css/mobile.css` → `bg_main_m03.png` 등 |
| 메타·JSON-LD | `src/app/seo.ts` — 리뉴얼 시 각 `page.tsx`로 이전 |

### 더 볼 것 (선택)

- [2026-06-11_spa-css-next-renewal.md](./2026-06-11_spa-css-next-renewal.md) — render-blocking CSS·layout 분리
- [2026-06-11_hero-video-responsive.md](./2026-06-11_hero-video-responsive.md) — PC 영상은 LCP 이후로
