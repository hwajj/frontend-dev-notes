# 큰 테이블 리렌더 — state 하나 바뀌면 왜 모든 행이 다시 그려지나

> 작성일: 2026-06-02
> 맥락: 카탈로그 페이지에서 +/- 버튼 하나를 눌렀을 때, 서버 호출은 없는데 체감상 느렸다. React는 state가 바뀌면 어디까지 리렌더하는지, 그리고 큰 테이블에서 어떻게 비용이 쌓이는지를 정리한다.

## 이 글의 질문

- React에서 state 하나가 바뀌면 정확히 어디까지 리렌더되나?
- +/- 하나를 눌렀는데 왜 관계없는 행들도 다시 그려지나?
- 큰 테이블에서 불필요한 리렌더를 줄이는 방법은?

## 핵심 (먼저 읽기)

| 원인 | 설명 | 개선 방법 |
|------|------|----------|
| state가 컴포넌트 최상위에 있음 | `rowQtys` 변경 → CatalogPage 전체 재실행 | state colocation — state를 실제로 쓰는 컴포넌트 가까이로 이동 |
| Zustand 전체 구독 | `useCartStore()` → cart 변경 시 CatalogPage 전체 리렌더 | `useCartStore(s => s.lines)` selector 사용 |
| 행 메모이제이션 없음 | `items.map(item => <tr>...)` — 부모 리렌더 시 모든 행 재실행 | 행을 별도 컴포넌트로 분리 + `React.memo` |

세 가지가 겹쳐 있어, +/- 하나를 누를 때마다 20~100개 행 전체가 리렌더된다.

## 전제 (30초)

- **리렌더**: 컴포넌트 함수가 다시 실행되는 것. Virtual DOM을 다시 만들어 이전과 비교 후 실제 DOM 업데이트를 결정한다.
- **Virtual DOM diff**: 리렌더마다 React가 이전 결과와 새 결과를 비교하는 과정. DOM 업데이트가 없어도 이 비교 자체에 JS 실행 비용이 든다.
- **인라인 렌더**: 부모 JSX 안에 `.map(item => <tr>...</tr>)` 형태로 행을 직접 작성. 각 행이 별도 컴포넌트가 아니므로 메모이제이션을 붙일 수 없다.
- **`React.memo`**: 컴포넌트를 감싸는 래퍼. props가 이전과 같으면 리렌더를 건너뛴다.

## 한눈에

```
[현재 — 인라인 렌더, selector 없음]

+/- 클릭 (itemA)
  → setRowQtys({ [itemA.id]: 5 })
       ↓
  CatalogPage 전체 리렌더
       ├── useCartStore() 재실행   ← 전체 구독
       └── items.map(item => <tr>...)
             ├── itemA  → qty 바뀜 → DOM 업데이트 O
             ├── itemB  → qty 그대로 → DOM 업데이트 X, 하지만 리렌더는 O
             ├── itemC  → ...
             └── item100 → ...    ← 99개 행이 "그냥 돌아가며" 비교됨


[개선 후 — selector + React.memo]

+/- 클릭 (itemA)
  → setRowQtys({ [itemA.id]: 5 })
       ↓
  CatalogPage 리렌더
       ├── useCartStore(s => s.lines) 재실행   ← lines만 감시
       └── items.map(item => <CatalogRow item={item} qty={...} />)
             ├── <CatalogRow itemA />  props 변경 → 리렌더 O
             └── <CatalogRow itemB />  props 동일 → 리렌더 X  (React.memo 차단)
```

## 용어

| 용어 | 뜻 |
|------|-----|
| 리렌더 | 컴포넌트 함수가 다시 실행됨. DOM이 반드시 바뀌는 건 아님 |
| Virtual DOM diff | 리렌더된 결과와 이전 결과를 비교하는 단계. DOM 업데이트 없어도 이 비교에 JS 비용 발생 |
| `React.memo` | 컴포넌트 래퍼. props가 동일하면 리렌더 건너뜀 (기본 비교: `Object.is`) |
| state colocation | state를 실제로 필요한 컴포넌트 가장 가까이 두는 원칙 |
| `rowQtys` | CatalogPage의 로컬 state. `{ [productId]: number }`. 담기 전 임시 수량 |
| `items` | catalog query 결과. 한 페이지에 20~100개 |

---

## 한 줄 요약

