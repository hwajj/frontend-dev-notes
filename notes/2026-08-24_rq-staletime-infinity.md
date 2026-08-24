# staleTime Infinity (정적 데이터)

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: useCaremateAward 수상 내역 — 한 번 받으면 재요청 불필요

## 결론

전역 `staleTime: 60s`를 **훅 단위 `staleTime: Infinity`로 덮어쓰면** 해당 query는 앱 실행 중 fresh로 유지된다. 바뀌지 않는 데이터(수상 내역)에 맞고, invalidate가 필요해지면 그때만 키를 무효화한다.

## 학습 주제 · 키워드

- **React Query per-query options**: `staleTime: Infinity`, `gcTime`, `override defaultOptions`

## 이 레포 예문

```ts
// useCaremateAward.ts
useQuery({
  queryKey: paymentKeys.award(cgsUserId ?? 0),
  queryFn: () => paymentRepository.getCaremateAward(cgsUserId ?? 0),
  enabled: Boolean(cgsUserId),
  staleTime: Infinity,
});
```

## GPT에 물어볼 때

```
staleTime Infinity vs gcTime(default 5min) 조합 —
언마운트 후 재마운트·invalidate 없을 때 재요청 여부.
정적/준정적 데이터 분류 기준과 Infinity 남용 시 리스크.
```
