# Adrop 로그아웃 로딩 고착 (React effect)

> 작성일: 2026-07-13
> 형식: 경량
> 맥락: 가사돌봄 로그아웃 시 Adrop이 빈 로딩에 멈춘 원인을 shared AdropBanner에서 추적·수정한 세션

## 결론

`useEffect` 안에서 `setSid(uuid)`만 하고 `return`하면, **이번 effect 실행에서는 fetch가 없고** 다음 실행은 `sid`가 바뀐 뒤의 리렌더에 의존한다. `sid`가 안 바뀌면(아래 노트 2) `isLoading=true`인 채로 영구 정지한다. 수정은 **발급한 uuid를 같은 effect에서 `finalUid`로 바로 써 fetch** 하는 것.

## 학습 주제 · 키워드

- **React useEffect·state 갱신 타이밍**: `setState`, `early return`, `dependency array`, `isLoading`

## 이 레포 예문

로그아웃·`temp_id` 없음일 때 예전이 effect를 끊던 지점과, 같은 턴에 uid를 쓰는 수정.

```tsx
// 문제: setSid 후 return → deps[sid] 재실행을 기다림 (안 오면 로딩 고착)
if (!finalUid) { setSid(generateUUID()); return; }

// 수정(6303953): 발급값을 바로 사용 → 이 effect에서 fetch까지 진행
let finalUid = asStr(userId) || asStr(sid);
if (!finalUid) { finalUid = generateUUID(); setSid(finalUid); }
// … fetchAdBanner()
```

경로: `backoffice-shared/packages/component/.../AdropBanner/index.tsx`

## GPT에 물어볼 때

```
React useEffect에서 setState 직후 return하면 왜 같은 실행에서 새 state를 못 쓰나?
dependency에 sid가 있을 때 setSid 후 early return → fetch 미실행 → 리렌더 없으면 로딩 고착
우리 케이스는 AdropBanner: user_id 없을 때 temp_id(sid) 발급.
"같은 effect에서 로컬 변수로 uuid 쓰고 setState는 저장만" vs "setState만 하고 다음 effect에 맡기기" 비교해줘.
```
