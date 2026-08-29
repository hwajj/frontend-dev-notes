# React Query 캐시 무효화

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: 결제 후 공고 목록과 상세 정보가 이전 상태로 남는 문제를 확인하면서 학습

## 핵심

React Query는 서버 데이터를 캐시해서 재사용한다.

하지만 **결제·수정 등으로 서버 데이터가 바뀌면 기존 캐시가 낡을 수 있다.**

```ts
queryClient.invalidateQueries({
  queryKey: jobKeys.detail(jobId),
});
```

`invalidateQueries`는 해당 query를 **stale로 표시하고 최신 데이터를 다시 확인하게 한다.**

## `staleTime` vs `invalidateQueries`

- `staleTime` → **얼마 동안 fresh하게 볼지**
- `invalidateQueries` → **데이터가 바뀌었으니 다시 확인하라고 알리기**

## 이번 작업에서 배운 것

> **서버 데이터를 변경하는 mutation 후에는, 영향을 받은 query를 `invalidateQueries`로 무효화해 캐시와 서버 상태를 맞춘다.**

특히 어떤 query를 무효화할지는 **mutation으로 어떤 데이터가 변경됐는지**를 기준으로 판단한다.
