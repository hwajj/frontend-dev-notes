# enabled로 조건부 fetch

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: PaymentPage·useJobDetail에서 id 없을 때 불필요한 API 호출 막기

## 결론

`enabled: false`면 queryFn이 실행되지 않고 `status`는 `pending`이다. URL 파라미터(`id`, `cgsUsersId`)가 준비된 뒤에만 fetch하도록 게이트한다.

## 학습 주제 · 키워드

- **React Query enabled**: `enabled`, `status pending`, `queryKey 변경`

## 이 레포 예문

```ts
// useJobDetail.ts
enabled: Boolean(id),

// PaymentPage.tsx
enabled: Boolean(id && cgsUsersId),
```

## GPT에 물어볼 때

```
enabled false → true 전환 시 fetch 타이밍,
queryKey와 enabled를 같이 바꿀 때 race,
enabled vs queryKey에 undefined 넣기 — v4에서 뭐가 나은지 비교해줘.
```
