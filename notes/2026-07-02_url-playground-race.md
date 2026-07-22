# UrlPlayground race 체험

> 작성일: 2026-07-02
> 형식: 경량
> 맥락: `useParamState` 이해 전에 `demo/UrlPlayground`로 주소창·`setSearchParams` 동작을 눈으로 보기 위해 만든 페이지.

## 결론

`demo/src/pages/UrlPlayground.tsx`의 「str1·str2 연속 set」은 `setSearchParams`를 **같은 틱에 두 번** 호출해, 기대 `?str1=…&str2=…` 대신 **마지막 키만 남는** 증상을 재현한다. `useParamState`가 `location.href` merge + `await`로 막는 버그와 같은 계열이다.

## 학습 주제 · 키워드

- **URL 상태·React Router**: `useSearchParams`, `setSearchParams`, functional updater, query merge
- **동기화·race**: consecutive updates, `document.location.href`

## 이 레포 예문

연속 호출 버튼 — Network가 아니라 **주소창 3줄**(href / `params.toString()` / 파싱값)을 보면 된다.

```tsx
// demo/src/pages/UrlPlayground.tsx — handleDoubleUpdate
setParams((prev) => { next.set('str1', 'new-str1'); return next }, { replace: true })
setParams((prev) => { next.set('str2', 'new-str2'); return next }, { replace: true })
```

실행: `cd demo && npm run dev` → http://localhost:5173 (또는 터미널 포트).

## GPT에 물어볼 때

```
React Router v6에서 같은 클릭 핸들러 안에서 setSearchParams를 두 번 호출하면
왜 첫 번째 쿼리가 사라질 수 있는지, functional updater의 prev와 주소창이 어긋나는 타이밍을 설명해줘.
내 재현 코드는 str1 set 직후 str2 set이고, 목표는 ?str1=new-str1&str2=new-str2다.
```
