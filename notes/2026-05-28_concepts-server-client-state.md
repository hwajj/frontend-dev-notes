# 관련 개념 — 서버 state · 클라이언트 state · 동기화

> 작성일: 2026-05-28  
> 맥락: [주문서 수량 UX 시행착오](./2026-05-28_react-query-optimistic-update.md)를 읽기 전·후에 붙여 두는 **개념 사전**

---

## 한 줄 요약

**화면 숫자는 “누가 진실(SSOT)이냐”가 먼저고, 서버 API는 “언제 맞출지”가 나중이다.**

---

## 이 파일 쓰는 법

| 읽는 순서 | 추천 |
|-----------|------|
| 처음 | 아래 **개념 지도** → **SSOT** → **서버 vs 클라이언트 state** |
| 주문서 글과 함께 | [시행착오 4단계](./2026-05-28_react-query-optimistic-update.md)에서 ①~④ 읽을 때 해당 개념 링크로 점프 |
| 면접 전 | 각 항목 **면접 한 줄**만 훑기 |

---

## 개념 지도 (선행 → 심화)

```
[HTTP / API] ──► 서버 state (DB, draft)
       │
       ▼
[TanStack Query] ── cache · mutation · onMutate(낙관적)
       │
       ├─► invalidate / refetch
       │
[Zustand + persist] ──► 클라이언트 state (장바구니 UI)
       │
       ├─ SSOT (진실은 한 곳)
       ├─ debounce (나중에 한 번 보내기)
       ├─ race (요청 순서 꼬임)
       └─ flush (제출·이탈 때 서버에 맞추기)
```

---

## SSOT (Single Source of Truth, “진실은 한 곳”)

**쉬운 말:** 같은 수량을 **로컬·서버·API 응답**이 동시에 고치면, 화면은 “누구 말이 맞지?” 상태가 된다. **편집 중에는 하나만 진실**로 정한다.

| SSOT | 주문서에서 |
|------|------------|
| 서버만 | 클릭마다 PATCH → 느림 |
| 로컬만 (지금) | `−`/`+`는 Zustand, 제출 때 `syncDraftToServer` |
| 둘 다 실시간 | ②③ 단계에서 숫자 튐 |

**함정:** “draft가 DB에 있으니 서버가 항상 SSOT”는 **제출·가격 검증**에는 맞고, **스테퍼 연타**에는 맞지 않을 수 있다.

**이후 확장:** CRDT, Operational Transform, 멀티 탭 `BroadcastChannel` sync

---

## 서버 state vs 클라이언트 state

| | 서버 state | 클라이언트 state |
|---|------------|------------------|
| **어디** | DB, `nh_order_draft_lines` | Zustand `lines`, `localStorage` |
| **누가 믿나** | 다른 기기·제출·정산 | 지금 이 화면·즉시 UX |
| **이 레포 도구** | TanStack Query + axios | Zustand `persist` |

**쉬운 말:** 서버는 **공식 장부**, 클라이언트는 **메모장**. 메모장으로 쓰다가 제출할 때 장부에 옮긴다.

```tsx
// 서버 — 제출 직전 flush
await patchDraftLine(productId, quantity);

// 클라이언트 — 스테퍼
cart.updateQuantity(productId, next);
```

**이후 확장:** React Query `placeholderData`, Suspense, 서버 컴포넌트(RSC)에서의 경계

---

## TanStack Query — cache와 mutation

**cache:** `GET` 결과를 키(`queryKey`)로 들고 있다. 목록·상세 **조회**에 맞음.

**mutation:** `POST`/`PATCH`/`DELETE` 같은 **쓰기**. `useMutation({ mutationFn, onSuccess, onMutate })`.

| 패턴 | 언제 | 주문서 |
|------|------|--------|
| `invalidateQueries` | “다시 GET해서 맞추자” | 주문 취소·목록 갱신 |
| `onMutate` + rollback | “UI 먼저, 실패 시 되돌림” | ② 단계 (제거됨) |
| mutation 없이 로컬만 | 편집 UX | ④ 스테퍼 |

**이후 확장:** `queryOptions` 팩토리, `mutationKey`, `queryClient.setQueryData`

---

## 낙관적 업데이트 (Optimistic Update)

**쉬운 말:** “일단 화면부터 바꾸고, 서버에 물어보자. 틀리면 되돌린다.”

```tsx
onMutate: ({ productId, quantity }) => {
  cart.updateQuantity(productId, quantity);  // UI 먼저
  return { prevLine };                       // rollback용 기억
},
onError: (_e, _v, ctx) => {
  if (ctx?.prevLine) cart.addLine(ctx.prevLine);
},
```

**왜 ②에서 아쉬웠나:** 연타 → mutation 여러 개 → **race**. 잠금(`isPending`)으로 막으면 UX 나쁨.

**잘 맞는 곳:** 좋아요 토글, 단발 액션, **요청이 겹치지 않을 때**.

