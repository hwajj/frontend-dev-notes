# Day 37: TanStack Query (React Query)

## 키워드

- **Query Key** — 캐시 엔트리의 주소. 같은 키 = 같은 데이터로 공유·재사용.
- **staleTime** — 데이터를 "신선(fresh)"으로 볼 시간. 이 안에서는 백그라운드 refetch를 안 함(기본 설정 기준).
- **gcTime** (구 `cacheTime`) — 구독자가 없을 때 캐시를 메모리에 얼마나 남길지. 지나면 GC.
- **invalidate** — 특정 키를 무효화해 다시 fetch하게 만듦. 뮤테이션 성공 후 목록 갱신에 흔함.
- **background refetch** — 이미 화면의 데이터가 있어도, stale이면 뒤에서 다시 가져와 UI를 갱신.
- **서버 상태(Server State)** — 서버가 소스 오브 트루스인 데이터. 클라이언트 전역 UI 상태(Zustand 등)와 분리해서 생각.

## 개념 정리

### HTTP 캐시(Day 5)와 React Query의 역할 분리

| 계층                    | 무엇을 캐시하나                           | 누가 쓰나     |
| ----------------------- | ----------------------------------------- | ------------- |
| Browser / CDN HTTP 캐시 | 응답 바이트(JS, 이미지, 때로 API)         | 브라우저·엣지 |
| React Query             | **파싱된 서버 상태**(JSON 등) + 로딩/에러 | 앱 컴포넌트   |

"Network에 요청이 안 뜬다"가 HTTP 캐시일 수도 있고, React Query가 fresh라서 fetch를 스킵한 것일 수도 있다. **둘을 같은 말로 부르면** 디버깅이 꼬인다.

### staleTime vs gcTime

- `staleTime`이 길다 → 같은 화면을 자주 와도 **덜 다시 받음** (최신성과 트레이드오프)
- `gcTime`이 길다 → 페이지를 떠났다가 돌아와도 **이전 데이터로 즉시 그릴 여지** (메모리 트레이드오프)

### invalidate · background refetch

- 글 작성 성공 후 `invalidateQueries({ queryKey: ['posts'] })` → 목록을 다시 맞춤
- 윈도우 포커스·재연결 시 stale이면 background refetch(설정에 따름)
- "실시간처럼" 보이게 할 때: `refetchInterval` 또는 이벤트 수신 후 invalidate (→ 08-3)

## 면접 포인트

- **Q. React Query를 쓰는 이유는?**
  → 서버 상태의 로딩/에러/캐시/중복 요청/재시도를 컴포넌트마다 손대지 않고 일관되게 다룬다.
- **Q. staleTime과 gcTime 차이는?**
  → staleTime은 "언제 낡았다고 볼지", gcTime은 "안 쓰는 캐시를 언제 버릴지".
- **Q. 뮤테이션 후 화면이 안 바뀌면?**
  → 관련 queryKey를 invalidate하지 않았거나, key가 목록/상세와 불일치한 경우가 많다.
- **Q. HTTP 캐시와 뭐가 다르나?**
  → HTTP 캐시는 전송 계층의 재사용, RQ는 앱이 서버 상태를 어떻게 들고·갱신할지. (→ Day 5)

## 목표

- queryKey 기준으로 캐시가 공유·무효화되는 방식을 설명할 수 있다.
- staleTime / gcTime / invalidate / background refetch로 "두 번 fetch / 안 갱신"을 진단한다.
- Day 5 HTTP 캐시와 역할을 구분해 말한다.
