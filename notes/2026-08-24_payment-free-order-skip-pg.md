# 0원 본인부담금 — PG 생략·매칭 플로우

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: totalFee===0일 때 결제 PG 없이 매칭만 진행

## 결론

`totalFee === 0`이면 `onPaymentClick`이 **FreeMatchingPopup**만 연다. PG·결제수단 선택 없이 `createOrder({ total: 0 })` 후 `redirectUrl`로 결과 페이지로 이동한다. 버튼 `disabled`는 `!jobDetail`만 — 0원도 클릭 가능.

## 학습 주제 · 키워드

- **도메인·결제**: `totalFee`, `FreeMatchingPopup`, `createOrder`, `PG skip`

## 이 레포 예문

```ts
// PaymentPage.tsx
const onPaymentClick = () => {
  if (totalFee === 0) {
    openFreeMatchingPopup();
    return;
  }
  createOrder();
};

// submitFreeMatching — total: 0
const order = await paymentRepository.createOrder({
  jobId: Number(id),
  userId: payer?.id ?? 0,
  total: 0,
});
navigate(`/dailycare/payment/result?${order.redirectUrl}`);
```

## GPT에 물어볼 때

```
0원 주문에서 PG 생략 시 서버·클라 계약(redirectUrl, status 전이).
유료/0원 분기 테스트 매트릭스(CI/QA/REAL).
결제 완료 후 invalidateQueries와 0원 매칭 성공 경로 통합.
```
