# Day 0.7 — packages/hook 리포 맵핑(읽기 전용)

> 이 문서는 `packages/hook`의 **이름과 흐름**만 먼저 익히기 위한 읽기 전용 가이드입니다.  
> 코드까지 포함해 **이 파일 하나만 보고** 전체 구조를 학습할 수 있도록 구성했습니다.

---

## 1. 전체 흐름 요약

```
Context / Store
  createAtomicContext → useAtomicStore + useAtomicContext
  → “구독 기반 상태 + selector”로 리렌더 최소화

URL / Query
  createQueryParams(configs) → useParamState(configs)
  → URL search params를 타입 안전하게 읽고 갱신

기타 훅
  useBlocker, useClickOutside, useInfiniteScroll, useEffectEvent,
  useLocalStorage, useSessionStorage, useInvalidateQuery, useGlobalEvent,
  useStateWithDeps, useLazyLoading, useClarity …
```

- **상태·컨텍스트**: `createAtomicContext` → `useStore` / `useContext`(selector 가능)
- **URL 상태**: `createQueryParams` + `useParamState` + `Param.*`
- **나머지**: 라우팅·DOM·스토리지·이벤트·분석 등 용도별 훅

---

## 2. createAtomicContext — Store + Context 한 번에

**역할**: React `createContext` 위에 **구독 기반 Store**를 얹어, “값이 바뀐 필드만 구독하는 쪽만 리렌더” 되게 한다.

**위치**: `packages/hook/src/useContext/createContext.ts`

### 2.1 반환 API

```ts
const { Provider, useStore, useContext, value } = createAtomicContext<MyStore, MyContextUtils>();

// Provider 쪽
const store = useStore({ ...초기상태 });
<Provider value={value({ ...store, utilFn1, utilFn2 })}>{children}</Provider>

// 소비 쪽
const [state, store] = useContext((store) => store.myState);  // selector 사용 시 [값, store]
const store = useContext();  // selector 없으면 store 통째로
```

- **value**: Provider에 넘길 값을 **한 번 만들고 유지**하기 위한 래퍼. `useRef(value).current`로 동일 참조 유지.
- **useStore(initialState)**: 내부적으로 `useAtomicStore(initialState)`를 호출해 `AtomicStore<S>`를 만든다.

### 2.2 useAtomicStore — 구독 가능한 “작은 스토어”

**위치**: `packages/hook/src/useContext/useAtomicStore.ts`

```ts
interface AtomicStore<S> {
  get: <R>(getter: (store: S) => R) => R;
  getAll: () => S;
  set: (setter: S | ((prev: S) => S)) => void;
  update: (updater: Partial<S> | ((prev: S) => Partial<S>)) => void;
  subscribe: (callback: () => void) => () => void;
}
```

- 상태는 **ref**로 들고 있고, `set`/`update` 시 **subscribers**에 알린다.
- `useAtomicContext`는 이 `subscribe`를 `useSyncExternalStore`에 넘겨, “selector가 보는 값”이 바뀔 때만 해당 훅을 쓰는 컴포넌트가 리렌더되게 한다.

### 2.3 useAtomicContext — selector + useSyncExternalStore

**위치**: `packages/hook/src/useContext/useAtomicContext.ts`

```ts
function useAtomicContext<T>(context: Context<T | null>): T;
function useAtomicContext<T, V>(context: Context<T | null>, selector: (store: InferStore<T>) => V): [V, T];
```

- **selector 없음**: `store` 전체 반환.
- **selector 있음**: `useSyncExternalStore(store.subscribe, () => selector(store.getAll()))`로 **선택한 값**만 구독하고, `[선택값, store]` 반환.

**정리**: **createAtomicContext** = “Context + AtomicStore + selector 기반 구독”을 한 번에 쓰기 위한 팩토리. 전역 상태를 “한 번에 다 구독”하지 않고 **필요한 조각만** 구독하게 만드는 패턴이다.

---

## 3. useParamState — URL search params를 타입 안전하게

**역할**: `useSearchParams`(react-router-dom)를 감싸서, **키별 타입·디코더·기본값**을 설정으로 두고 읽기/쓰기를 통일한다.

**위치**: `packages/hook/src/useParamState/useParamState.ts`

### 3.1 시그니처

```ts
const [paramUtils, updateParam] = useParamState<V>(configs: ParamConfigs<V>, options?: UseParamStateOptions);

// paramUtils
paramUtils.get(key);        // 해당 키 값 (타입 유지)
paramUtils.all();           // 비어 있지 않은 값만 모은 객체
paramUtils.raw();           // search string
paramUtils.toInitial();     // configs.value 기준 초기값 객체
paramUtils.isDirty();       // 현재 URL에 param이 하나라도 있는지

// updateParam
updateParam(key, value);    // 한 필드만
updateParam({ k1: v1, k2: v2 });  // 여러 필드
updateParam(null);          // 전부 비우기
```

