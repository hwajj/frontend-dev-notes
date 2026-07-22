# URL을 상태로 (URL as State)

## 키워드

- **URL as State** — 필터·탭·페이지 같은 UI 상태를 컴포넌트 state가 아니라 **쿼리스트링**에 두는 패턴. 공유·새로고침·뒤로가기에 강함.
- **searchParams** — `URLSearchParams`로 읽고 쓰기. 라우터의 `useSearchParams` 등.
- **직렬화/역직렬화(codec)** — 객체 ↔ 문자열 변환. 배열·중첩 값 인코딩 규칙 필요.
- **동기화 race** — URL과 로컬 state를 양방향 동기화할 때 순서가 꼬여 값이 튀는 문제.
- **replace 사용** — 입력 중 잦은 URL 갱신은 `replaceState`로 히스토리 오염 방지.

## 면접 포인트

- **Q. 상태를 URL에 두면 뭐가 좋은가?**
  → 링크 공유·북마크·새로고침·뒤로가기에서 상태가 보존된다. "서버 state / 클라이언트 state / URL state" 3분할의 한 축.
- **Q. URL ↔ state 동기화에서 race는 왜 생기나?**
  → URL 변경 → state 반영과 state 변경 → URL 반영이 서로를 트리거하며 겹칠 때. 단방향(URL을 SSOT)으로 정하거나 배칭으로 완화.
- **Q. 배열/객체를 쿼리에 어떻게 담나?**
  → 명시적 codec(예: `key=a,b,c` 또는 base64/JSON) 정의. 인코딩·디코딩 대칭을 보장해야 한다.

## 관련 실무 노트

- `notes/2026-07-02_use-param-state-purpose.md`
- `notes/2026-07-01_use-param-state-url-race.md`
- `notes/2026-07-02_param-url-codec.md`
- `notes/2026-07-02_url-playground-race.md`
- `notes/study/2026-05-29_use-param-state-batch.md`

## 목표

- 어떤 상태를 URL에 둘지(공유·복원 필요 여부)로 판단할 수 있다.
- searchParams codec을 대칭적으로 설계한다.
- URL↔state 동기화 race의 원인과 단방향 SSOT 해법을 설명한다.
