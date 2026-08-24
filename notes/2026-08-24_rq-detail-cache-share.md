# useJobDetail 캐시 공유 (훅 + Repository)

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: 상세 → 결제 이동 시 job/detail을 다시 안 치게

## 결론

같은 `queryKey`( `jobKeys.detail(id)` )와 `queryFn`( `jobRepository.getDetail` )를 `useJobDetail` 훅으로 묶으면 **JobDetailPage·PaymentPage가 캐시를 공유**한다. fetch는 Repository에, 캐시·상태는 react-query에 둔다.

## 학습 주제 · 키워드

- **React Query + Repository**: `useJobDetail`, `jobRepository`, `queryKey factory`, `colocation`

## 이 레포 예문

```ts
// useJobDetail.ts
return useQuery({
  queryKey: jobKeys.detail(id),
  queryFn: () => jobRepository.getDetail(id),
  enabled: Boolean(id),
});

// PaymentPage.tsx
const jobDetailQuery = useJobDetail(id);
const jobDetail = jobDetailQuery.data ?? null;
```

## GPT에 물어볼 때

```
커스텀 fetch hook vs react-query wrapper hook 경계.
여러 페이지가 같은 detail query 공유할 때
enabled/id 변경·prefetchQuery·initialData 패턴 추천해줘.
```
