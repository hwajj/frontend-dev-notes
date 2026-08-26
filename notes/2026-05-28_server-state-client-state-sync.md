응. 아까 정리한 방향대로라면 `2026-05-28_concepts-server-client-state.md`는 **개념만 남기고**, 주문서 시행착오 내용은 최대한 빼는 게 좋다.

아래 정도로 정리하면 두 문서 역할이 깔끔하게 나뉜다.

# 서버 state · 클라이언트 state · 동기화

> 작성일: 2026-05-28
> 형식: 개념 사전
> 관련 문서: [주문서 수량 UX — 바꿀 때마다 서버? 낙관적? debounce? 로컬?](./2026-05-28_react-query-optimistic-update.md)

---

## 한 줄 요약

**먼저 “누가 진실(SSOT)인가”를 정하고, 그다음 “언제 서버와 동기화할지”를 결정한다.**

---

## 개념 지도

```text
서버
 └─ DB / API
       ↓
   서버 state
       ↓
TanStack Query
 └─ query / cache / mutation

클라이언트
 └─ React state / Zustand / localStorage
       ↓
   클라이언트 state

서버 ↔ 클라이언트
       ↓
   동기화(sync)
       ↓
 SSOT / hydration / flush
```

---

## 1. 서버 state

**서버에 존재하고 서버가 관리하는 데이터.**

예:

- DB 데이터
- API로 가져온 사용자 정보
- 주문 draft
- 상품 재고

특징:

- 다른 사용자·기기에서도 공유될 수 있음
- 서버가 최종적으로 데이터를 검증함
- 네트워크를 통해 가져오거나 변경함

React에서는 이런 데이터를 직접 `useState`로 관리하기보다 **TanStack Query** 같은 서버 state 도구를 사용하는 경우가 많다.

---

## 2. 클라이언트 state

**현재 브라우저에서 UI를 위해 관리하는 데이터.**

예:

- 모달 열림/닫힘
- 선택된 탭
- 입력 중인 값
- 장바구니 편집 상태

Zustand를 사용한다면:

```tsx
cart.updateQuantity(productId, next);
```

처럼 브라우저 안에서 즉시 변경할 수 있다.

`persist`를 사용하면 localStorage 등에 저장해서 새로고침 후에도 상태를 복구할 수 있다.

---

## 3. 서버 state vs 클라이언트 state

|                  | 서버 state            | 클라이언트 state     |
| ---------------- | --------------------- | -------------------- |
| 존재하는 곳      | 서버 / DB             | 브라우저             |
| 관리 주체        | 서버                  | 현재 화면            |
| 다른 기기와 공유 | 가능                  | 기본적으로 불가능    |
| 예시             | 주문 draft, 상품 정보 | 입력값, UI 상태      |
| 대표 도구        | TanStack Query        | React state, Zustand |

쉽게 말하면:

> **서버 state = 공식 장부**
> **클라이언트 state = 현재 화면의 작업 공간**

둘이 항상 같은 역할을 하는 것은 아니다.

---

## 4. SSOT — Single Source of Truth

**같은 데이터를 여러 곳에서 동시에 수정하지 않고, 어느 한 곳을 기준으로 삼는 것.**

예를 들어 수량이:

```text
Zustand: 4
서버: 3
API 응답: 3
```

처럼 여러 곳에서 동시에 관리되면 어떤 값을 화면에 보여줘야 하는지 복잡해진다.

따라서 편집 중에는:

```text
사용자 입력
   ↓
Zustand
   ↓
화면
```

처럼 하나를 기준으로 정할 수 있다.

중요한 점은:

> **서버가 항상 UI 편집의 SSOT여야 하는 것은 아니다.**

서버는 제출·가격·재고처럼 **최종 정합성이 필요한 시점**에서 기준이 될 수 있고, 편집 중에는 클라이언트가 SSOT가 될 수도 있다.

---

## 5. TanStack Query

TanStack Query는 **서버 state를 가져오고 캐싱하고 동기화하는 도구**다.

### Query

`GET`처럼 서버 데이터를 조회할 때 사용한다.

```tsx
useQuery({
  queryKey: ["job", jobId],
  queryFn: () => getJob(jobId),
});
```

조회 결과는 `queryKey`를 기준으로 캐시된다.

### Mutation

`POST`, `PATCH`, `DELETE`처럼 서버 데이터를 변경할 때 사용한다.

```tsx
useMutation({
  mutationFn: updateJob,
});
```

### invalidateQueries

서버 데이터가 변경됐을 때 캐시를 무효화하고 다시 가져오도록 한다.

```tsx
queryClient.invalidateQueries({
  queryKey: ["job", "list"],
});
```

즉:

> **Query = 서버 데이터 조회**
> **Mutation = 서버 데이터 변경**

---

## 6. Optimistic Update

**서버 응답을 기다리지 않고 UI를 먼저 변경하는 방식.**

```text
클릭
 ↓
UI 먼저 변경
 ↓
서버 요청
 ↓
성공 → 유지
실패 → rollback
```

TanStack Query에서는 `onMutate`를 이용해 캐시를 먼저 변경하고, 실패하면 이전 값을 복구하는 패턴을 사용할 수 있다. ([TanStack][1])

대표적인 예:

- 좋아요
- 즐겨찾기
- 단순 토글
- 즉시 반응이 중요한 단발 액션

단, **Optimistic Update 자체가 연속 요청에 취약한 것은 아니다.** 동시 mutation을 고려한 설계도 가능하다. 다만 연속 수정이 빈번한 UI에서는 mutation 순서와 서버 응답을 어떻게 반영할지까지 설계해야 한다. ([TanStack][1])

