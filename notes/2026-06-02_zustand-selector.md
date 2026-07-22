# Zustand selector — useStore()를 호출하는 두 가지 방법

> 작성일: 2026-06-02
> 맥락: 카탈로그 +/- 버튼이 느린 원인을 찾다가, `useCartStore()`를 selector 없이 전체 구독하고 있어서 cart의 어떤 값이 바뀌어도 CatalogPage 전체가 리렌더되는 구조를 발견했다.

## 이 글의 질문

- `useStore()`와 `useStore(s => s.x)`는 뭐가 다를까?
- 전체 구독하면 왜 느려질 수 있나?
- selector를 어떻게 쓰면 되고, 배열·객체를 반환할 때 주의할 점은?

## 핵심 (먼저 읽기)

| 방식 | 리렌더 조건 | 쓰는 상황 |
|------|-----------|----------|
| `useStore()` — 전체 구독 | store 안 **어떤 값이든** 바뀌면 | 대부분의 값이 필요할 때 |
| `useStore(s => s.x)` — selector | `s.x`만 바뀌면 | 특정 slice만 필요할 때 |
| `useStore(s => [s.x, s.y], shallow)` | x **또는** y가 바뀌면 | 두 값 함께, 배열로 반환 |

이 레포에서: `CatalogPage`는 `lines`만 필요한데 전체 구독 중 → `shippingRequestByWarehouseId`가 바뀌어도 페이지 전체가 리렌더된다.

## 전제 (30초)

- **Zustand store**: React 컴포넌트 바깥에서 상태를 보관하는 전역 창고. 여러 컴포넌트가 같은 창고를 구독한다.
- **리렌더(re-render)**: 컴포넌트 함수가 다시 실행되는 것. JSX가 재계산되고 Virtual DOM이 이전과 비교된다.
- **selector**: "창고에서 어떤 선반만 볼 것인지" 지정하는 함수. 감시 범위를 좁힌다.

## 한눈에

```
[전체 구독] const cart = useCartStore()

cart store 변경
  ├── lines 변경 (담기/제거)        → CatalogPage 리렌더 O  (필요)
  ├── shippingRequest 변경         → CatalogPage 리렌더 O  (불필요!)
  └── updateQuantity 호출          → CatalogPage 리렌더 O  (불필요!)


[selector 구독] const lines = useCartStore(s => s.lines)

cart store 변경
  ├── lines 변경 (담기/제거)        → CatalogPage 리렌더 O  (필요)
  ├── shippingRequest 변경         → CatalogPage 리렌더 X  (막힘)
  └── updateQuantity (lines 안 바뀜) → CatalogPage 리렌더 X (막힘)
```

## 용어

| 용어 | 뜻 |
|------|-----|
| `useCartStore` | Zustand로 만든 장바구니 전역 스토어 (`src/stores/cart-store.ts`) |
| `lines` | 장바구니에 담긴 품목 배열 |
| `shippingRequestByWarehouseId` | 창고별 배송 요청사항. 주문서 페이지에서만 사용 |
| selector | `useStore(fn)`에서 `fn` — "어떤 값을 감시할지" 지정하는 함수 |
| `shallow` | Zustand 보조 유틸. 배열·객체 반환 시 내용이 같으면 리렌더 안 함 |
| `Object.is` | Zustand 기본 비교 방식. `===`과 거의 같음. 새 배열 참조는 다르다고 판단함 |

---

## 한 줄 요약

Zustand store를 selector 없이 구독하면, 내가 관심 없는 값이 바뀌어도 컴포넌트가 리렌더된다.

## 함정 한 가지

"어차피 JSX에서 `cart.lines`만 쓰니까 괜찮겠지"라고 생각하기 쉽다. 하지만 Zustand는 **JSX가 아닌 구독** 단위로 리렌더를 결정한다. `const cart = useCartStore()`는 `cart` 객체 전체를 감시한다. `cart.shippingRequest`가 바뀌어도 `cart` 참조 자체가 새 객체이므로 리렌더가 발생한다.

## 왜 이렇게인가

Zustand는 내부적으로 구독자(subscriber) 목록을 관리한다. 상태가 바뀌면 모든 구독자에게 "바뀌었다"고 알린다. 이때 **selector의 반환값**을 이전과 비교해서 같으면 리렌더를 건너뛰고, 다르면 리렌더한다.

selector를 지정하지 않으면 기본 selector는 "상태 전체 객체를 반환"한다. 상태 객체는 변경될 때마다 새 참조이므로 어떤 slice가 바뀌어도 항상 다르다고 판단 → 항상 리렌더.

비교 함수의 기본값은 `Object.is` (≈ `===`)다. 원시값(string, number)은 값으로 비교하니 문제없다. 하지만 **배열이나 객체를 반환하는 selector**는 매번 새 참조가 나와서 내용이 같아도 다르다고 판단한다. 이때 `shallow`를 쓰면 내용 기반으로 비교한다.

**대안과 비교**: React Context로도 전역 상태를 관리할 수 있지만, Context는 value가 바뀌면 구독하는 컴포넌트 **전부**가 리렌더된다. 세밀한 구독 범위 제어가 안 된다. Zustand selector는 "이 slice만 감시"하는 더 세밀한 제어를 제공한다.

## 참고 코드

**현재 코드 — 전체 구독 (CatalogPage.tsx)**

```tsx
// cart store 전체를 구독. lines 외의 값이 바뀌어도 리렌더됨.
const cart = useCartStore();
// ...
const lines = cart.lines;
```

**개선 예시 — selector로 lines만 구독**

```tsx
// lines만 감시. shippingRequest 등 다른 값이 바뀌어도 CatalogPage 리렌더 없음.
const lines = useCartStore((s) => s.lines);
```

**배열을 반환할 때 shallow 비교**

```tsx
import { shallow } from 'zustand/shallow';

// lines 배열이 새 참조여도 내용이 같으면 리렌더 안 함
const lines = useCartStore((s) => s.lines, shallow);
```

**Zustand store 구조 — cart-store.ts 발췌**

```tsx
// src/stores/cart-store.ts
// lines와 shippingRequestByWarehouseId가 같은 store에 있음.
// 전체 구독 시 어느 쪽이 바뀌어도 구독자 모두가 리렌더됨.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      shippingRequestByWarehouseId: {},
      // ...
    }),
    { name: 'nh-cart' },
  ),
);
```

## 이 레포에서는

| 파일 | 현재 | 개선 방향 |
|------|------|---------|
| `CatalogPage.tsx` | `useCartStore()` 전체 구독 | `useCartStore(s => s.lines)` — lines만 필요 |
| `CartOrderPage.tsx` | `useCartStore()` 전체 구독 | lines + shippingRequest 둘 다 쓰므로 전체 구독도 큰 문제 없음 |

CatalogPage에서는 `cart.lines`만 필요하므로 selector 분리 효과가 가장 크다.

## 더 볼 것

- [Zustand 공식 — Prevent rerenders with useShallow](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)
- 관련 노트: [`2026-06-02_table-rerender-perf.md`](./2026-06-02_table-rerender-perf.md)
