# 카탈로그 UI state vs 주문서 draft — "담기 전"과 "담은 후"의 상태 경계

> 작성일: 2026-06-02
> 맥락: 요양원 물품 카탈로그의 +/- 버튼이 서버를 호출하는지 의심받았다. 코드를 열어보니 설계는 맞았다: +/- = 로컬 state, 담기 버튼 = 서버 draft API. 이 경계를 왜 그렇게 그었는지, 그리고 상태가 어떻게 흘러가는지를 정리한다.

## 이 글의 질문

- 카탈로그에서 수량을 바꿀 때 서버를 호출해야 하나, 로컬만으로 충분한가?
- "담기 전 수량"과 "담은 후 수량"은 각각 어디에 저장되는가?
- React의 로컬 state와 Zustand + persist, 서버 draft API는 각각 무슨 역할을 담당하는가?

## 핵심 (먼저 읽기)

| 동작 | 상태 위치 | 서버 호출 | 이유 |
|------|----------|----------|------|
| 카탈로그 +/- (담기 전) | React `useState` (`rowQtys`) | **없음** | 확정 전 탐색값. 매 클릭마다 서버를 치면 느리고 불필요한 데이터가 쌓임 |
| 담기 버튼 클릭 | Zustand cart + draft API | **있음** | "주문서에 올리겠다"는 확정 → 서버 SSOT에 기록 |
| 주문서 +/- (담은 후) | Zustand cart + draft API | **있음** (optimistic) | 이미 확정된 라인의 수량 수정 → 서버 반영 필수 |
| 페이지 로드 시 복원 | localStorage (Zustand persist) → draft API | **있음** (1회) | 서버 SSOT → 클라이언트 동기화 |

"담기 버튼"이 경계다. 누르기 전은 임시값, 누른 후는 서버가 아는 확정값.

## 전제 (30초)

- **React `useState`**: 컴포넌트 안에서만 사는 임시 상태. 페이지를 이동하면 사라진다.
- **Zustand store + persist**: 전역 상태 + localStorage 저장. 새로고침해도 살아 있음.
- **draft API (서버)**: 서버에 저장된 "임시 주문서". 어떤 기기에서 접속해도 같은 내용.
- **SSOT (Single Source of Truth)**: "이 데이터의 최종 정답은 여기" — 여기서는 draft API가 SSOT.
- **optimistic update**: 서버 응답을 기다리지 않고 UI를 먼저 바꾸는 패턴. 실패하면 롤백.

## 한눈에

```
[담기 전: rowQtys — 로컬만]

사용자: + 클릭
  → handleQtyChange()
  → setRowQtys({ [itemA.id]: 5 })    ← React state만 바뀜
  → 서버·Zustand 변화 없음


[담기 버튼 클릭 — 경계]

사용자: 🛒 클릭
  → handleAddToggle()
  → postDraftLine({ productId, quantity })   ── 서버 draft API (POST)
           ↓ onSuccess
       cart.addLine(...)                      ── Zustand store 갱신
           ↓                                    ── localStorage persist
       rowQtys에서 해당 항목 삭제


[주문서: 담은 후 수량 변경 — 서버 + optimistic]

사용자: + 클릭
  → commitQtyToDraft(productId, newQty)
  → onMutate: cart.updateQuantity(productId, newQty)   ← 즉시 UI 반영 (optimistic)
  → patchDraftLine(productId, newQty)                  ── 서버 draft API (PATCH)
           ↓ onSuccess
       cart에 서버 응답값 반영 (최종 동기화)
```

## 용어

| 용어 | 뜻 |
|------|-----|
| `rowQtys` | `CatalogPage`의 로컬 state. `{ [productId]: number }`. 담기 전 임시 수량. |
| `cart.lines` | Zustand cartStore의 담긴 품목 배열. localStorage에 persist됨. |
| draft API | 서버에서 관리하는 임시 주문서 (`/nursing-hospital/draft/lines`). 페이지 이동·기기 변경 후에도 유지. |
| optimistic update | 서버 응답 전에 UI를 먼저 바꾸는 패턴. 실패 시 `onError`에서 이전 값으로 롤백. |
| SSOT | Single Source of Truth. "이 데이터의 유일한 정답 원본". 여기서는 draft API. |

---

## 한 줄 요약

담기 버튼이 "임시 탐색값"과 "서버에 기록된 확정값"의 경계다. 그 전은 로컬 state, 그 후는 서버 SSOT.

## 함정 한 가지

"어차피 나중에 서버에 올라가니까 +/-도 서버를 호출해야 안전하지 않나?"라고 생각하기 쉽다. 하지만 담기 전 수량은 아직 사용자가 탐색하는 단계다. 매 클릭마다 서버를 호출하면 응답 지연이 UI에 직결되고, 사용자가 마음을 바꿀 때마다 의미 없는 API 요청이 쌓인다. 확정 시점(담기 버튼)에만 서버를 호출하면 UX도 빠르고 서버 부하도 줄어든다.

