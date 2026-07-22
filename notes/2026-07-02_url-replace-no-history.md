# replace:true와 뒤로가기

> 작성일: 2026-07-02
> 형식: 경량
> 맥락: `UrlPlayground`에서 필터를 바꿔도 뒤로가기가 거의 안 되는 이유를 확인했다.

## 결론

playground와 `useParamState` 모두 `setSearchParams(..., { replace: true })`가 기본이다. **히스토리에 push하지 않고** 현재 항목 URL만 바꾸므로, 필터를 여러 번 바꿔도 **이전 필터로 뒤로가기가 안 된다**. 백오피스 UX상 “필터마다 history 쌓지 않기”가 의도다.

## 학습 주제 · 키워드

- **브라우저·히스토리**: `history.replaceState`, `pushState`, back/forward
- **URL 상태**: `replace` option, filter UX, `useParamState` defaults

## 이 레포 예문

playground 입력·버튼은 전부 `replace: true`. 훅도 `options.replace ?? true`.

```tsx
// demo — keyword 변경
setParams((prev) => { /* ... */ return next }, { replace: true })

// packages/hook/src/useParamState/useParamState.ts
const replace = options.replace ?? true
setParams(() => toParams({ ...prevUrlDict, [key]: value }), { replace })
```

뒤로가기 체험은 주소창에 쿼리를 **직접 Enter**하거나 `replace: false`로 바꿔야 의미가 있다.

## GPT에 물어볼 때

```
React Router setSearchParams의 replace:true vs false 차이를 설명해줘.
어드민 목록에서 검색어·필터·페이지를 URL에 넣을 때 보통 replace를 쓰는 이유와,
뒤로가기로 이전 필터를 복원하고 싶을 때의 대안(push, session state)도 비교해줘.
```
