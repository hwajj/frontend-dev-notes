# useAtomicContext — Context 전체 리렌더 줄이기

> 작성일: 2026-05-29  
> 맥락: Context에 `user`만 바꿨는데, `theme`만 쓰는 자식까지 **전부** 다시 그려진다.

## 먼저 이것만

1. `useContext`는 value가 바뀌면 **그 Context를 읽는 컴포넌트는 모두** 갱신 대상이다.
2. value에 **ref store + subscribe**를 넣고, 자식은 `useSyncExternalStore`로 **필드만** 구독한다.
3. selector는 **primitive**나 안정된 값을 고르는 편이 낫다.

## 이 글의 질문

- Zustand 없이 “필드 하나만” 구독할 수 있나?
- Context와 외부 store를 어떻게 엮나?

## 핵심 (먼저 읽기)

| API | 리렌더 |
|-----|--------|
| `useContext(Ctx)` — `{ user, theme }` 객체 | user·theme **둘 중 하나**만 바뀌어도 전부 |
| `useAtomicContext(Ctx, s => s.user)` | **user** 바뀔 때만 (selector 결과가 바뀔 때) |
| `useAtomicContext(Ctx)` (selector 없음) | store 메서드만 쓸 때 — 구독 없이 store 객체 |

## 전제 (30초)

- **Context**: 트리에 값을 내려주는 배관.
- **ref store**: React state가 아닌 `ref.current`에 데이터 — `set` 시 subscriber만 깨움.
- **useSyncExternalStore**: React 18+ — 외부 소스 구독 공식 API.

## 한눈에

```
Provider
  const store = useAtomicStore({ user: 'A', theme: 'dark' })
  <Ctx.Provider value={store}>{children}</Ctx.Provider>

ChildUser:  const [user] = useAtomicContext(Ctx, s => s.user)     // theme 변경 시 무시
ChildTheme: const [theme] = useAtomicContext(Ctx, s => s.theme)   // user 변경 시 무시
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `useAtomicStore` | ref + `set` / `update` + `subscribe` |
| `selector` | `store => store.user` — 구독할 조각 |
| `subscribe` | store 변경 시 등록된 콜백 실행 |

## 함정 한 가지

**착각**: `s => ({ name: s.user.name })`처럼 매번 새 객체를 반환해도 된다.  
**실제**: 참조가 바뀌면 **매번 리렌더** — `s => s.user.name`처럼 **값**을 고른다.

## 왜 이렇게인가

Context value에 큰 객체를 넣으면 “배포”는 쉽지만 구독 단위가 거칠다. Zustand·Jotai도 비슷하게 store 밖으로 빼고 selector로 자른다. 이 패턴은 **의존성 추가 없이** hook 패키지 안에 최소 store만 둔 형태다. `set`/`update`는 모든 subscriber를 호출하므로, selector 안에서 **실제로 쓰는 필드**만 읽어 React가 비교할 값을 줄인다.

## 실무 체크포인트 — 최소 패턴

### store (Provider 쪽)

```typescript
function useAtomicStore<S>(initial: S) {
  const state = useRef(initial);
  const subs = useRef(new Set<() => void>());

  return {
    getAll: () => state.current,
    set: (next: S) => {
      state.current = next;
      subs.current.forEach((fn) => fn());
    },
    subscribe: (fn: () => void) => {
      subs.current.add(fn);
      return () => subs.current.delete(fn);
    },
  };
}
```

### 구독 (자식)

```typescript
function useAtomicContext<C, V>(
  ctx: React.Context<Store | null>,
  selector: (s: State) => V,
) {
  const store = useContext(ctx);
  if (!store) throw new Error('Provider 밖');

  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getAll()),
  );
}
```

### 사용

```tsx
const Ctx = createContext<ReturnType<typeof useAtomicStore<AppState>> | null>(null);

function Provider({ children }) {
  const store = useAtomicStore({ user: 'kim', theme: 'light' });
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

function UserBadge() {
  const user = useAtomicContext(Ctx, (s) => s.user);
  return <span>{user}</span>;
}
```

`user`만 바꿀 때 `UserBadge`만 리렌더되는지 React DevTools **Highlight updates**로 확인한다.

## 참고 코드 — 팀 구현 요지

```typescript
// useAtomicContext — subscribe + selector
const state = useSyncExternalStore(
  store.subscribe,
  () => selector?.(store.getAll()),
);
```

```typescript
// useAtomicStore — set 시 subscriber 전부 호출
store.current = next;
subscribers.current.forEach((fn) => fn());
```

## 부록 — backoffice-shared

`@backoffice-fe/hook`: `useAtomicStore` + `useAtomicContext` + `createContext` 조합. Provider는 `value={useAtomicStore(initial)}` 형태.

## 면접 한 줄

「Context 리렌더는 value를 얇게 하거나, ref store + useSyncExternalStore로 구독 단위를 쪼갠다.」