### 3.2 ParamConfigs / Param

**위치**: `packages/hook/src/useParamState/types.ts`, `Param.ts`

```ts
interface ParamConfig<V> {
  value: V;
  decoder: (value: string) => V;
  validator?: (value: string | null) => boolean;
}

type ParamConfigs<V extends Record<string, unknown>> = { [K in keyof V]: ParamConfig<V[K]> };
```

**Param.*** 로 자주 쓰는 설정을 만든다:

```ts
Param.string();           // value: '', decoder: id
Param.string('hello');
Param.number(1);          // decoder: Number, validator로 숫자 형태 체크
Param.boolean();          // 'true'/'false' 문자열 ↔ boolean
Param.date(dayjs());      // 문자열 ↔ dayjs
Param.array<string>();    // 구분자로 split
Param.oneOf({ A: 'a', B: 'b' });  // 값→키 매핑
```

### 3.3 createQueryParams — configs + 링크용 setter

**위치**: `packages/hook/src/useParamState/createQueryParams.ts`

```ts
const reviewParams = createQueryParams({
  keyword: Param.string(),
  page: Param.number(1),
});

reviewParams.configs;           // useParamState(reviewParams.configs)에 넘김
reviewParams.keyword('hello');  // { keyword: 'hello' } → 링크용
reviewParams.page(2);           // { page: 2 }
```

- **configs**: `useParamState`에 그대로 넘긴다.
- **키별 함수**: `키(value)` 형태로 “이 쿼리만 바꾼 객체”를 만들어 `<Link to={...?${queryString}}>` 같은 데 쓴다.

### 3.4 동작 주의 (updateParam과 URL 동기화)

- `setParams`(react-router)는 React batch와 다르게 동작할 수 있어, **연속된 updateParam** 시 이전 갱신이 아직 URL에 반영되지 않을 수 있다.
- 그래서 내부에서 **`document.location.href`의 searchParams**를 기준으로 “이전 URL 상태”를 읽고, `setParams` 호출 후 **짧은 await**로 갱신이 반영될 시간을 두는 구현이 있다.

**정리**: **useParamState** = “configs + Param”으로 **타입·기본값·디코딩**을 한 곳에서 관리하고, **paramUtils / updateParam**으로 읽기·쓰기·초기화·링크 생성을 통일한 훅이다.

---

## 4. 그밖에 자주 쓰는 훅 요약

| 훅 | 용도 | 위치 |
|----|------|------|
| **useBlocker** | `when`일 때 라우트 이탈/브라우저 이탈 방지, `onBlocked`로 확인 UI | useBlocker/useBlocker.ts |
| **useClickOutside** | 특정 ref 바깥 클릭 시 콜백 | useClickOutside/useClickOutside.ts |
| **useInfiniteScroll** | 스크롤 끝 감지로 더 불러오기 | useInfiniteScroll/useInfiniteScroll.ts |
| **useEffectEvent** | 이벤트 핸들러용 “항상 최신 함수” (리렌더 없이) | useEffectEvent/useEffectEvent.ts |
| **useLocalStorage** / **useSessionStorage** | 로컬/세션 스토리지 키 하나를 state처럼 사용 | useStorage/ |
| **useInvalidateQuery** | React Query invalidation을 조건부로 실행 | useInvalidateQuery/ |
| **useGlobalEvent** | window/document 수준 이벤트 등록·해제 | useGlobalEvent/useGlobalEvent.ts |
| **useStateWithDeps** | “특정 deps가 바뀔 때만” state를 초기값으로 리셋 | useStateWithDeps/ |
| **useLazyLoading** | 뷰포트 진입 시 로딩·노출 제어 | useLazyLoading/ |
| **useClarity** | Microsoft Clarity 분석 연동 | useAnalytics/useClarity.ts |

---

## 5. 정리·확장 학습

### 5.1 정리

- **createAtomicContext** → Store + Context + selector로 “필요한 조각만 구독”하는 전역 상태 패턴.
- **useParamState** + **createQueryParams** + **Param** → URL 쿼리를 타입 안전하게 정의·읽기·쓰기·링크 생성.
- 나머지 훅은 **라우팅·DOM·스토리지·이벤트·분석** 등 역할별로 한 가지 일만 하도록 나뉘어 있다.

### 5.2 확장 학습

- **useSyncExternalStore**: React 18에서 “외부 스토어 구독”의 표준. `subscribe` + `getSnapshot`으로 “언제 리렌더할지”를 제어.
- **selector 패턴**: Zustand, Jotai처럼 “store 전체가 아니라 일부만 구독”해 불필요한 리렌더를 줄이는 방식.
- **URL as state**: 검색/필터/페이지네이션을 URL에 두면 공유·북마크·뒤로가기가 자연스럽다는 트레이드오프.

이후 확장 학습 가능 개념: **useTransition과 블로커**, **폼 상태와 URL 상태 동기화**, **애널리틱스 훅의 라이프사이클**.

