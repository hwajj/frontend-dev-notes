응. `isLoading / isFetching / isPreviousData`를 **`keepPreviousData` 바로 다음에 붙이는 구조**가 가장 자연스러워. 기존 내용은 최대한 유지하고 추가하면 이렇게 돼.

# React Query `staleTime` vs `gcTime` vs `keepPreviousData`

> 작성일: 2026-08-24
> 형식: 경량

### `staleTime` = 캐시의 신선도

- 데이터를 가져온 후 **얼마 동안 fresh로 볼지**
- 시간이 지나면 `stale`이 됨
- **캐시는 삭제되지 않음**
- stale 상태에서 재요청 이벤트가 발생하면 새 데이터를 요청
- `staleTime`이 재요청 주기는 아님
- `refetchOnMount: 'always'`처럼 stale 여부와 관계없이 재요청하도록 설정할 수도 있음
- `staleTime: Infinity` → 자동으로 stale되지 않음. 단, `gcTime`과는 별개라 캐시는 삭제될 수 있음
- 정적 데이터는 `staleTime: Infinity`로 설정하고, 변경 시 `invalidateQueries`로 갱신할 수 있음

```text
API 요청
 ↓
fresh ──(staleTime 경과)──→ stale
                              ↓
                         캐시는 여전히 존재
```

### `gcTime` = 캐시 보관 시간

- 해당 query를 사용하는 컴포넌트가 없어져 **inactive**가 된 후 얼마나 캐시를 보관할지
- 시간이 지나면 **캐시 자체를 삭제**
- 이후 다시 필요하면 캐시가 없으므로 새로 요청

```text
페이지 이탈
 ↓
inactive ──(gcTime 경과)──→ 캐시 삭제
```

### `keepPreviousData` = query 변경 중 이전 데이터 유지

- `queryKey`가 변경되어 새 데이터를 가져오는 동안 **이전 query의 데이터를 유지해서 보여줌**
- 필터·페이지네이션 변경 시 빈 화면이나 깜빡임을 줄일 수 있음
- `isPreviousData`로 이전 query의 데이터를 보여주는 상태인지 구분 가능
- 단, 새 데이터가 도착하기 전까지 **이전 필터의 데이터가 잠깐 보일 수 있음**

```text
closed 데이터
    ↓
필터 변경 → complete
    ↓
이전 closed 데이터 유지
    ↓
complete fetch 완료
    ↓
complete 데이터로 교체
```

### `isLoading` vs `isFetching` vs `isPreviousData`

- `isLoading` → **처음 데이터를 가져오는 중**. 캐시가 없어 보여줄 데이터가 없는 상태
- `isFetching` → **현재 API 요청이 진행 중**. 캐시가 있어도 `true`가 될 수 있음
- `isPreviousData` → `keepPreviousData`로 **이전 query의 데이터를 보여주는 중**인지 나타냄
- 따라서 캐시가 있는데도 `isLoading`만으로 스피너를 띄우면 UX가 어색할 수 있음
- `keepPreviousData` 전환에서는 `isFetching && isPreviousData`를 이용해 **이전 목록을 유지하면서 전환 중임을 표시**할 수 있음

```text
첫 방문
→ 캐시 없음
→ isLoading = true

캐시 hit
→ 기존 데이터 즉시 표시
→ isLoading = false

재요청
→ 기존 데이터 표시 + API 요청
→ isFetching = true

필터 변경 + keepPreviousData
→ 이전 데이터 표시 + 새 데이터 요청
→ isFetching = true
→ isPreviousData = true
```

### 한 줄 요약

> **staleTime = "이 데이터 아직 최신이라고 봐도 돼?"**
> → 지나면 `stale`이 되지만 캐시는 남아 있고, 재요청 이벤트가 발생하면 새 데이터를 요청한다.

> **gcTime = "아무도 안 쓰는 이 캐시, 언제 버릴까?"**
> → 지나면 캐시 자체가 삭제되어, 이후 다시 필요하면 새로 요청한다.

> **keepPreviousData = "새 데이터 가져오는 동안 이전 데이터를 보여줄까?"**
> → `queryKey`가 바뀌어도 이전 데이터를 잠시 유지해 화면 깜빡임을 줄인다.

> **isLoading = "아직 보여줄 데이터가 없어서 처음 로딩 중인가?"**
> → 캐시가 없는 최초 요청에서 주로 `true`가 된다.

> **isFetching = "지금 API 요청이 진행 중인가?"**
> → 캐시가 있어도 재요청 중이면 `true`가 된다.

> **isPreviousData = "지금 보여주는 데이터가 이전 query의 데이터인가?"**
> → `keepPreviousData`로 이전 데이터를 유지하는 동안 `true`가 된다.

### 핵심

`staleTime`은 **신선도**,
`gcTime`은 **캐시 생존 기간**,
`keepPreviousData`는 **query 변경 중 이전 데이터 표시**,
`isLoading / isFetching / isPreviousData`는 **현재 로딩·데이터 상태를 UI에서 판단하는 기준**이다.

> **stale ≠ 캐시 삭제**
> **staleTime ≠ 재요청 주기**
> **isFetching ≠ 데이터가 없는 상태**
