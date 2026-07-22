# useParamState — URL 쿼리를 연속으로 바꿀 때

> 작성일: 2026-05-29  
> 맥락: 목록 필터에서 `page`와 `status`를 연속으로 바꿨는데, 주소창에는 **마지막 것만** 남거나 `page`가 사라진다.

## 먼저 이것만

1. React Router의 `setSearchParams`는 `useState`처럼 **여러 번 호출을 한꺼번에 합쳐 주지 않는다**.
2. 연속으로 쿼리를 고칠 때는 **한 번에 객체로 넘기거나**, merge 전에 **브라우저 주소창의 실제 URL**을 읽는다.
3. `await updateParam(...)` 뒤의 **80ms**는 “URL이 반영될 때까지 잠깐 기다리기”용 타협이다.

## 이 글의 질문

- `updateParam`을 두 번 연속 호출하면 왜 한 번만 반영되나?
- 함수형 `setParams(prev => …)`면 안전한가?

## 핵심 (먼저 읽기)

| 상황 | 주소창 결과 (예) |
|------|------------------|
| 시작 | `https://app.example/orders?page=1&status=open` |
| `setSearchParams({ status: 'done' })`만 (이전 스냅샷 기준) | `?status=done` — **page 유실** |
| merge 후 `setSearchParams({ page:1, status:'done' })` | `?page=1&status=done` |
| `document.location.href`에서 쿼리 읽고 merge | 연속 호출해도 **누적** |

## 전제 (30초)

- **쿼리 문자열**: `?page=1&status=open` — 새로고침·URL 공유 시 필터 복원용.
- **`useSearchParams`**: React Router v6 — `[params, setParams]` 형태.
- **어드민 목록**: 필터·정렬·페이지를 URL과 맞춰 두는 패턴이 많음.

## 한눈에

```
[문제] 같은 이벤트 루프 안에서
  setParams({ status: 'done' })   // Router가 본 params: page=1, status=open
  setParams({ page: 2 })          // 아직 옛 params 기준이면 page만 남을 수 있음

[해결 A] 한 번에
  setParams({ page: 2, status: 'done' })

[해결 B] 매번 주소창 기준 merge (useParamState)
  prev ← new URL(document.location.href).searchParams
  setParams({ ...prev, status: 'done' })
  await 80ms
  setParams({ ...prev, page: 2 })
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `setSearchParams` / `setParams` | 쿼리 문자열을 바꾸는 Router API |
| `replace: true` | 뒤로가기 스택에 쌓지 않고 현재 URL만 교체 |
| `prevUrlDict` | merge 직전, **브라우저에 이미 반영된** 쿼리 키·값 |

## 함정 한 가지

**착각**: `setParams(prev => ({ ...prev, page: 2 }))`면 `useState`처럼 안전하다.  
**실제**: Router 구현에 따라 `prev`와 **실제 주소창**이 어긋난 채로 연속 호출되면, 여전히 덮어쓰기가 난다. 그래서 이 훅은 `prev` 대신 `document.location.href`를 읽는다.

## 왜 이렇게인가

`useState` 배치와 달리, location 쿼리 업데이트는 **호출마다 독립 스냅샷**을 쓰는 경우가 많다. 필터 두 개를 순서대로 바꾸는 UI에서는 “마지막 set만 살아남음”이 흔하다.  
한 번에 객체로 넘기는 게 가장 깔끔하고, API가 키 단위만 허용하면 **실제 URL**을 merge 기준으로 삼는다. 80ms는 `setParams` 직후 JS가 아직 옛 `params`를 읽는 짧은 구간을 피하려는 값이다(환경마다 0~100ms 조정 가능).

## 실무 체크포인트

### 패턴 비교 (복사해서 실험 가능)

```typescript
// ❌ 연속 호출 — page가 사라질 수 있음
const [searchParams, setSearchParams] = useSearchParams();
setSearchParams({ status: 'done' });
setSearchParams({ page: '2' });

// ✅ 권장 — 한 번에
setSearchParams({ page: '2', status: 'done' });

// ✅ 키별 API가 있을 때 — 주소창 기준 merge
const prev = Object.fromEntries(
  new URL(document.location.href).searchParams.entries(),
);
setSearchParams({ ...prev, status: 'done' });
```

### 확인 방법 (레포 없이)

1. Chrome DevTools → **주소창** 또는 Application이 아닌 **페이지 URL**을 본다.  
2. 필터 버튼 두 개를 빠르게 눌렀을 때 `?page=`가 남는지 본다.  
3. Network 탭은 API 요청용 — 쿼리 동기화는 **Document URL**이 기준이다.

| 증상 | 원인 |
|------|------|
| 마지막 필터만 남음 | 연속 `setSearchParams` |
| 다음 줄에서 옛 쿼리 읽음 | 반영 전에 `params.get` 호출 → `await` 또는 한 번에 merge |

## 참고 코드 — merge + 대기 (개념)

```typescript
async function updateParam(key: string, value: string) {
  const prevUrlDict = {
    ...Object.fromEntries(new URL(document.location.href).searchParams.entries()),
  };
  setParams(() => ({ ...prevUrlDict, [key]: value }), { replace: true });
  await new Promise((r) => setTimeout(r, 80));
}
```

`setParams`의 첫 인자가 함수여도, 주석대로 **함수의 `prev`와 주소창이 항상 같지는 않다**는 점이 포인트다.

## 부록 — backoffice-shared `useParamState`

`@backoffice-fe/hook`의 `useParamState(configs)`는 필드마다 `decoder`·`validator`·기본값을 두고, 위 merge·80ms를 **내장**한다.

```typescript
const [param, updateParam] = useParamState({
  page: { value: 1, decoder: Number, validator: isValid.number },
  status: { value: 'open', decoder: String, validator: isValid.record({ open: 'open', done: 'done' }) },
});

await updateParam('status', 'done');
await updateParam('page', 2);
```

`configureUseParamState({ replace: false })`로 히스토리에 쌓이게 할 수 있다.

## 면접 한 줄

「URL 쿼리는 state 배치를 기대하지 말고, **한 번의 set** 또는 **실제 URL merge**로 맞춰라.」
