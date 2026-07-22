# 장바구니·주문서 — 상태 3층·시행착오·동기화 개념

> 작성일: 2026-05-29 (블로그용 정리: 2026-06-11)  
> 맥락: SPA에서 카탈로그·주문서·재고 화면을 오가며 담기/수량을 편집할 때, **서버·전역·페이지 state**가 헷갈리는 문제를 정리한 글. B2B 주문 담기를 예로 들지만, 쇼핑몰 장바구니·초안 편집에도 그대로 대입할 수 있다.

## 이 글의 질문

- 담기·수량 편집에서 **서버 / 앱 전역 / 페이지 로컬**은 각각 무엇을 맡나?
- 카탈로그에서 주문서로 갈 때 **props나 URL로 안 넘겨도** 되는 이유는?
- **탐색형 담기**(카탈로그)와 **일괄 확정 담기**(재고)는 서버 draft와 **언제** 맞추나?
- 수량 `−`/`+`를 **클릭마다 서버에 맞추다** 숫자가 튀고 버튼이 잠겼다 — **왜 로컬 SSOT로 갔나?**
- SSOT, 낙관적 업데이트, debounce, race, flush는 **무엇을 뜻하고 언제 쓰나?**

## 핵심 (먼저 읽기)

| 구분 | 무엇을 저장하나 | 새로고침 후 | 대표 도구 |
|------|-----------------|-------------|-----------|
| **페이지 로컬** | 검색어·페이지 번호·모달 열림 | **대부분 사라짐** | `useState` |
| **앱 전역 + 디스크** | 담긴 품목·수량·메모 | **남음** (localStorage) | Zustand + `persist` |
| **서버** | 상품 목록·미제출 draft·제출된 주문 | **서버에 남음** (UI 규칙은 아래) | React Query 등 |

| 화면·동작 | 담기·편집 직후 서버 draft |
|-----------|---------------------------|
| **카탈로그 — 수량 조절** | **안 맞춤** — 전역 스토어(+localStorage)만 |
| **주문서 `−`/`+`** | **안 맞춤** — 스토어만 (제출 직전 flush) |
| **재고 — 일괄 담기** | **바로 맞춤** — draft API 후 스토어 갱신 |
| **주문 제출 직전** | **한 번에 맞춤** — 로컬 → 서버 sync 후 주문 API |

**한 줄 결론:** 편집 중에는 **클라이언트(전역 스토어 + persist)가 SSOT**, 서버 draft는 **경계(담기·제출·비우기)** 에서만 맞춘다.

## 목차

