# isLoading·isFetching·isPreviousData (useJobList)

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: 체크 토글 시 캐시가 있는데도 스피너가 뜨거나, 에러가 목록을 덮는 문제 방지

## 결론

`isLoading`만 쓰면 캐시 hit에도 스피너가 뜬다. `isFetching && isPreviousData`일 때만 로딩으로 보면 **캐시 즉시 표시 + 전환 중에만 로딩**이 된다. 에러는 `items.length === 0`일 때만 화면에 드러내 캐시된 목록을 유지한다.

## 학습 주제 · 키워드

- **React Query loading 상태**: `isLoading`, `isFetching`, `isPreviousData`, `keepPreviousData`

## 이 레포 예문

`useJobList`가 UI용 loading/error를 좁혀 반환한다.

```ts
isLoading: query.isLoading || (query.isFetching && query.isPreviousData),
isError: query.isError && items.length === 0,
```

## GPT에 물어볼 때

```
v4 useQuery에서 isLoading vs isFetching vs isPreviousData 차이.
keepPreviousData true일 때 filter 변경 시각선(타임라인)을
「첫 방문 / 캐시 hit / keepPrevious 전환 / 에러+캐시」 네 경우로 설명해줘.
```
