# Day 29: Core Web Vitals

## 키워드

- **LCP (Largest Contentful Paint)** — 가장 큰 콘텐츠가 그려지는 시점. 로딩 체감 지표(권장 2.5s 이하).
- **CLS (Cumulative Layout Shift)** — 예기치 않은 레이아웃 이동 누적량. 시각 안정성 지표(권장 0.1 이하).
- **INP (Interaction to Next Paint)** — 상호작용 후 다음 페인트까지 반응성. FID를 대체한 지표(권장 200ms 이하).
- **FCP (First Contentful Paint)** — 첫 콘텐츠가 그려지는 시점.
- **Performance** — `PerformanceObserver` 등으로 실사용자(RUM) 지표 측정.
- **Lighthouse** — 랩 환경에서 성능을 진단·점수화하는 도구.

## 면접 포인트

- **Q. LCP를 개선하려면?**
  → 큰 이미지 최적화·preload, 서버 응답(TTFB) 개선, 렌더 차단 리소스 제거, 폰트 최적화.
- **Q. CLS를 유발하는 대표 원인과 해결은?**
  → 크기 미지정 이미지/광고/동적 삽입. `width/height`(또는 aspect-ratio) 지정, 공간 예약으로 해결.
- **Q. INP가 나쁜 이유는?**
  → 긴 태스크가 메인 스레드를 막아 입력 반응이 늦어짐. 태스크 분할, 무거운 작업 지연/양보(yield)로 개선.

## 목표

- 3대 지표(LCP/CLS/INP)의 의미와 권장 기준을 안다.
- 각 지표 저하 원인과 대표 개선책을 매핑할 수 있다.
- Lighthouse/RUM으로 측정하고 우선순위를 정한다.
