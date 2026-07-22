# SPA CSS 충돌·느림과 Next route group으로 풀기

> 작성일: 2026-06-11
> 맥락: 홈·튜토리얼·챗봇이 한 React 앱에 붙어 있고, CSS를 `<head>`에 많이 달아 JS로 켜고 끄는데도 첫 화면이 느리다. Next 리뉴얼 때 layout마다 CSS만 나누면 되는지 헷갈린다.
> 범위: 로컬 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- 메인·튜토리얼·챗봇 CSS가 **동시에 먹어서** 깨진 건가, **한꺼번에 받아서** 느린 건가?
- SPA에서 `<head>`에 CSS 링크를 **미리 다 적어 둔 이유**는?
- Next로 가면 **퍼블 CSS를 전부 다시** 만들어야 하나?

## 핵심 정리 (결론부터)

| 증상 | 원인 (한 줄) | Next 리뉴얼 시 |
|------|----------------|----------------|
| **화면 깨짐** | 메인+튜토리얼 CSS가 **한 문서에 동시 적용** | layout마다 **한 세트만** → 같은 `button {}` 규칙이 있어도 **한 페이지에 안 겹침** |
| **첫 로드 느림** | **메인 CSS blocking** + **큰 JS(SPA)** + (튜토리얼 URL이면) 메인 CSS **낭비** | 홈 layout = 홈 CSS만, 튜토리얼 layout = 튜토리얼만 |
| **head에 링크 잔뜩** | **HTML 진입점이 layout 하나** + `useRoleCss`가 **미리 등록된 link 토글** | route group layout에 **필요한 link만** |
| **render-blocking** | `<link rel="stylesheet">`는 **스타일 모를 때 페인트 보류** | 메인에 **4~5개 동기 CSS**가 FCP를 막음 → layout 분리·합치기로 줄임 |

**한 줄:** “겹침(충돌)”과 “느림(다운로드·blocking)”은 **같은 SPA 구조의 다른 증상**이다. Next에서는 **URL마다 CSS 한 세트**만 오게 하면 둘 다 구조적으로 줄어든다. 퍼블 **전면 재작업은 아님** — 기존 `public/css/` 파일을 layout에만 올바르게 붙이면 된다.

## 배경 지식 (짧게만)

- **SPA**: 주소는 바뀌어도 **HTML 문서 하나** 안에서 React가 화면만 갈아끼운다.
- **전역 CSS**: `<link>`로 넣은 스타일은 **그 탭 전체**에 적용된다. 나중에 로드된 규칙이 같은 선택자를 덮어쓸 수 있다.
- **`<head>`**: 브라우저가 본문을 그리기 **전에** 읽는 메타·스타일 영역.
- **render-blocking**: 브라우저가 “스타일을 모른 채 그리면 깜빡임”을 막으려 **CSS 파싱이 끝날 때까지 페인트를 미루는** 동작.
- **Next App Router layout**: URL 그룹마다 **다른 `<head>`/import**를 가질 수 있다 (빌드 시 HTML에 박힘).

## 한눈에

### 증상 A — CSS 동시 적용 (충돌)

```
[SPA, 튜토리얼 진입 후 메인 CSS를 안 끈 경우]

문서 1개
  ├── common.css   → button { 파란색 }
  └── stylePro.css → button { 다른 스타일 }
         ↓
  같은 <button>에 둘 다 적용 → 레이아웃·색 깨짐
```

### 증상 B — 느림 (홈 `/` 첫 방문)

```
HTML (layout 하나)
  ├── 메인 CSS 4~5개  → 다운로드 + render-blocking
  ├── 튜토리얼 link 15개 → 태그만 (media="not all", 대부분 안 받음)
  └── JS 번들 (App 전체) → 실행 후에야 MainPage

  → FCP·LCP가 JS·CSS 뒤로 밀림
```

### 리뉴얼 목표

