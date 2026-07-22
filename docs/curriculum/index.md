# 커리큘럼 개요

> "왜 이렇게 설계했는지 설명할 수 있는 프론트"로 체급 올리기

## 하루 루틴 (추천)

- 📘 이론 1~1.5시간
- ✍️ 노트 정리 30분
- 🧠 면접 질문 형태로 말로 설명해보기 30분
- 💻 실무 코드랑 연결해서 "어디에 쓰지?" 생각

## 학습 흐름

```
JS → TS → DOM/브라우저 → 네트워크/렌더링 → React → 프론트 실전(라우팅·실시간·품질·툴링)
→ 백엔드/DB → 인프라·배포 → 분석·관측 → 경력 무기화
```

> 주차는 고정, 하루 분량(일수)은 유연하게. 각 Day는 "하나의 응집된 subsystem"을 목표로 함.

## 주차별 목록

**Part 1 · 프론트 기반 (1~7주)**

- [1주차 — 웹 & JS 기초 체력 다지기](/curriculum/week-01-web-js/)
- [2주차 — JS 심화](/curriculum/week-02-js-advanced/)
- [3주차 — TypeScript + DOM & 성능](/curriculum/week-03-typescript-dom/)
- [4주차 — 네트워크 & 렌더링 전략](/curriculum/week-04-network-perf/)
- [5주차 — React Rendering](/curriculum/week-05-react-rendering/)
- [6주차 — React Hooks & 성능](/curriculum/week-06-react-hooks/)
- [7주차 — React 설계/상태/에러](/curriculum/week-07-react-state-error/)

**Part 2 · 프론트 실전 (8~10주)**

- [8주차 — 라우팅 · URL 상태 · 실시간 통신](/curriculum/week-08-routing-realtime/)
- [9주차 — 프론트 품질 (CSS · 접근성 · 테스트 · 보안)](/curriculum/week-09-quality/)
- [10주차 — 개발환경 & 빌드 툴링](/curriculum/week-10-tooling/) — 번들·env·패키지 매니저

**Part 3 · 백엔드 · CS · 인프라 (11~14주)**

- [11주차 — 백엔드 기초 (Node · API · 인증 · BFF)](/curriculum/week-11-backend/)
- [12주차 — 데이터베이스](/curriculum/week-12-database/)
- [13주차 — 네트워크 · 인프라 & 배포 트러블슈팅](/curriculum/week-13-infra-deploy/) — S3·CDN 포함
- [14주차 — 분석 · 측정 & 관측](/curriculum/week-14-analytics/)

**Part 4 · 마무리**

- [15주차 — 경력 무기화](/curriculum/week-15-career/)

## 면접 준비

주제별 Q&A는 [면접 준비](/interview/)에서 확인합니다.

## 나중에 보강 (백로그)

이번 라운드에서 의도적으로 뺀 주제. 우선순위는 낮지만, 다음 보완 때 Day/절로 넣을 후보.

| 주제 | 넣을 위치(후보) | 메모 |
|------|-----------------|------|
| Web Worker | 3주 성능 / Day 22 | Main Thread, MessageChannel, Transferable |
| 이벤트 루프 ↔ React 렌더 | Day 15 심화 또는 5~6주 | rAF, rIC, Scheduler와 렌더 연결 |
| PWA / Service Worker | 4주 또는 9주 | offline·HTTP 캐시와 혼동 주의 |
| 메시지 큐 (Kafka 등) | 11-4 옆 한 Day | 업로드·메일·알림이 비동기인 이유 |
| MSA 심화 | 11주 | 지금은 BFF·Gateway만 |
| Webhook · Background Job | 11-2 / 11-4 | Rate Limit·Presigned 이후 확장 |
| 설계 패턴 (DI, Adapter, Facade…) | 7주 React 설계 | 암기표 말고 적용 사례로 |
| Feature / Atomic / FSD 폴더 구조 | 7주 또는 15주 | 실무 아키텍처·공용 컴포넌트 경계 |
| gRPC | 8-3 API 통신 비교 | REST·WS·SSE·GraphQL 다음 |