React는 state가 바뀐 컴포넌트부터 그 아래 자식 전부를 기본으로 리렌더한다. 메모이제이션은 이 기본값에서 선택적으로 벗어나는 도구다.

## 함정 한 가지

"React가 Virtual DOM 덕분에 DOM 업데이트를 최소화하니까 리렌더가 많아도 괜찮다"는 생각이 흔하다. 하지만 Virtual DOM **diff 자체에도 비용이 있다**. 100개 행의 JSX를 새로 만들고 비교하면 100번의 계산이 매 클릭마다 발생한다. DOM 업데이트가 없어도 JS 실행 비용은 쌓인다.

## 왜 이렇게인가

React의 기본 규칙은 단순하다: **state가 바뀐 컴포넌트와 그 하위 컴포넌트를 모두 다시 실행한다**. `React.memo`나 `useMemo`는 이 기본값에서 벗어나는 선택적 최적화다.

CatalogPage는 `rowQtys`(React state)와 `useCartStore()`를 컴포넌트 최상위에 두고, 행을 `items.map(item => <tr>...</tr>)` 인라인으로 렌더한다. 인라인이면 각 `<tr>`이 별도 컴포넌트가 아니므로 `React.memo`를 붙일 수 없다. 하나의 행에서 +/-를 눌러도 다른 99개 행이 함께 리렌더된다.

해결 방법은 두 갈래다:
1. **행을 별도 컴포넌트로 분리 + `React.memo`**: 각 행이 자신의 props가 바뀔 때만 리렌더.
2. **state colocation**: `rowQtys`의 특정 항목을 행 컴포넌트 안으로 내리면 그 행만 리렌더.

단, 기본 page size 20개에서는 20번의 diff가 매 클릭마다 발생하므로 체감하기 어렵다. 100개로 늘리거나 행당 JSX가 복잡해질수록 체감이 커진다.

## 참고 코드

**현재 코드 — 인라인 렌더 (CatalogPage.tsx)**

```tsx
// src/routes/nursing-hospital/supplies/CatalogPage.tsx
// 행이 별도 컴포넌트가 아님. 부모 리렌더 시 items 개수만큼 전부 재계산.
{items.map((item) => {
  const inCart = cart.lines.find((l) => l.productId === item.id);
  const qty = getRowQtyValue(item);
  return (
    <tr key={item.id}>
      {/* 9개 셀, 수량 stepper, 담기 버튼 등 */}
    </tr>
  );
})}
```

**개선 방향 — 행 컴포넌트 분리 + React.memo**

```tsx
// 행을 별도 컴포넌트로 분리하고 memo로 감싼다
const CatalogRow = React.memo(({
  item, inCart, qty, stepperDisabled, onQtyChange, onAddToggle,
}: CatalogRowProps) => {
  return <tr>...</tr>;
});

// 부모에서: props가 바뀐 행만 리렌더
{items.map((item) => {
  const inCart = lines.find((l) => l.productId === item.id);
  const qty = rowQtys[item.id] ?? defaultOrderQtyFor(item);
  return (
    <CatalogRow
      key={item.id}
      item={item}
      inCart={inCart}
      qty={qty}
      onQtyChange={handleQtyChange}
      onAddToggle={handleAddToggle}
    />
  );
})}
```

**Zustand selector로 불필요한 리렌더 차단**

```tsx
// 전체 구독 대신 lines만 감시
// shippingRequest 등 다른 값이 바뀌어도 CatalogPage 리렌더 없음
const lines = useCartStore((s) => s.lines);
```

## 이 레포에서는

| 파일 | 리렌더 원인 | 현재 영향 |
|------|-----------|----------|
| `CatalogPage.tsx` | `rowQtys` state 변경 → 인라인 행 전부 재실행 | 20~100개 행 |
| `CatalogPage.tsx` | `useCartStore()` 전체 구독 → cart 변경 시 추가 리렌더 | page 로드 시 draft hydration 타이밍에 1회 |

기본 20개에서는 체감하기 어렵다. `pageSize`를 100으로 키우거나 cart에 담긴 아이템이 많아질수록 차이가 난다.

## 더 볼 것

- 관련 노트: [`2026-06-02_zustand-selector.md`](./2026-06-02_zustand-selector.md)
- [React 공식 — Skipping re-rendering with memo](https://react.dev/reference/react/memo)
- [React 공식 — Choosing the state structure (colocation)](https://react.dev/learn/choosing-the-state-structure)