## 왜 이렇게인가

이 패턴의 핵심은 **"사용자가 확정했는가"로 경계를 긋는 것**이다.

카탈로그에서의 수량 변경은 탐색 단계다. 50을 눌렀다가 30으로 바꾸고, 다시 카테고리를 바꾸다가 아예 담지 않을 수도 있다. 이 과정을 매번 서버에 기록하면 draft 테이블이 의미 없는 데이터로 채워진다. 로컬 state(`rowQtys`)로 관리하면 컴포넌트가 언마운트되거나 새로 고침하면 그냥 사라진다 — 의도된 동작이다.

담기 버튼을 누른 순간은 "이 품목을 주문서에 올리겠다"는 확정이다. 서버에 기록해야 페이지를 이동하거나 탭을 닫아도 주문서가 유지된다.

주문서에서의 수량 변경은 이미 확정된 라인을 수정하는 것이므로, 매 클릭마다 서버에 반영한다. Optimistic update로 UI는 즉시 바꾸고, 서버 응답으로 정확한 값을 덮어쓴다.

**대안**: 카탈로그 +/-도 debounce를 걸어 서버에 저장하는 방식도 있다. 하지만 "아직 확정되지 않은 탐색값을 서버에 저장할 이유가 없다"는 설계 판단으로 로컬을 선택했다.

## 참고 코드

**담기 전: rowQtys만 바꿈 — 서버 호출 없음 (CatalogPage.tsx)**

```tsx
// src/routes/nursing-hospital/supplies/CatalogPage.tsx
// 서버 호출 없음. rowQtys는 이 컴포넌트 안에서만 사는 임시값.
const handleQtyChange = (item: CatalogProduct, delta: number) => {
  const inCartLine = cart.lines.find((l) => l.productId === item.id);
  if (inCartLine) return; // 이미 담겼으면 stepper 비활성
  const next = Math.max(0, getRowQtyValue(item) + delta);
  setRowQtys((prev) => ({ ...prev, [item.id]: next }));
};
```

**담기 버튼: 서버 draft API 호출 후 Zustand 갱신 (CatalogPage.tsx)**

```tsx
// postDraftLine → 서버 draft에 추가 → onSuccess에서 cart.addLine
const handleAddToggle = (item: CatalogProduct) => {
  const qty = Math.max(1, getRowQtyValue(item));
  addDraftMutation.mutate({ productId: item.id, quantity: qty });
};

const addDraftMutation = useMutation({
  mutationFn: postDraftLine,
  onSuccess: (body) => {
    cart.addLine({ productId: body.productId, quantity: body.quantity, /* ... */ });
    setRowQtys((prev) => { const next = { ...prev }; delete next[body.productId]; return next; });
  },
});
```

**주문서: 서버 호출 + optimistic update (CartOrderPage.tsx)**

```tsx
// onMutate에서 cart.updateQuantity 먼저 (optimistic) → patchDraftLine은 서버
function commitQtyToDraft(productId: string, next: number) {
  patchDraftMutation.mutate({ productId, quantity: Math.max(0, next) });
}

const patchDraftMutation = useMutation({
  mutationFn: ({ productId, quantity }) => patchDraftLine(productId, quantity),
  onMutate: ({ productId, quantity }) => {
    const prevLine = cart.lines.find((l) => l.productId === productId);
    cart.updateQuantity(productId, quantity); // 즉시 UI 반영
    return { prevLine };
  },
  onError: (_err, _vars, ctx) => {
    if (ctx?.prevLine) cart.updateQuantity(ctx.prevLine.productId, ctx.prevLine.quantity); // 롤백
  },
});
```

## 이 레포에서는

| 파일 | 역할 | 상태 위치 |
|------|------|---------|
| `CatalogPage.tsx` | +/- → `rowQtys` (로컬), 담기 → draft API | React state + 서버 |
| `CartOrderPage.tsx` | +/- → draft API + optimistic | 서버 + Zustand |
| `cart-store.ts` | 담긴 품목 전역 관리 | Zustand + localStorage persist |
| `nh-draft.ts` | 서버 draft CRUD API | 서버 (SSOT) |

## 더 볼 것

- 관련 노트: [`2026-06-02_zustand-selector.md`](./2026-06-02_zustand-selector.md) — 전체 구독으로 인한 리렌더 문제
- 관련 노트: [`2026-06-02_table-rerender-perf.md`](./2026-06-02_table-rerender-perf.md) — 카탈로그 리렌더 비용
