# same-tab setItem은 storage 이벤트 없음

> 작성일: 2026-07-13
> 형식: 경량
> 맥락: Adrop `temp_id`가 sessionStorage에 써져도 React state(sid)가 안 바뀌어 effect가 재실행되지 않던 원인

## 결론

**의미:** `sessionStorage.setItem` / `localStorage.setItem`을 하면, 브라우저 `storage` 이벤트는 **값을 바꾼 그 탭이 아니라 다른 탭(다른 browsing)** 에만 전달된다. 같은 탭에서는 이벤트가 안 온다.  
우리 `useSessionStorage`는 예전엔 `storage` 리스너만으로 `useSyncExternalStore`를 깨웠기 때문에, **같은 탭에서 `setSid`해도 구독자가 안 불리고 → 리렌더 없음 → Adrop effect deps의 `sid` 불변**. 수정은 `setValue` 후 `notifySameTab(key)`로 같은 탭 구독자에게도 `callback()`을 호출하는 것.

## 학습 주제 · 키워드

- **Web Storage · cross-document 이벤트**: `storage` event, `same-tab`, `setItem`, `useSyncExternalStore`

## 이 레포 예문

같은 탭 알림이 없을 때와, `setValue` 끝에 알리는 수정(7d07c2d).

```ts
// 예전: setItem만 → 같은 탭 storage 이벤트 없음 → React state 미갱신
sessionStorage.setItem(key, JSON.stringify(next))

// 수정: 같은 탭 리스너 Map에 notify
sessionStorage.setItem(key, JSON.stringify(next))
notifySameTab(key) // listeners.forEach(cb => cb())
```

경로: `backoffice-shared/packages/hook/src/useStorage/useSessionStorage.ts` (localStorage도 동일)

## GPT에 물어볼 때

```
브라우저 StorageEvent는 왜 값을 변경한 window가 아니라 다른 document에만 오는지 설명해줘.
useSyncExternalStore의 subscribe가 storage만 듣고 있으면, 같은 탭 setItem 후 state가 안 바뀌는 흐름을 단계로.
우리 패턴: key별 Set<() => void> sameTabListeners + setValue 끝 notifySameTab.
BroadcastChannel/커스텀 이벤트와 비교 장단도 짧게.
```