1. [주문 담기 상태 3층](#1-주문-담기-상태-3층)
2. [페이지 이동 시 값을 안 넘겨도 되는 이유](#2-페이지-이동-시-값을-안-넘겨도-되는-이유)
3. [카탈로그 vs 재고 — draft 맞추는 시점](#3-카탈로그-vs-재고--draft-맞추는-시점)
4. [주문서 수량 UX — 4단계 시행착오](#4-주문서-수량-ux--4단계-시행착오)
5. [관련 개념 (SSOT·Query·낙관적·debounce)](#5-관련-개념-ssotquery낙관적debounce)

---

## 1. 주문 담기 상태 3층

### 그림 — 상태가 쌓이는 3층

```
[서버]
  GET 상품 목록           ← 목록 표만 (읽기)
  GET/PATCH draft         ← 미제출 주문 줄 (DB)
  POST 주문 제출          ← 제출 후 draft 비움

        ↑ hydrate(로컬 비었을 때만)     ↑ 제출 직전 sync
        │                               │
[앱 전역 Zustand + localStorage]
  lines[], 메모 필드 …
  ← 카탈로그 수량 input, 주문서 편집이 여기를 읽고 씀

        ↑ useState (페이지만)
[페이지 로컬]
  검색어, page, 모달 open …
```

### 함정 한 가지

**착각:** “카탈로그 화면의 input을 바꿨으니 페이지 state다 → 새로고침하면 사라져야 한다.”  
**실제:** 그 input은 `useState`가 아니라 **전역 `cart.lines`에서 읽은 수량**을 `value={qty}`로 보여 준다(controlled input). 수량 변경은 `addLine` / `updateQuantity`로 **스토어**를 고친다. `persist` 때문에 **F5 후에도** localStorage에서 복원된다.

반대로 **검색어·카테고리·페이지**는 `useState`만 쓰므로 새로고침하면 **초기화되는 것이 정상**이다.

### 왜 이렇게인가

미제출 주문서는 카탈로그·재고·주문서 화면을 **오가며** 이어서 편집한다. 페이지마다 따로 state를 두면 “카탈로그에서 3개 담았는데 주문서는 0개”처럼 **어긋나기 쉽다**. 담긴 라인의 **단일 출처(SSOT)** 를 전역 스토어로 두고, 브라우저를 닫았다 열어도 이어 쓰게 **localStorage**에 백업한다.

서버 draft는 **다른 기기·탭**이나 **로컬이 비었을 때** 복구용 + **제출 직전** 최종 검증(단가·품절)용이다.

### 예시 코드

**전역 스토어 + persist** — 담긴 줄이 여기 저장된다.

```tsx
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      shippingMemoByWarehouse: {},
      addLine: (item) => { /* ... */ },
      updateQuantity: (productId, quantity) => { /* ... */ },
    }),
    { name: 'cart-draft' },
  ),
);
```

**카탈로그 수량 input은 스토어에서 읽음** — 페이지 전용 `useState`가 아님.

```tsx
function getRowQty(productId: string) {
  const inCart = cart.lines.find((l) => l.productId === productId);
  return inCart?.quantity ?? 0;
}

// JSX
<input value={getRowQty(item.id)} onChange={...} />
```

**로컬이 비었을 때만 서버 draft를 1회 가져옴** — 로컬 우선 hydration.

```tsx
useEffect(() => {
  if (cart.lines.length > 0) return; // 로컬 우선
  const { lines } = await fetchDraftLines();
  if (lines.length > 0) cart.replaceLinesFromServer(lines);
}, []);
```

---

## 2. 페이지 이동 시 값을 안 넘겨도 되는 이유

### 그림 — 카탈로그 → 주문서 (값을 “안 넘김”)

```
CatalogPage                    CartPage
   │                                │
   │  <Link to="/cart" />           │
   │  (props / query 없음)          │
   └──────────┬─────────────────────┘
              │
        useCartStore  ←── 같은 서랍
        (persist)
```

### 함정 한 가지

**착각:** “다른 페이지로 가면 state가 초기화된다.”  
**실제:** SPA에서 **컴포넌트 트리 일부만** 바뀌고, **모듈 최상위에 만든 Zustand 스토어**와 **localStorage**는 라우트와 무관하게 유지된다. 사라지는 것은 **그 페이지 컴포넌트의 `useState`** 뿐이다.

예전 패턴인 `location.state`로 장바구니 넘기기는 새로고침·딥링크에 약하다. 전역 store + persist면 **주문서 전용 URL**을 열어도 복구할 수 있다.

### 확인 시나리오

| 동작 | 기대 결과 |
|------|-----------|
| 카탈로그에서 수량 변경 → 「주문서 보기」 | 주문서에 동일 라인·수량 |
| 주문서에서 수량 변경 → 뒤로 카탈로그 | 테이블 input에 반영 |
| 주문서 URL에서 F5 | localStorage 복원 후 목록 표시 |

---

## 3. 카탈로그 vs 재고 — draft 맞추는 시점

### 함정 한 가지

**착각:** “담기 = 항상 서버 `POST draft`다.”  
**실제:** **탐색형 카탈로그**는 수량 스테퍼를 연속으로 돌리는 동안 서버를 치지 않고, **재고의 일괄 담기**만 확정 시점에 draft API를 호출하는 식으로 **시점을 나눌 수 있다**. (팀 정책에 따라 카탈로그 ‘담기 버튼’ 클릭 시에만 POST하는 변형도 있다. 핵심은 **연속 입력마다 PATCH하지 않는 것**이다.)

### 왜 시점이 다른가

카탈로그는 SKU 탐색·수량 조절이 **연속적**이라 매 키입력마다 서버와 맞추면 느리고, 실패 시 UX가 깨지기 쉽다. 재고의 “주문서에 담기”는 **선택한 부족 품목을 한 번에** 확정하는 액션이라, 서버 draft를 **즉시 정본에 가깝게** 두는 편이 안전하다. 어느 경로든 **주문 제출 직전**에 로컬·서버를 한 번 더 맞춘다.

### 예시 — 재고 일괄 담기 (서버 먼저)

```tsx
for (const item of selectedItems) {
  const body = existing
    ? await patchDraftLine(item.productId, existing.quantity + item.qty)
    : await postDraftLine({ productId: item.productId, quantity: item.qty });
  cart.syncLineFromDraft(body);
}
```

### 예시 — 제출 직전 flush

```tsx
async function syncDraftToServer(localLines: CartLine[]) {
  const serverLines = await fetchDraftLines();
  // 서버에만 있는 줄 삭제, 로컬 줄 PATCH(수량·단가·가용 반영)
  for (const line of localLines) {
    if (line.quantity <= 0) continue;
    const body = await patchDraftLine(line.productId, line.quantity);
    cart.syncLineFromDraft(body);
  }
}
```

| 진입 화면 | 담기·편집 직후 | 제출 시 |
|-----------|----------------|---------|
| 물품 카탈로그 (연속 수량) | 전역 스토어만 | sync → 주문 API → 스토어·draft 비움 |
| 주문서 `−`/`+` | 전역 스토어만 | 동일 |
| 재고 일괄 담기 | draft API + 스토어 | 동일 |
| 로컬 비어 있고 서버에만 draft | hydration 1회 | 동일 |

---

## 4. 주문서 수량 UX — 4단계 시행착오

주문서 `−`/`+` 스테퍼를 고치면서 겪은 변경 여정이다. §1~3의 “최종 구조”가 **왜** 이렇게 됐는지 설명한다.

```
① 클릭마다 서버 반영
   → ② 낙관적 업데이트 (UI 먼저 + onMutate)
      → ③ 0.4초 뒤 PATCH (debounce)
         → ④ 로컬만 편집, 제출 때 서버 sync  ← 권장
```

| 단계 | 의도 | 문제 |
|------|------|------|
| ① 서버 매번 | draft = DB니까 항상 sync | 연타 시 느림·깜빡임 |
| ② 낙관적 | `onMutate`로 UI 먼저 | mutation 겹침(race) → `isPending` 잠금 UX |
| ③ debounce | 멈춘 뒤 0.4초에 한 번 PATCH | SSOT 둘이면 응답이 늦게 와 숫자가 또 튐 |
| ④ 로컬 SSOT | 편집은 store만 | 멀티 탭·다른 PC 동시 편집은 MVP 비범위 |

**핵심:** “서버가 진실”인 건 **제출 직전(가격·가용·재고)** 이지, **스테퍼 한 번 한 번**이 아니다.

### 함정 (다음에 비슷한 화면 만들 때)

같은 데이터를 **로컬·서버·mutation 응답**이 동시에 고치면, 낙관적·debounce를 써도 숫자가 튈 수 있다. 먼저 **“편집 중 SSOT는 어디 하나?”** 를 정하고, 서버는 **언제 flush할지**만 정하자.

### ④ 권장 — 스테퍼는 store만, 제출 때 flush

```tsx
function handleQtyStep(productId: string, delta: number) {
  const line = cart.lines.find((l) => l.productId === productId);
  if (!line) return;
  const next = Math.max(0, line.quantity + delta);
  if (next === 0) {
    cart.removeLine(productId);
    return;
  }
  cart.updateQuantity(productId, next);
  // patchDraftLine 호출 없음
}
```

```tsx
async function handleConfirmSubmit() {
  const changes = await syncDraftToServer(cart.lines);
  if (changes.priceChanged) {
    showPriceConfirmModal(changes);
    return;
  }
  await submitOrder();
  cart.clearCart();
  await clearAllDraftLines();
}
```

### ②③ 지나온 패턴 (대비용 · 피하는 이유)

```tsx
// ② 낙관적 — 연타 시 race, isPending 잠금
onMutate: ({ productId, quantity }) => {
  cart.updateQuantity(productId, quantity);
  return { prevLine };
},

// ③ debounce — SSOT 둘이면 응답 덮어쓰기로 또 튐
scheduleQtyCommitDebounce(productId);  // 400ms → patchDraftLine
```

---

## 5. 관련 개념 (SSOT·Query·낙관적·debounce)

§4 시행착오에서 쓰인 용어를 **장바구니·주문서 맥락**으로 짧게 정리한다.

### SSOT (Single Source of Truth)

같은 수량을 로컬·서버·API 응답이 동시에 고치면 화면이 “누구 말이 맞지?” 상태가 된다. **편집 중에는 하나만 진실**로 정한다.

| SSOT | 장바구니 수량에서 |
|------|-------------------|
| 서버만 | ① 단계 — 스테퍼에 과함 |
| **로컬 (권장)** | `−`/`+`는 스토어, 제출 때 flush |
| 둘 다 실시간 | ②③ — 숫자 튐 |

**함정:** “draft가 DB에 있으니 서버가 항상 SSOT”는 **제출·가격 검증**에는 맞고, **스테퍼 연타**에는 맞지 않을 수 있다.

### 서버 state vs 클라이언트 state

| | 서버 state | 클라이언트 state |
|---|------------|------------------|
| **어디** | DB, draft 테이블 | Zustand `lines`, localStorage |
| **도구** | TanStack Query + fetch | Zustand `persist` |
| **비유** | 공식 장부 | 메모장 — 제출할 때 장부에 옮김 |

### TanStack Query — cache vs mutation

- **cache:** `GET` 결과를 `queryKey`로 보관 — 상품 목록 등 **조회**
- **mutation:** `POST`/`PATCH` — **쓰기**. `onMutate`로 낙관적 UI 가능
- **invalidateQueries:** “다시 GET해서 맞추자” — 목록 갱신
- **④ 주문서 편집:** 스테퍼 구간은 mutation 없이 **로컬만**

### 낙관적 업데이트 · debounce · race

| 개념 | 한 줄 | 주문서에서 |
|------|-------|------------|
| **낙관적** | UI 먼저, 실패 시 rollback | ② — 연타 race, 잠금 UX |
| **debounce** | 입력 멈춘 뒤 한 번만 서버 | ③ — API는 줄지만 SSOT 둘이면 튐 |
| **race** | 요청 B가 A보다 먼저 도착해 화면이 뒤집힘 | ②③ 공통 원인 |

### Hydration · Flush

- **Hydration:** 앱·페이지 진입 시 서버 draft를 스토어에 채움. **로컬에 줄이 있으면 GET 스킵** (로컬 우선)
- **Flush:** 편집은 메모장에만 쓰다가 **제출** 때 장부에 옮김 (`syncDraftToServer`)

### 패턴 선택 치트시트

| UX 목표 | 추천 |
|---------|------|
| 스테퍼 즉시 반응 | 클라이언트 SSOT |
| 제출 전 가격·재고 맞춤 | 제출 시 flush |
| 다른 PC에서 이어쓰기 | 진입 서버 우선 + 편집마다 sync |
| 좋아요 한 번 | 낙관적 OK |
| 검색어 입력 | debounce OK |

### 면접 한 줄

“장바구니 수량은 편집 중 클라이언트 SSOT로 즉시 UX를 주고, 주문 제출 직전에만 서버와 맞춰 정합성·가격 검증을 한다. 클릭마다 PATCH는 race와 잠금 UX 때문에 피했다.”

---

## 더 볼 것

- [TanStack Query — Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
