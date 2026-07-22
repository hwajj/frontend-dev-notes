# 사용자 분석 (GA4 · Clarity · Looker)

## 키워드

- **GA4** — 이벤트 기반 분석. pageview + **커스텀 이벤트**로 퍼널 측정.
- **커스텀 이벤트** — 단계 전환·클릭 등 직접 정의한 행동 측정.
- **Clarity** — 세션 녹화·히트맵(정성적). GA4(정량)와 역할 분리.
- **Looker Studio** — GA4 데이터를 대시보드로 시각화(경영 KPI).
- **SPA 추적의 함정** — 자동 pageview만으론 `?step=` 하위 단계·이탈을 못 본다.

## 면접 포인트

- **Q. SPA에서 pageview만으로 퍼널을 못 보는 이유는?**
  → 라우팅이 URL을 바꿔도 세부 단계(`?step=`)·"다음" 클릭·이탈은 자동 수집이 안 잡는다. 커스텀 이벤트가 필요.
- **Q. GA4와 Clarity를 어떻게 나눠 쓰나?**
  → GA4=집계 KPI(정량), Clarity=녹화·히트맵(정성). 잔존율 같은 KPI는 GA4+커스텀 이벤트로.
- **Q. 경영 대시보드는 어디에 만드나?**
  → GA4를 소스로 Looker Studio에 구성. FE 레포에 어드민 UI를 만드는 게 아니다.

## 관련 실무 노트

- `notes/2026-06-10_spa-pageview-limits.md`
- `notes/2026-06-09_spa-page-tracking-layers.md`
- `notes/2026-06-09_care-regist-ga4-analytics.md`
- `notes/2026-06-09_ga4-vs-clarity-roles.md`
- `notes/2026-06-09_looker-ga4-exec-dashboard.md`

## 목표

- SPA 퍼널을 커스텀 이벤트로 설계·측정할 수 있다.
- GA4/Clarity/Looker의 역할을 구분해 조합한다.
- 자동 추적의 한계를 이해한다.
