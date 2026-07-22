# REST API 설계 심화

## 키워드

- **멱등성(Idempotency)** — 같은 요청 여러 번 = 결과 동일(GET/PUT/DELETE). 재시도 안전.
- **Idempotency-Key** — 결제 등 POST 중복 방지 키.
- **에러 규격 & 상태 코드** — 일관된 `{code,message}` + 적절한 4xx/5xx.
- **페이지네이션** — offset vs cursor. 대용량은 cursor 유리.
- **계약(Contract) / OpenAPI** — 프론트-백 사이 스펙 명세.
- **API 버저닝** — `v1` / `v2` 또는 헤더로 호환 깨짐을 관리.
- **Rate Limiting** — 클라이언트·IP·토큰당 요청 상한. 429.
- **파일 업로드** — Multipart vs **Presigned URL**(클라이언트가 스토리지에 직접 PUT).

## 면접 포인트

- **Q. POST 재시도로 중복 생성되는 걸 어떻게 막나?**
  → Idempotency-Key를 서버가 저장해 같은 키의 재요청은 이전 결과를 반환. 네트워크 재시도·더블클릭에 안전.
- **Q. offset vs cursor 페이지네이션?**
  → offset은 구현 쉽지만 큰 페이지·삽입 시 밀림/성능 저하. cursor(마지막 키 기준)는 안정적·빠름.
- **Q. API 계약을 왜 명세하나?**
  → 프론트/백 병렬 개발, 목킹(MSW), 자동 타입 생성. 커뮤니케이션 비용을 줄인다.
- **Q. v1 / v2를 나누는 이유는?**
  → 하위 호환을 깨는 변경을 한 번에 강요하지 않기 위함. 구클라이언트 마이그레이션 시간을 번다.
- **Q. 429가 뜨면 프론트는?**
  → Rate limit. 백오프·재시도 상한·사용자 메시지. 무한 재시도는 악화.
- **Q. Presigned URL 업로드를 쓰는 이유는?**
  → 대용량이 앱 서버를 경유하지 않아 대역폭·타임아웃 부담↓. 권한은 짧은 수명 서명 URL로 부여(→ 13-3 S3).

## 관련 실무 노트

- `notes/study/2026-05-29_jwt-auth-abstraction.md`

## 목표

- 멱등성·Idempotency-Key로 안전한 쓰기 API를 설계한다.
- cursor 페이지네이션·버저닝·rate limit을 협업 언어로 설명한다.
- Multipart vs Presigned 업로드를 선택 기준으로 비교한다.
- OpenAPI 계약 기반 협업 흐름을 이해한다.
