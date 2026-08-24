# queryKey = 캐시 단위

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: HistoryPage 「완료 내역만 보기」 체크 토글 시 react-query 캐시가 왜 재사용되는지

## 결론

react-query 캐시는 URL이 아니라 **queryKey 배열**로 구분된다. `closed`와 `complete`는 `jobKeys.list(filter)`가 달라 **별도 캐시**이고, 각 키당 첫 요청 1번만 네트워크가 나간 뒤 staleTime(60초) 안에는 재사용된다.

## 학습 주제 · 키워드

- **React Query queryKey**: `queryKey`, `queryFn`, `JobListFilter`, `jobKeys.list`

## 이 레포 예문

`HistoryPage`의 filter가 바뀌면 키가 바뀌고, `useJobList`가 그 키로 fetch·캐시한다.

```ts
// queryKeys.ts — filter마다 다른 키
list: (filter: JobListFilter) => [...jobKeys.lists(), filter] as const,

// useJobList.ts
queryKey: jobKeys.list(filter),
queryFn: () => jobRepository.getList(filter),
```

## GPT에 물어볼 때

```
app-dailycare에서 jobKeys.list('closed')와 jobKeys.list('complete')는
같은 API인데 queryKey가 다르다. queryKey 직렬화·캐시 분리·객체/배열 키 설계
best practice를 이 예시 기준으로 설명해줘.
```
