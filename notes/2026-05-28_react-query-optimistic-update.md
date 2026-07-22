# 주문서 수량 UX — 바꿀 때마다 서버? 낙관적? debounce? 로컬?

> 작성일: 2026-05-28  
> 맥락: `CartOrderPage` 수량 `−`/`+`를 고치면서 겪은 4단계 시행착오와 최종 정리

**관련 개념 사전:** [서버·클라이언트 state · SSOT · 낙관적 · debounce](./2026-05-28_concepts-server-client-state.md) — 용어·선행 개념은 여기서 먼저 보면 된다.

---

## 한 줄 요약

**“클릭할 때마다 서버에 맞추려다” 숫자가 튀고 버튼이 잠겼다 → 결국 편집은 로컬(Zustand+persist), 서버는 제출·담기·비울 때만 맞춘다.**

---

## 변경 여정 (4단계)

쇼핑몰 장바구니에 비유하면 이해가 빠르다.

```
① 클릭마다 서버 반영
   → ② 낙관적 업데이트 (UI 먼저 + onMutate)
      → ③ 0.4초 뒤 PATCH (debounce)
         → ④ 로컬만 편집, 제출 때 서버 sync  ← 지금
```

### ① 바꿀 때마다 서버 반영 (PATCH/DELETE)

**의도:** draft가 서버 DB에 있으니, 수량 바꿀 때마다 `patchDraftLine`으로 “진짜 값”을 맞추자.

**체감:** `−` 누르면 네트워크 끝날 때까지 숫자가 안 바뀌거나, 응답 오면 깜빡임.

**왜 아쉬웠나:** stepper는 **연타**가 기본인데, 매번 왕복 API는 “느린 계산기” 같다.

---

### ② 낙관적 업데이트 (`onMutate`)

**의도:** 서버 기다리지 말고 Zustand를 먼저 바꾸고, 실패하면 rollback. TanStack Query 교과서 패턴.

**개선된 점:** 클릭 직후 숫자는 **즉시** 바뀜.

**새 문제:**

- `−` **연타** → mutation이 겹침 → 화면 수량과 “마지막 요청”이 어긋남 (늘었다 줄었다).
- 대응으로 `isPending` 동안 스테퍼 **잠금** → 네트워크 조금만 느려도 “버튼이 안 눌림”.
- `onSuccess`에서 `syncLineFromDraft`로 **또 덮어씀** → 로컬이 한 번 더 튀는 느낌.

**배운 것:** 낙관적은 “클릭마다 서버가 꼭 맞아야 할 때”엔 race·잠금 비용이 든다.

---

### ③ debounce 0.4초 뒤 PATCH

**의도:** 연타는 로컬만 반영하고, 멈춘 뒤 0.4초 후에 서버에 **한 번만** 보내자. 스테퍼 잠금은 풀자.

**개선된 점:** 연타 중에는 API가 안 나가서 잠금 UX는 사라짐.

**남은 문제:**

- blur 직후와 0.4초 PATCH 응답이 **겹치면** 숫자가 한 번 더 움직임 (“싱크가 살짝 안 맞음”).
- 여전히 **편집 중에 서버·로컬·응답 body** 세 군데가 싸움.
- 진입 시 `GET` + mount 시 `syncDraftLines`까지 있으면 persist와 **덮어쓰기** 충돌.

**배운 것:** debounce는 “API 횟수”만 줄일 뿘, **SSOT가 둘**이면 튐은 남는다.

---

### ④ 로컬 저장소 활용 (Zustand + persist) — **현재**

**의도:** 주문서 **편집 구간**에서는 화면이 읽는 곳을 **하나**로. 서버 draft는 “저장소”가 아니라 **경계에서만** 맞춤.

| 구간 | 누가 진실(SSOT) | 서버 |
|------|-----------------|------|
| `−`/`+`/입력/삭제 | Zustand (+ `localStorage`) | 호출 없음 |
| 카탈로그 담기 | 서버 라인 생성 후 store 반영 | `POST` |
| 주문서 진입 | 로컬에 있으면 로컬 | 비었을 때만 `GET` |
| 제출 확인 | 로컬 → 서버에 flush | `syncDraftToServer` |
| 비우기 | 둘 다 비움 | `DELETE` 전체 |

**어떻게 좋아졌나:**

- stepper **항상 즉시**, 잠금·0.4초 대기·응답 덮어쓰기 **없음**.
- 숫자 들쭉날쭉의 주원인(이중·삼중 sync) 제거.
- 새로고침·다시 들어와도 persist로 **방금 고른 수량** 유지 (로컬 우선 hydration).

**트레이드오프:** 다른 PC/탭에서 같은 draft를 동시에 편집하는 건 MVP 비범위. 그때는 “진입 시 서버 우선”이나 “이탈 시 flush”를 다시 설계.

---

## 왜 이 순서로 거쳤는지 (한 문장씩)

| 단계 | 당시 생각 | 실제로 맞았던 것 |
|------|-----------|------------------|
| ① 서버 매번 | draft = DB니까 항상 sync | 편집 UX에는 과함 |
| ② 낙관적 | 즉시 UX + 공식 패턴 | 연타·이중 sync에 약함 |
| ③ debounce | API 줄이면서 즉시 UX | SSOT 둘이면 여전히 튐 |
| ④ 로컬 SSOT | 장바구니는 보통 이렇게 | 이 프로젝트 MVP에 맞음 |

**핵심:** “서버가 진실”인 건 **제출 직전(가격·가용·재고)** 이지, **스테퍼 한 번 한 번**이 아니다.

---

