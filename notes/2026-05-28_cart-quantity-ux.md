아래처럼 **개념 설명은 빼고, 실제 주문서에서 겪은 시행착오와 설계 결정 중심**으로 정리하면 된다.

# 주문서 수량 UX — 바꿀 때마다 서버? 낙관적? debounce? 로컬?

> 작성일: 2026-05-28
> 맥락: `CartOrderPage`의 수량 `−`/`+`를 구현하면서 겪은 4단계 시행착오와 최종 설계

**관련 개념:** [서버 state · 클라이언트 state · 동기화](./2026-05-28_server-state-client-state-sync.md)

---

## 한 줄 요약

**클릭마다 서버에 맞추려다 숫자가 튀고 버튼이 잠겼다 → 편집은 로컬에서 처리하고, 서버는 필요한 시점에만 동기화하는 구조로 변경했다.**

---

## 변경 여정

```text
① 클릭마다 서버 반영
   ↓
② Optimistic Update
   ↓
③ 0.4초 debounce
   ↓
④ 로컬에서 편집 + 제출 시 서버 동기화 ← 최종
```

---

## ① 클릭할 때마다 서버 반영

### 의도

서버에 draft가 있으므로 수량을 변경할 때마다 `PATCH`해서 서버의 값을 항상 최신으로 유지하려 했다.

```text
− 클릭
 ↓
PATCH
 ↓
응답
 ↓
화면 반영
```

### 문제

Stepper는 연속 클릭이 자연스러운 UI인데, 클릭마다 네트워크 요청을 기다리게 된다.

- 숫자 반영이 느림
- 네트워크 상태에 따라 UX가 달라짐
- 연속 클릭 시 요청이 여러 개 발생

**결론:** 서버의 정합성을 너무 자주 맞추려고 하면서 UI가 느려졌다.

---

## ② Optimistic Update

### 변경

서버 응답을 기다리지 않고 UI를 먼저 변경했다.

```text
클릭
 ↓
UI 즉시 변경
 ↓
PATCH
 ↓
성공 → 유지
실패 → rollback
```

### 좋아진 점

클릭 직후 숫자가 바로 변경되어 UX는 개선됐다.

### 새로운 문제

수량을 연속으로 변경하면 mutation이 여러 개 겹친다.

```text
− 클릭 → 요청 A
− 클릭 → 요청 B

B 응답
 ↓
A 응답
```

응답을 그대로 화면에 반영하는 과정에서 최신 로컬 값이 이전 응답에 의해 덮어써질 수 있었다.

이에 `isPending` 동안 스테퍼를 잠그는 방법도 사용했지만:

> 네트워크가 느리면 사용자는 버튼을 눌렀는데 아무 반응이 없는 것처럼 느낀다.

또한 성공 응답으로 로컬 값을 다시 동기화하면서 화면 값이 한 번 더 바뀌는 문제도 있었다.

### 결론

**Optimistic Update가 나쁜 것이 아니라, 이 주문서의 연속적인 수량 편집과는 구현 복잡도가 커졌다.**

---

## ③ Debounce — 0.4초 뒤 PATCH

### 변경

연속 클릭은 로컬에 즉시 반영하고, 입력이 끝난 뒤 0.4초 후 서버에 요청했다.

```text
+ + + + +
    ↓
입력 멈춤
    ↓
0.4초
    ↓
PATCH 1회
```

### 좋아진 점

- 연속 클릭 중 API 요청 없음
- 스테퍼 잠금 불필요
- API 요청 횟수 감소

### 남은 문제

Debounce는 **요청 시점만 바꾸는 것**이지 데이터의 기준을 하나로 만드는 것은 아니다.

여전히:

```text
로컬 state
서버 state
PATCH 응답
```

이 서로 같은 수량을 관리하고 있었다.

따라서 응답이 늦게 도착하거나 hydration 과정에서 서버 데이터가 들어오면 로컬 값이 덮어써질 수 있었다.

### 결론

**Debounce만으로는 SSOT 문제를 해결할 수 없었다.**

---

## ④ 로컬 SSOT — 최종

결국 수량을 편집하는 동안에는 **Zustand를 SSOT로 사용**하기로 했다.

```text
사용자
 ↓
Zustand
 ↓
UI
```

수량 변경 자체에서는 서버 API를 호출하지 않는다.

```tsx
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
```

따라서 `−`/`+`를 아무리 연속으로 눌러도 UI는 즉시 변경된다.

`isPending`으로 스테퍼를 잠글 필요도 없다.

---

## 서버와 동기화하는 시점

편집 중에는 서버에 보내지 않고, **서버의 정합성이 필요한 경계에서 동기화한다.**

