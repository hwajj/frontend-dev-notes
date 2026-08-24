# invalidateQueries 계층 키

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: 결제 성공 후 목록·상세가 staleTime 60초 동안 옛 상태로 남는 버그 방지

## 결론

queryKey를 `['job','list', filter]`처럼 **앞쪽부터 계층**으로 두면 `invalidateQueries({ queryKey: jobKeys.lists() })` 한 번에 `process`/`closed`/`complete` 목록 캐시를 모두 stale 처리한다. mutation(결제) 후에는 TTL만 믿지 않고 invalidate한다.

## 학습 주제 · 키워드

- **React Query invalidation**: `invalidateQueries`, `queryKey factory`, `partial match`

## 이 레포 예문

```ts
// PaymentResultPage.tsx — 결제 성공 시
queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });

// queryKeys.ts
lists: () => [...jobKeys.all, 'list'] as const,
list: (filter) => [...jobKeys.lists(), filter] as const,
```

## GPT에 물어볼 때

```
v4 invalidateQueries의 prefix match 규칙.
jobKeys.lists() vs jobKeys.all vs exact: true 차이.
결제 성공 후 lists()+detail(id) invalidate vs refetchQueries vs setQueryData
트레이드오프를 companion 앱 패턴과 비교해줘.
```
