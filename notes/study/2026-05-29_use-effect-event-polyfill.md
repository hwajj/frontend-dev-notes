# useEffectEvent 폴리필 — effect와 “이벤트성” 핸들러 분리

> 작성일: 2026-05-29  
> 맥락: `useEffect`는 `error`만 보고 싶은데, deps에 `navigate(to)`의 `to`를 넣으면 **to가 바뀔 때마다** effect가 다시 돈다.

## 먼저 이것만

1. **effect** = 동기화·구독 — deps가 바뀌면 cleanup 후 **다시 실행**.
2. **이벤트 핸들러** = 실행 시점의 **최신 props/state**를 써야 하지만, effect를 **다시 돌리고 싶지 않을** 때가 많다.
3. `useEffectEvent`(React 19) 또는 **ref + 안정된 함수**로 “항상 최신 fn”을 effect deps 밖에 둔다.

## 이 글의 질문

- deps에 콜백을 넣으면 왜 자주 도나?
- React 19 전에는 뭘 쓰나?

## 핵심 (먼저 읽기)

| 패턴 | effect 재실행 조건 | 핸들러가 보는 `to` |
|------|-------------------|-------------------|
| `[error, to]` | error **또는** to 변경 | 최신 |
| `[error]` + 클로저만 | error만 | to 옛값 위험 |
| `[error]` + `useEffectEvent` | error만 | **항상 최신** |

## 전제 (30초)

- **클로저**: effect가 만들어질 때의 변수를 붙잡음.
- **구독 예**: `window.addEventListener`, WebSocket, React Query 콜백.

## 한눈에

```
[안티패턴]
  useEffect(() => {
    if (error) subscribe(() => navigate(to));
  }, [error, to]);  // to 바뀔 때마다 unsubscribe → subscribe

[권장]
  const onError = useEffectEvent(() => navigate(to));
  useEffect(() => {
    if (error) subscribe(onError);
  }, [error]);       // 구독은 error 기준으로만
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `useEffectEvent` | React 19 — effect 안에서 부를 “이벤트” 함수 |
| `useNonReactivity` | ref + `() => ref.current` — **값**을 deps 없이 최신으로 |
| stable callback | `useMemo(() => (...args) => ref.current(...args), [])` |

## 함정 한 가지

**착각**: `useCallback(fn, [to])`로 감싸면 effect deps 문제가 해결된다.  
**실제**: `to`가 deps에 있으면 **fn 참조가 바뀌고**, effect deps에 `fn`을 넣는 순간 **여전히 자주 재실행**된다.

## 왜 이렇게인가

React 문서 *Separating events from effects* — 리스너 등록은 “언제 연결할지”(error, mount)와 “연결된 뒤 무엇을 할지”(최신 navigate)를 나눈다. 폴리필은 ref에 최신 `fn`을 넣고, 밖으로는 **참조 고정** 함수만보낸다.

## 실무 체크포인트

### useEffectEvent 폴리필 (개념)

```typescript
function useEffectEvent<F extends (...args: never[]) => unknown>(fn: F): F {
  const ref = useRef(fn);
  ref.current = fn;
  return useMemo(
    () => ((...args: Parameters<F>) => ref.current(...args)) as F,
    [],
  );
}
```

### 사용 예 — 에러 시 이동

```tsx
function RedirectOnError({ error, to }: { error: Error | null; to: string }) {
  const navigate = useNavigate();
  const go = useEffectEvent(() => navigate(to));

  useEffect(() => {
    if (error) {
      openModal({
        message: error.message,
        onResolve: () => go(),
      });
    }
  }, [error]); // to는 deps에 없음 — to가 바뀌어도 effect 재실행 없음
}
```

### useNonReactivity — “값”만 최신으로

```typescript
function useNonReactivity<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return useMemo(() => () => ref.current, []);
}

// effect deps: [getTo] 고정, 호출 시점에 최신 to
const getTo = useNonReactivity({ to });
useEffect(() => { ... navigate(getTo()); }, [error]);
```

| 도구 | 쓸 때 |
|------|--------|
| `useEffectEvent` | effect **안에서** 부르는 콜백 |
| `useNonReactivity` | 객체·API 인스턴스 참조를 deps에서 빼기 |

## 참고 코드

React 19+에서는 `import { useEffectEvent } from 'react'` 공식 API 사용 가능. 그 전 프로젝트는 위 ref 패턴이 동일 역할이다.

## 부록 — backoffice-shared

`@backoffice-fe/hook`의 `useEffectEvent` / `useNonReactivity`. Modal `DispatchListener`는 `useNonReactivity(M)`으로 모달 API를 effect deps에서 뺀다.

## 면접 한 줄

「effect deps는 동기화 트리거만; 핸들러 최신성은 EffectEvent 또는 ref stable callback으로 분리한다.」
