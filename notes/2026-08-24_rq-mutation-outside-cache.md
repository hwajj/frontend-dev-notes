# mutation은 react-query 밖 — ordering ref

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: PaymentPage 결제·0원 매칭 — createOrder 중복 호출 방지

## 결론

**GET(조회)** 는 useQuery·캐시 대상이고, **POST(주문 생성)** 는 아직 `useMutation` 없이 `ordering.current` ref로 연타·팝업 재오픈 시 중복 주문을 막는다. 서버 state 캐시와 **일회성 side effect**는 분리한다.

## 학습 주제 · 키워드

- **React Query mutation**: `useMutation`, `useRef`, `idempotency`, `currentOrder`

## 이 레포 예문

```ts
// PaymentPage.tsx
const ordering = useRef(false);
const currentOrder = useRef<PaymentOrder | null>(null);

if (ordering.current || !paymentInfo || !jobDetail) return;
if (currentOrder.current) {
  openPaymentMethodPopup(currentOrder.current);
  return;
}
ordering.current = true;
```

## GPT에 물어볼 때

```
PaymentPage createOrder를 useMutation으로 옮길 때
isPending·onSuccess invalidate·currentOrder ref 대체 패턴.
멱등성 없는 POST를 연타 막는 UI/서버 이중 방어 정리.
```
