# leather-shop 장바구니 localStorage 동기화

> 작성일: 2026-07-07
> 형식: 경량
> 맥락: 장바구니 담기가 즉시 반영되고 새로고침해도 유지되는 이유를 App·cart.ts에서 확인한 세션.

## 결론

장바구니는 서버·Context 없이 `App.tsx`의 `cart` state가 단일 소스다. 초기값은 `loadCartFromStorage()`로 `localStorage` 키 `leather-shop:cart`에서 읽고, `cart`가 바뀔 때마다 `useEffect`가 `saveCartToStorage`로 JSON을 다시 쓴다. 담기·수량 변경은 `cart.ts`의 순수 함수가 새 배열을 반환하고 `setCart`로 갱신한다. 결제 완료(`handlePaymentComplete`)에서만 `setCart([])`로 비우며, 빈 배열이면 storage 키도 삭제된다.

## 학습 주제 · 키워드

- **클라이언트 장바구니 영속화**: `localStorage`, `useState` lazy init, `useEffect` 동기화, 불변 업데이트

## 이 레포 예문

`App.tsx`에서 로드·저장 루프가 한곳에 모여 있다.

```tsx
const [cart, setCart] = useState<CartLine[]>(() => loadCartFromStorage());

useEffect(() => {
  saveCartToStorage(cart);
}, [cart]);




```
const CART_STORAGE_KEY = "leather-shop:cart";
// loadCartFromStorage → getItem + JSON.parse + sanitizeCart
// saveCartToStorage → setItem (빈 배열이면 removeItem)
```

cart.ts는 키 이름·검증·저장만 담당한다. 로드 시 sanitizeCart로 없어진 상품·잘못된 커스텀 옵션을 걸러낸다.


### GPT에 물어볼때 

```
leather-shop은 장바구니를 App useState + localStorage(leather-shop:cart)로만 관리해.
1) 로그인 후 기기 간 동기화하려면 어떤 패턴이 맞을까? (merge vs 서버 SSOT)
2) useEffect 저장 대신 debounce/beforeunload를 쓸 때 트레이드오프는?
3) 시크릿 모드·quota 초과 시 saveCartToStorage가 실패해도 메모리 cart는 유지되는데 UX는 어떻게 처리하나?
```


---