# React Query `queryKey`와 캐시 무효화

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: HistoryPage 필터별 캐시 재사용 + 결제 성공 후 목록·상세 캐시 갱신

## 결론

React Query 캐시는 URL이 아니라 **`queryKey`로 구분**된다. 같은 `queryKey`는 같은 캐시를 공유하고, key가 달라지면 별도 캐시가 된다.

`queryKey`를 `['job', 'list', filter]`처럼 **계층적으로 설계하면**, `invalidateQueries`에서 상위 key를 지정해 관련 캐시를 한꺼번에 stale 처리할 수 있다.

## 학습 주제 · 키워드

- **`queryKey`**: 캐시를 구분하는 기준
- **queryKey factory**: 일관된 key 생성
- **계층적 queryKey**: 관련 캐시 그룹화
- **`invalidateQueries`**: 캐시를 stale 처리
- **partial/prefix match**: 상위 key로 하위 query 선택

## 이 레포 예문

```ts
// queryKeys.ts

all: () => ['job'] as const,

lists: () => [...jobKeys.all(), 'list'] as const,

list: (filter: JobListFilter) =>
  [...jobKeys.lists(), filter] as const,

detail: (jobId: number) =>
  [...jobKeys.all(), 'detail', jobId] as const,
```

예를 들어:

```text
['job', 'list', 'process']
['job', 'list', 'closed']
['job', 'list', 'complete']
```

은 각각 **별도의 캐시**다.

따라서 HistoryPage에서 `filter`가 바뀌면 다른 queryKey가 되고, 해당 캐시가 있으면 재사용한다.

반대로:

```ts
queryClient.invalidateQueries({
  queryKey: jobKeys.lists(),
});
```

를 실행하면 `['job', 'list']`로 시작하는 목록 캐시들을 한꺼번에 stale 처리할 수 있다.

```text
['job', 'list']
    ├─ process
    ├─ closed
    └─ complete
         ↑
    한 번에 invalidate
```

결제 성공 후에는:

```ts
queryClient.invalidateQueries({
  queryKey: jobKeys.lists(),
});

queryClient.invalidateQueries({
  queryKey: jobKeys.detail(jobId),
});
```

처럼 관련 목록과 상세 캐시를 무효화해 결제 전의 오래된 상태가 남지 않도록 한다.

## 핵심

> **`queryKey` = 어떤 캐시인가**
> **계층적 `queryKey` = 관련 캐시를 묶어 관리하는 구조**
> **`invalidateQueries` = 데이터가 변경됐으니 해당 캐시를 stale 처리**

그리고 중요한 점:

> **`invalidateQueries`는 캐시를 삭제하는 것이 아니다.**
> 캐시를 **stale로 표시**하고, 활성 query라면 최신 데이터를 가져오도록 재요청할 수 있다.

즉 `staleTime`이 **평소 캐시를 얼마나 신뢰할지** 결정한다면, `invalidateQueries`는 **서버 데이터가 변경된 것을 알고 있을 때 즉시 캐시를 최신 상태가 아니라고 표시하는 방법**이다.
