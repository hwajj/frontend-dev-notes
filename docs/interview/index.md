# 면접 준비

주제별 Q&A 본문. 학습 **순서**는 [커리큘럼](/curriculum/)이 담당하고, 여기는 **키워드로 회상**할 때 쓴다.

## 정리 규칙

1. **본문 위치** — `interview/<대분류>/<키워드>.md` (curriculum Day에 긴 본문·`-answer.md`를 두지 않음)
2. **파일명** — kebab-case 영어 키워드. **week/day 번호 금지**
3. **이름 정하는 법** — curriculum 파일명에서 번호만 제거  
   - 예: `10-3-node-version-env` → `tooling/node-version-env.md`
4. **한 파일 = 면접에서 꺼낼 주제 하나** (너무 넓으면 쪼갬)
5. **관련 Day** — 파일 안 mid/하단에 `관련 Day: 10-3` 한 줄 (파일명에는 넣지 않음)
6. **안 만들어도 됨** — curriculum Day에 개념·면접 포인트가 이미 충분하면 interview 파일을 새로 안 둬도 된다. notes 링크만으로도 충분할 수 있다.
7. **쓰지 말 것** — `interview/week-N/...` 미러 폴더, curriculum 옆 `*-answer.md`

## 대분류

week 폴더를 복제하지 않는다. 아래는 **주제 축**이다. (주차는 참고용)

| 폴더 | 담는 것 | 대응 주차(참고) |
|------|---------|-----------------|
| `javascript/` | 실행 모델, 스코프, 비동기, 프로토타입 등 | 1~2주 |
| `typescript/` | 타입 시스템 | 3주 |
| `browser/` | DOM, 렌더링, 캐시, 스토리지 | 1·3주 |
| `react/` | 렌더링·훅·상태·에러 | 5~7주 |
| `network/` | HTTP, fetch, CORS, 실시간 | 4·8주 |
| `performance/` | Web Vitals, 번들·로딩 최적화 | 4·9~10 일부 |
| `tooling/` | 번들러, ESLint, nvm/env, 모노레포 | 10주 |
| `backend/` | Node, REST, 인증, BFF | 11주 |
| `database/` | 풀, 인덱스, 트랜잭션 | 12주 |
| `infra/` | nginx, S3, Docker, 트러블슈팅 | 13주 |
| `analytics/` | GA4, RUM, Sentry | 14주 |
| `cs/` | HTTP vs HTTPS 등 기초 CS | 횡단 |
| `career/` | STAR, 회고, 협업 답변 | 15주 |

학습 중 “어디에 넣지?” → **대분류 표에서 폴더 고르기** → **Day 제목에서 번호 제거한 파일명**.

---

## 글 목록

### JavaScript

- [클로저](/interview/javascript/closure)
- [이벤트 루프](/interview/javascript/event-loop)

### React

- [Virtual DOM](/interview/react/virtual-dom)
- [Hooks 규칙](/interview/react/hooks-rules)

### TypeScript

- [제네릭](/interview/typescript/generics)
- [유틸리티 타입](/interview/typescript/utility-types)

### Backend

- [Node 런타임 & 서버](/interview/backend/node-server)

### CS 기초

- [HTTP vs HTTPS](/interview/cs/http-vs-https)