## 함정 한 가지 (다음에 비슷한 화면 만들 때)

**같은 데이터를 로컬·서버·mutation 응답이 동시에 고치면**, 어떤 패턴(낙관적·debounce)을 써도 숫자가 튈 수 있다.  
먼저 **“편집 중 SSOT는 어디 하나?”** 를 정하고, 서버는 **언제 flush할지**만 정하자.

---

## 참고 코드

> 전체 파일은 링크로. 아래는 **읽기용 핵심만** (2026-05-28 기준).

### ④ 최종 — 스테퍼는 store만 (API 없음)

`−`/`+` 눌러도 `patchDraftLine` 안 탐. 화면은 `cart.lines`만 본다.

```tsx
// CartOrderPage.tsx — 편집 핸들러
function handleQtyStep(productId: string, delta: number) {
  const line = useCartStore.getState().lines.find((l) => l.productId === productId);
  if (!line) return;
  const next = Math.max(0, line.quantity + delta);
  if (next === 0) {
    cart.removeLine(productId);
    return;
  }
  cart.updateQuantity(productId, next);
}

function handleDelete(productId: string) {
  cart.removeLine(productId);  // 서버 DELETE는 제출 sync 때
}
```

```tsx
// JSX — disabled={isPending} 같은 잠금 없음
onClick={() => handleQtyStep(line.productId, -1)}
onClick={() => handleQtyStep(line.productId, 1)}
```

---

### ④ 최종 — 제출 확인 때만 서버에 맞춤

사용자가 모달에서 “주문 제출” 확정 → `syncDraftToServer` → 단가 변동 있으면 모달 → `submitOrder`.

```tsx
async function handleConfirm() {
  setIsModalOpen(false);
  setIsSyncingDraft(true);
  try {
    const changes = await syncDraftToServer(useCartStore.getState().lines);
    // ... out 라인·단가 변동 검사 후 submitOrder()
  } finally {
    setIsSyncingDraft(false);
  }
}
```

```tsx
// flush: 서버에만 있는 라인 삭제 → 로컬 라인 PATCH(수량·단가·가용)
async function syncDraftToServer(localLines: CartLine[]) {
  const { lines: serverLines } = await getDraftLines();
  for (const serverLine of serverLines) {
    const local = localLines.find((l) => l.productId === serverLine.productId);
    if (!local || local.quantity <= 0) {
      await deleteDraftLine(serverLine.productId);
    }
  }
  for (const line of localLines) {
    if (line.quantity <= 0) continue;
    const body = await patchDraftLine(line.productId, line.quantity);
    useCartStore.getState().syncLineFromDraft(body);
  }
}
```

---

### ④ 최종 — 로컬 우선 hydration

주문서에 **이미 담긴 게 있으면** `GET`으로 덮어쓰지 않음 (persist 유지).

```tsx
// use-nh-draft-hydration.ts
if (useCartStore.getState().lines.length > 0) {
  return;  // 로컬 우선
}
const { lines } = await getDraftLines();
// lines 있을 때만 replaceLinesFromServer
```

---

### ④ 최종 — persist 키

```tsx
// cart-store.ts
persist(/* ... */, { name: 'nh-cart' })
```

브라우저 `localStorage`의 `nh-cart`에 수량·배송 메모가 남는다.

---

### ②③ 지나온 패턴 (대비용 · 지금은 제거됨)

**② 낙관적** — 클릭마다 UI 먼저 + API. 연타 시 race.

```tsx
// 예전 패턴 (요약)
const patchDraftMutation = useMutation({
  mutationFn: ({ productId, quantity }) => patchDraftLine(productId, quantity),
  onMutate: ({ productId, quantity }) => {
    cart.updateQuantity(productId, quantity);
    return { prevLine };
  },
  onSuccess: (body) => applyDraftPatchToCart(body),
  onError: (_e, _v, ctx) => { if (ctx?.prevLine) cart.addLine(ctx.prevLine); },
});
// + draftLineSyncBusy → 스테퍼 disabled
```

**③ debounce** — 스테퍼 후 400ms 뒤 `commitQtyToDraft`. blur도 PATCH.

```tsx
// 예전 패턴 (요약)
function handleQtyStep(productId, delta) {
  cart.updateQuantity(/* ... */);
  scheduleQtyCommitDebounce(productId);  // setTimeout 400ms → patchDraftLine
}
```

---

## 프로젝트에 대입

| 파일 | 볼 것 |
|------|--------|
| [CartOrderPage.tsx](../src/routes/nursing-hospital/supplies/CartOrderPage.tsx) | `handleQtyStep`, `syncDraftToServer`, `handleConfirm` |
| [CatalogPage.tsx](../src/routes/nursing-hospital/supplies/CatalogPage.tsx) | `handleAddToggle` — 담기/해제는 Zustand만, `supplyCenters`로 `warehouseId` |
| [use-nh-draft-hydration.ts](../src/hooks/use-nh-draft-hydration.ts) | 로컬 `lines` 있으면 GET 스킵 |
| [cart-store.ts](../src/stores/cart-store.ts) | `persist` → `nh-cart` |
| [cart-order.md](../docs/nursing-hospital/supplies/cart-order.md) | 기획 계약 |
| [개념 사전](./2026-05-28_concepts-server-client-state.md) | SSOT, race, debounce, flush 등 |

---

## 면접 한 줄 (선택)

“장바구니 수량은 클라이언트 SSOT로 즉시 UX를 주고, 주문 제출 직전에만 서버와 맞춰 정합성·가격 검증을 한다 — 클릭마다 PATCH는 race와 잠금 UX 때문에 피했다.”
