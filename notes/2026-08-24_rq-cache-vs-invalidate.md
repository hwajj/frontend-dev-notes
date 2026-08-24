# 캐시만 vs invalidate — react-query 도입 이유

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: HistoryPage Map+TTL vs react-query 선택 논의 — 결제 후 stale 버그

## 결론

체크 토글용 **TTL 캐시만** 넣으면 결제 성공 후에도 목록이 최대 60초 옛 상태다. react-query는 캐시 + **`invalidateQueries`로 mutation 직후 키 단위 무효화**가 한 세트라 PaymentResultPage에서 목록·상세를 갱신할 수 있다.

## 학습 주제 · 키워드

- **React Query 설계**: `invalidateQueries`, `staleTime`, `mutation side effect`, `server state`

## 이 레포 예문

결제 성공 → 공고 status 변경 → 캐시 버림.

```ts
// PaymentResultPage.tsx
if (!succeeded) return;
queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
```

companion도 결제 결과에서 `invalidateQueries([...])`로 목록 키를 여러 개 지운다.

## GPT에 물어볼 때

```
서버 state 캐시에서 TTL-only vs event-driven invalidation.
결제·수정·삭제 후 어떤 queryKey를 invalidate할지 설계하는 체크리스트.
소규모 앱(엔드포인트 3~5)에서 react-query vs 수제 Map 비용 비교.
```
