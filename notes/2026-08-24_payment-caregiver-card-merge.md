# payment API + jobDetail merge (amount_time)

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: 결제 applicant_user 응답에 시급 없음 — job/detail 캐시로 보강

## 결론

`paymentRepository.getPaymentInfo`는 cgs_users 중심이라 **amount_time이 0**으로 온다. 같은 `cgs_users_id`로 `jobDetail.applicants`에서 찾아 merge하고, react-query로 **이미 받아 둔 detail 캐시**를 재사용한다.

## 학습 주제 · 키워드

- **풀스택 연동**: `useMemo merge`, `applicant_user`, `amount_time`, `cross-query enrich`

## 이 레포 예문

```ts
// PaymentPage.tsx
const fromDetail = jobDetail?.applicants.find(
  (a) => String(a.cgsUserId) === cgsUsersId
);
return {
  ...fromDetail,
  ...card,
  amountTime: fromDetail.amountTime || card.amountTime,
};
```

## GPT에 물어볼 때

```
두 API 응답을 UI에서 merge vs BFF/백엔드에서 합치기 트레이드오프.
react-query select/transform vs useMemo merge.
payment info query와 job detail query 로딩 타이밍 불일치 UX.
```
