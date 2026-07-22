# CSS 레이아웃 & 아키텍처

## 키워드

- **Flexbox / Grid** — 1차원(flex) vs 2차원(grid) 레이아웃. 정렬·분배·반응형의 핵심.
- **Cascade & 명시도(Specificity)** — 어떤 규칙이 이기는지 결정. `!important` 남용의 원인.
- **BEM / CSS Modules / CSS-in-JS** — 클래스 충돌을 막는 스코핑 전략들.
- **render-blocking CSS** — `<head>`의 CSS는 렌더를 막는다. Critical CSS·분리로 완화.
- **다중 CSS 세트 충돌** — 레거시+신규 CSS 동시 적용 시 스타일 오염.

## 면접 포인트

- **Q. Flex와 Grid를 언제 나눠 쓰나?**
  → 한 축(행 또는 열) 분배는 Flex, 행+열 2차원 배치는 Grid. 실무에선 Grid 안에 Flex를 섞어 쓴다.
- **Q. CSS가 렌더를 막는다는 게 무슨 뜻인가?**
  → 브라우저는 CSSOM이 완성돼야 렌더한다. 그래서 CSS는 기본 render-blocking. 중요치 않은 CSS는 지연 로드/분리.
- **Q. 명시도 전쟁을 어떻게 예방하나?**
  → 스코핑(CSS Modules 등)으로 전역 오염을 없애고, 얕은 셀렉터·일관된 네이밍으로 `!important`를 피한다.

## 관련 실무 노트

- `notes/2026-06-11_spa-css-next-renewal.md`
- `notes/2026-07-02_basicSwiper-opacity-desktop-clipping.md`

## 목표

- Flex/Grid로 반응형 레이아웃을 구성할 수 있다.
- 명시도·cascade를 이해하고 스코핑 전략을 선택한다.
- render-blocking CSS와 다중 CSS 충돌을 진단·완화한다.
