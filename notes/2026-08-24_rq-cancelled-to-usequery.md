# cancelled 플래그 → useQuery

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: HistoryPage useEffect+getList에서 filter 연타 시 race 처리

## 결론

`useEffect` + `let cancelled = false`는 **늦게 도착한 응답이 state를 덮는 race**를 막는 수동 패턴이다. `useQuery`는 queryKey/filter 변경 시 이전 요청을 버리고 **키별 결과만** 반영하므로 같은 보일러플레이트가 필요 없다.

## 학습 주제 · 키워드

- **React Query vs useEffect fetch**: `cancelled flag`, `AbortSignal`, `queryKey`, `race condition`

## 이 레포 예문

전환 전 패턴(개념): `filter` 변경 → effect 재실행 → `cancelled`로 stale response 무시.

전환 후:

```ts
// useJobList.ts — filter가 queryKey에 포함
queryKey: jobKeys.list(filter),
queryFn: () => jobRepository.getList(filter),
```

## GPT에 물어볼 때

```
useEffect fetch + cancelled vs react-query queryKey 변경 시
요청 취소·결과 무시 동작 비교.
queryFn에 AbortSignal 받아 fetch abort하는 v4 패턴 예시.
```
