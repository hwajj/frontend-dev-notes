# useParamState URL 동기화 race

> 작성일: 2026-07-01
> 형식: 경량
> 맥락: 필터·검색을 URL에 맞추려고 만든 `useParamState` 추가 이후, `setSearchParams` 연속 호출로 URL이 깨지는 버그가 나서 `updateParam`에서 막는 패턴을 넣었다.

## 결론

`updateParam`은 merge 기준을 `setParams`의 `prev` 대신 `document.location.href`로 두고, 다음 호출 전 `await 80ms`로 주소창과 맞춘다(`50eab3fd`).

## 학습 주제 · 키워드

- **URL 상태·React Router**: `useSearchParams`, `setSearchParams`, `replace`, query string merge
- **동기화·race**: `document.location.href`, functional updater 한계, 연속 업데이트

## 이 레포 예문

`packages/hook/src/useParamState/useParamState.ts` — 연속 `updateParam` 시 prev 대신 주소창 스냅샷을 쓰는 핵심.

```typescript
const prevUrlDict = { ...Object.fromEntries(new URL(document.location.href).searchParams.entries()) }
// ...
setParams(() => toParams({ ...prevUrlDict, [key]: value }), { replace })
await new Promise((r) => setTimeout(r, 80))
```

`packages/hook/test/useParamState.spec.ts` — 한 컴포넌트에 훅 두 개 쓸 때 연속 `setParam`이 URL에 남는지 검증하는 edge case.

## GPT에 물어볼 때

```
React Router v6 useSearchParams에서 setSearchParams를 연속으로 호출할 때
functional updater의 prev가 document.location과 어긋나는 이유를 설명해줘.
같은 컴포넌트에 useSearchParams 훅을 두 개 쓰면 어떤 race가 나는지,
location.href 스냅샷 vs flushSync vs 단일 훅으로 merge 중 트레이드오프도 비교해줘.
내 코드는 setParams 후 80ms await를 쓰고 있어.
```