```
/ (홈)           → layout(marketing) → reset, common, mobile, overrides 만
/tutorial/*      → layout(tutorial)  → stylePro, tutorial … 만
/chatbot/*       → layout(chatbot)   → chatBot, chatBotPro … 만

  → 한 HTML에 두 세트 동시 로드 X
  → JS로 link on/off X
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| SPA | 한 React 앱에서 라우트만 바꾸는 방식 |
| render-blocking | CSS 받는 동안 첫 그리기를 미루는 것 |
| `media="not all"` | “지금은 이 CSS 안 받음” — 브라우저가 스킵 |
| `data-role-style` | 튜토리얼 protector/caremate/family 구분용 link 속성 |
| `useRoleCss` | head에 있는 role link를 켜고 끄는 hook |
| route group | Next에서 `(marketing)`처럼 URL에 안 보이는 폴더 묶음 |

---

## 1. 왜 느렸나 / 왜 이렇게 설계했나

### 한 줄 요약 (정책 한 줄)

느리게 만들고 싶어서가 아니라, **앱 하나에 CSS 세트가 여러 개**인데 **동시에 켜면 깨지니**, **파일 합치기도 어려우니**, **head에 등록 + JS 스위치**가 당시 가장 현실적이었기 때문이다.

### 왜 이렇게인가

React + react-router **앱 하나**에 메인·튜토리얼(보호자/케어메이트/가족)·챗봇이 같이 들어 있다. 퍼블은 화면별로 `common.css`, `stylePro.css`, `chatBot.css`처럼 **파일을 잘 나눠 줬다**. 문제는 **붙이는 쪽**이었다.

`@import`나 한 파일로 합치면 메인 페이지에 튜토리얼 스타일이 섞이거나 로드 순서가 꼬였다. 그래서 **파일은 분리 유지**하고, **한 번에 한 세트만 켜야** 했다. Next SEO 전환 때도 **SPA 구조는 유지**한 채 Vite `index.html`의 link 목록을 `layout.tsx`로 **그대로 옮겼다**. 메인 CSS는 오히려 `preload`에서 **동기 `stylesheet`**로 바뀌어 blocking이 더 거세졌다.

### 함정 한 가지

**“홈에서 튜토리얼·챗봇 CSS를 전부 다운받아서 느렸다”**고 말하면 과장이다. 홈에서는 튜토리얼 preload는 **`media="not all"`**이라 **파일을 안 받는다**. 느린 주범은 **메인 CSS blocking + SPA JS 전체 + (모바일) 큰 배경 PNG**다. 다만 **head에 link 태그 15개는 항상 실린다** — 구조가 무겁다.

### 이 레포에서는

| 파일 | 역할 |
|------|------|
| `src/app/layout.tsx` | 메인 CSS 5개 + role preload 15개 |
| `src/hook/useRoleCss.ts` | 튜토리얼 진입 시 role link만 ON |
| `src/hook/useSpaMainSiteHeadCssIsolation.ts` | 튜토리얼/챗봇에서 메인 CSS OFF |
| `src/components/chatbot/.../ChatbotApp.tsx` | 챗봇 CSS는 JS `appendCssLinks`로 주입 |

---

## 2. 동시 적용 vs head 비대 — 다른 증상

### 한 줄 요약

**동시 적용**은 “스위치를 잘못 두면 두 전등이 같이 켜짐”, **head 비대**는 “안 쓰는 방 전선도 배선도에 다 달려 있음”이다.

### 왜 이렇게인가

튜토리얼로 갈 때 `useSpaMainSiteHeadCssIsolation`으로 메인을 끄고 `useRoleCss`로 튜토리얼만 켠다. **끄지 않으면** 메인+튜토리얼이 **동시 적용**되어 깨진다.

반면 홈 `/`에서는 튜토리얼 CSS **파일은 안 받지만**, HTML에는 **link 15개가 포함**된다. 튜토리얼 URL로 **직접** 들어가면 **메인 CSS 5개를 먼저 blocking으로 받은 뒤** JS로 끄는 **낭비**가 생긴다.

### 함정 한 가지

**“head에 미리 둔 이유 = CSS를 새로 만들면 안 돼서”**는 아니다. 챗봇은 `document.createElement('link')`로 붙였다가 cleanup으로 **제거**한다. 튜토리얼은 **토글 방식**(`querySelectorAll('link[data-role-style]')`)을 택했고, **홈으로 돌아갈 때 role CSS를 끄는 cleanup은 약하다** — 남을 수 있다.

---

## 3. render-blocking CSS

### 한 줄 요약

`<link rel="stylesheet">`를 만나면 브라우저는 **스타일을 모른 채 그리지 않고** CSS 다운로드·파싱을 기다린다 — Slow 4G에서 **수 초**가 여기서 새는다.

### 왜 이렇게인가

`layout.tsx`에 reset, common, mobile, overrides가 **동기 stylesheet**로 있다. pc/mobile `media` 분기는 **잘 한 것** — 모바일은 pc.css를 안 받는다. role preload `media="not all"`도 **메인에서 튜토리얼 파일을 안 받게** 한 패치다. **문제는 메인 4~5개가 여전히 blocking**이라는 점과, **MainLayout이 JS로 CSS ready를 또 기다린다**는 이중 대기다.

### 이 레포에서는

Lighthouse **“Render blocking requests ~2,400ms”**는 이 구간이다. caremate/protector **role 분기 때문이 아니다**.

---

## 4. Next route group — layout마다 CSS만

### 한 줄 요약

퍼블이 준 ABC(챗봇)·DEF(홈) 파일은 **그대로** 쓰고, **어느 layout에 어떤 link만 넣을지**가 개발 작업이다 — **전면 재작업 요청이 아니다**.

### 왜 이렇게인가

```text
app/(marketing)/layout.tsx  → DEF만
app/(chatbot)/layout.tsx    → ABC만
app/(tutorial)/layout.tsx   → role 세트만 (protector / caremate / family는 layout 또는 정책 합의)
```

**같은 CSS 파일**을 두 layout에서 import해도 된다. **한 페이지 HTML에 두 세트를 같이 넣지만 않으면** `button {}` 규칙이 서로 안 싸운다. `stylePro.css`(튜토리얼)와 `chatBotPro.css`(챗봇)는 **이름만 비슷하고 다른 파일**이다.

### 퍼블 협의 (최소)

| 필요 | 불필요 |
|------|--------|
| 영역별 CSS **매핑표** 1장 | CSS 전면 재작성 |
| 메인 히어로 **`<img>`** + PNG/WebP 용량 | SPA head/JS 스위치 이해 |
| 신규 화면 시 “어느 영역 CSS 묶음인지” | 튜토리얼에 **홈 전용 클래스만** 있는 이름 쓰기 |

**“홈 전용 클래스”** = `common.css` / `mobile.css`에만 있고 튜토리얼 layout에는 **그 파일이 안 오는** 클래스(예: `.main__video`). 튜토리얼 HTML에 쓰면 스타일이 안 먹는다. **기존 화면은 대부분 이미 튜토리얼 CSS에 맞춰져 있음** — 신규 마크업 때만 참고.

### 더 볼 것 (선택)

- [2026-06-11_mobile-lcp-semantic-html.md](./2026-06-11_mobile-lcp-semantic-html.md) — CSS만으로 LCP가 다 안 잡히는 이유
- [2026-06-11_hero-video-responsive.md](./2026-06-11_hero-video-responsive.md) — PC 히어로 영상 분기