---

## 7. Race Condition

**여러 작업이 동시에 실행되면서 결과 순서가 예상과 달라지는 문제.**

예:

```text
+ 클릭
 → 요청 A: 수량 3

+ 클릭
 → 요청 B: 수량 4

B 응답 → 4
A 응답 → 3
```

최종 응답을 그대로 화면에 반영하면 최신 상태가 과거 응답에 의해 덮어써질 수 있다.

대응 방법은 상황에 따라:

- 요청 순서 제어
- 이전 요청 취소
- mutation queue
- 최신 요청만 반영
- 로컬을 편집 SSOT로 사용

등이 있다.

핵심은:

> **비동기 요청이 여러 개 겹칠 때는 “응답이 요청 순서대로 온다”라고 가정하면 안 된다.**

---

## 8. Debounce

**입력이 끝난 뒤 일정 시간 기다렸다가 한 번 실행하는 방식.**

예를 들어 0.4초 debounce:

```text
+ + + + +
        ↓
  입력 멈춤
        ↓
   0.4초 대기
        ↓
   PATCH 1번
```

주로:

- 검색창
- 자동 저장
- 연속 입력

등에서 사용한다.

장점:

- API 요청 횟수 감소
- 연속 입력 중 불필요한 요청 방지

하지만 debounce는 **SSOT 문제를 해결하는 기능이 아니다.**

```text
debounce
 = 요청 시점 조절

SSOT
 = 데이터의 기준 결정
```

서로 다른 문제다.

---

## 9. Hydration

**서버나 저장소의 데이터를 클라이언트 상태에 채우는 과정.**

예를 들어 Zustand `persist`를 사용하는 경우:

```text
localStorage
    ↓
Zustand
    ↓
React UI
```

서버 데이터를 가져오는 경우에는:

```text
GET API
  ↓
클라이언트 state
  ↓
화면
```

처럼 사용할 수 있다.

여기서 중요한 것은 **어느 데이터를 우선할지**다.

### 로컬 우선

```text
로컬 데이터 있음
 → 로컬 사용
```

장점:

- 사용자가 방금 편집한 값 유지

단점:

- 다른 기기에서 변경된 서버 상태를 놓칠 수 있음

### 서버 우선

```text
GET 서버
 ↓
클라이언트에 반영
```

장점:

- 최신 서버 상태 기준
- 다른 기기에서 이어서 작업하기 좋음

---

## 10. Flush

**클라이언트에서 모아둔 변경사항을 특정 시점에 서버에 반영하는 것.**

```text
편집
 ↓
클라이언트 state만 변경
 ↓
제출
 ↓
flush
 ↓
서버 반영
```

즉:

> **편집과 서버 동기화를 분리하는 패턴**

이다.

주문서에서는 제출 같은 중요한 경계에서 서버와 최종적으로 맞추는 방식으로 사용할 수 있다.

---

## 11. Sync는 별도의 문제

서버와 클라이언트가 서로 다른 값을 가지고 있다고 해서 무조건 문제가 되는 것은 아니다.

중요한 것은:

> **언제 서버와 맞춰야 하는가?**

예:

| 상황                   | 서버 동기화 |
| ---------------------- | ----------- |
| 스테퍼 연타            | 필요 없음   |
| 입력 중                | 필요 없음   |
| 제출                   | 필요        |
| 가격 검증              | 필요        |
| 재고 검증              | 필요        |
| 다른 기기에서 이어쓰기 | 필요        |

따라서 **“항상 서버와 똑같이 유지”**와 **“필요한 순간에 서버와 맞춘다”**는 서로 다른 설계다.

---

## 12. 패턴 선택 기준

| 상황                                 | 적합한 방식       |
| ------------------------------------ | ----------------- |
| 서버 데이터 조회                     | TanStack Query    |
| 서버 데이터 변경                     | Mutation          |
| 단발 액션을 즉시 반영                | Optimistic Update |
| 연속 입력의 요청 감소                | Debounce          |
| UI 편집을 빠르게 처리                | Client state      |
| 제출 시 서버 반영                    | Flush             |
| 새로고침 후 상태 유지                | Zustand persist   |
| 서버/로컬 중 어떤 값을 사용할지 결정 | Hydration 정책    |
| 여러 요청의 순서 문제                | Race 대응         |

---

## 13. 핵심 정리

이 문서에서 기억할 것은 네 가지다.

### ① 서버 state와 클라이언트 state는 다르다

서버에 있는 데이터와 현재 화면에서 편집 중인 데이터는 역할이 다를 수 있다.

### ② SSOT를 먼저 정한다

같은 데이터를 여러 곳에서 동시에 수정하면 동기화 복잡도가 올라간다.

### ③ Debounce와 Optimistic Update는 서로 다른 문제를 해결한다

- Optimistic Update → **UI를 먼저 보여주는 것**
- Debounce → **요청을 모아서 보내는 것**

### ④ 서버 동기화 시점을 정한다

```text
누가 진실인가?
      ↓
언제 서버와 맞출 것인가?
```

이 두 가지를 분리해서 생각하면 상태 관리 설계가 훨씬 단순해진다.

---

## 관련 문서

- [주문서 수량 UX — 바꿀 때마다 서버? 낙관적? debounce? 로컬?](./2026-05-28_react-query-optimistic-update.md)
- [TanStack Query — Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

[1]: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates?from=reactQueryV3&utm_source=chatgpt.com "Optimistic Updates | TanStack Query React Docs"