| 상황           | 처리                    |
| -------------- | ----------------------- |
| `−` / `+`      | Zustand만 변경          |
| 수량 직접 입력 | Zustand만 변경          |
| 라인 삭제      | Zustand만 변경          |
| 상품 담기      | 서버 생성 후 store 반영 |
| 주문서 진입    | 로컬 데이터 우선        |
| 주문 제출      | 로컬 → 서버 sync        |
| 주문서 비우기  | 서버 + 로컬 모두 삭제   |

핵심은:

> **편집은 로컬, 확정은 서버.**

---

## 제출 시 Flush

사용자가 주문 제출을 확정하면 `syncDraftToServer`를 실행한다.

```tsx
async function handleConfirm() {
  setIsModalOpen(false);
  setIsSyncingDraft(true);

  try {
    const changes = await syncDraftToServer(useCartStore.getState().lines);

    // out 라인·단가 변동 검사
    // ...
    // submitOrder()
  } finally {
    setIsSyncingDraft(false);
  }
}
```

동기화 과정에서는:

1. 서버에만 존재하는 라인 확인
2. 로컬에서 삭제된 라인은 서버에서도 삭제
3. 로컬 수량을 서버에 반영
4. 단가·가용 여부 등을 확인
5. 최종 주문 제출

즉, **사용자가 주문을 확정하는 시점에는 서버를 기준으로 다시 검증한다.**

---

## 로컬 우선 Hydration

주문서 진입 시 Zustand `persist`에 이미 데이터가 있다면 서버 `GET`으로 덮어쓰지 않는다.

```tsx
if (useCartStore.getState().lines.length > 0) {
  return;
}

const { lines } = await getDraftLines();

if (lines.length > 0) {
  replaceLinesFromServer(lines);
}
```

이렇게 하는 이유는:

```text
사용자가 수량 변경
 ↓
Zustand + localStorage
 ↓
새로고침
 ↓
기존 편집 상태 복구
```

를 보장하기 위해서다.

---

## 왜 ④를 선택했나

| 단계            | 당시 생각                 | 실제 문제                |
| --------------- | ------------------------- | ------------------------ |
| ① 서버 매번     | 서버가 최신이어야 한다    | UI가 느림                |
| ② Optimistic    | UI를 먼저 보여주자        | 연속 mutation 관리 필요  |
| ③ Debounce      | 요청을 줄이자             | SSOT 문제는 남음         |
| **④ 로컬 SSOT** | 편집과 서버 동기화를 분리 | **현재 MVP에 가장 단순** |

여기서 중요한 것은 **서버가 진실이냐 로컬이 진실이냐를 무조건 하나로 정하는 것이 아니다.**

상황에 따라 기준이 다르다.

```text
편집 중
→ 클라이언트 state

제출 / 가격 / 재고 검증
→ 서버
```

---

## 이 사례에서 배운 것

### 1. 서버에 저장된다고 해서 매번 서버에 요청할 필요는 없다

데이터의 **최종 정합성**과 **UI 편집의 즉각적인 반응**은 별개의 문제다.

### 2. Optimistic Update와 Debounce는 만능 해결책이 아니다

- Optimistic Update → UI를 먼저 변경
- Debounce → 요청을 늦춰서 모음
- SSOT → 데이터의 기준을 결정

각각 해결하는 문제가 다르다.

### 3. 먼저 SSOT를 정해야 한다

같은 값을 로컬·서버·응답에서 동시에 관리하면 동기화 로직이 복잡해진다.

이번 주문서에서는:

> **편집 중에는 Zustand가 SSOT이고, 제출 시 서버와 동기화한다.**

라는 규칙으로 단순화했다.

---

## 프로젝트에서 확인할 코드

| 파일                                         | 확인할 내용                                           |
| -------------------------------------------- | ----------------------------------------------------- |
| `CartOrderPage.tsx`                          | `handleQtyStep`, `syncDraftToServer`, `handleConfirm` |
| `CatalogPage.tsx`                            | 상품 담기/해제와 store 반영                           |
| `use-nh-draft-hydration.ts`                  | 로컬 우선 hydration                                   |
| `cart-store.ts`                              | Zustand `persist`, `nh-cart`                          |
| `cart-order.md`                              | 주문서 기획 계약                                      |
| `2026-05-28_concepts-server-client-state.md` | SSOT, race, debounce, hydration, flush 개념           |

---

## 면접 한 줄

> “장바구니 수량은 클라이언트 state를 SSOT로 두어 즉시 UX를 제공하고, 주문 제출 시 서버와 동기화해 가격·가용성 등을 검증했습니다. 클릭마다 PATCH하는 방식은 연속 입력에서 요청과 응답 관리가 복잡해져 분리했습니다.”