**이후 확장:** TanStack Query v5 `useMutation` + `onSettled`, Idempotency-Key

---

## Debounce (디바운스)

**쉬운 말:** “입력 멈춘 뒤 0.4초 지나면 **한 번만** 서버에 보낸다.”

```tsx
// 개념만 — 예전 ③ 단계
setTimeout(() => commitQtyToDraft(productId), 400);
```

**장점:** API 횟수 감소, 연타 중에는 네트워크 없음.

**한계:** SSOT가 여전히 둘이면 **응답이 늦게 와서 숫자가 한 번 더 움직일** 수 있음. 스테퍼만 쓰면 blur가 없어서 “언제 보낼지” 애매할 수도 있음.

**이후 확장:** throttle, `useDeferredValue`, 검색창 패턴

---

## Zustand + persist (localStorage)

**쉬운 말:** 새로고침해도 장바구니가 `localStorage`의 `nh-cart`에 남는다.

```tsx
// cart-store.ts
export const useCartStore = create<CartState>()(
  persist(/* state */, { name: 'nh-cart' }),
);
```

**주문서:** 편집 SSOT = store. 서버 draft는 담기·제출·비울 때만.

**함정:** 진입 시 `GET`이 persist를 **덮어쓰면** 방금 고른 수량이 사라짐 → [로컬 우선 hydration](../src/hooks/use-nh-draft-hydration.ts).

**이후 확장:** `partialize`, 버전 마이그레이션, `sessionStorage` vs `localStorage`

---

## Race condition (요청 순서 꼬임)

**쉬운 말:** `+` 누르고(요청 A: 수량 3) 또 `+`(요청 B: 수량 4)인데, **B가 먼저 도착하고 A가 나중에 오면** 화면이 3으로 돌아간다.

**연관:** 낙관적 + 클릭마다 PATCH, debounce 없이 연타 PATCH.

**대응 요약:**

| 방법 | 트레이드오프 |
|------|----------------|
| pending 동안 UI 잠금 | 느리면 버튼 안 눌림 |
| 요청 취소 / 마지막만 적용 | 구현 복잡 |
| **편집은 로컬만, flush 한 번** | 멀티 탭 약함 (MVP OK) |

**이후 확장:** AbortController, mutation queue, `latest-wins` reducer

---

## Hydration (진입 시 서버 → 클라이언트 채우기)

**쉬운 말:** 주문서 페이지 들어올 때 “서버 장바구니를 가져올까, 메모장을 쓸까?”

```tsx
// 로컬에 이미 있으면 GET 안 함
if (useCartStore.getState().lines.length > 0) return;
const { lines } = await getDraftLines();
```

| 정책 | 언제 |
|------|------|
| 로컬 우선 (지금) | 같은 PC, persist 신뢰 |
| 서버 우선 | 다른 기기 이어하기 |

**이후 확장:** SSR hydration mismatch, `rehydrate` 타이밍

---

## Flush (경계에서 서버에 맞추기)

**쉬운 말:** 편집은 메모장에만 쓰다가, **제출 버튼** 누를 때 장부에 옮긴다.

이 레포: `syncDraftToServer` — 서버에만 있는 라인 DELETE, 로컬 라인 PATCH(수량·단가·가용).

**다른 flush 시점 예:** 페이지 이탈, `beforeunload`, 주기적 autosave (이 프로젝트는 제출·비우기·담기).

**이후 확장:** Optimistic 없이 “draft save” API 한 번, 오프라인 큐

---

## 패턴 선택 치트시트 (장바구니 수량)

| UX 목표 | 추천 |
|---------|------|
| 스테퍼 즉시 반응 | 클라이언트 SSOT |
| 제출 전 가격·재고 맞춤 | 제출 시 flush |
| 다른 PC에서 이어쓰기 | 진입 서버 우선 + 편집마다 sync |
| 좋아요 한 번 | 낙관적 OK |
| 검색어 입력 | debounce OK |

---

## 용어 ↔ 주문서 4단계 대응

| 단계 | 쓰인 개념 |
|------|-----------|
| ① 클릭마다 서버 | 서버 SSOT, mutation 매번 |
| ② 낙관적 | `onMutate`, race, `isPending` 잠금 |
| ③ debounce | debounce, SSOT 둘, 응답 덮어쓰기 |
| ④ 로컬 | Zustand persist, flush, 로컬 우선 hydration |

---

## 더 볼 것

- [주문서 수량 UX — 시행착오 본편](./2026-05-28_react-query-optimistic-update.md)
- [TanStack Query — Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- 팀 규칙: [tanstack-query.mdc](../.cursor/rules/tanstack-query.mdc)

---

## 이후 확장 학습 (로드맵)

1. **기초:** HTTP 메서드, idempotent, REST vs RPC  
2. **React Query:** staleTime, gcTime, `enabled`, prefetch  
3. **상태 설계:** “서버 state / UI state / URL state” 3분할  
4. **심화:** 멀티 탭 sync, conflict resolution, 오프라인 first
