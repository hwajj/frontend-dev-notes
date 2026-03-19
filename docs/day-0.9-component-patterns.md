# Day 0.9 — packages/component 패턴 (Modal·Input·withSuspense)

> 이 문서는 `packages/component`의 **Modal·Input·withSuspense**를 한 MD 파일만 보고 이름과 흐름을 익히기 위한 읽기 전용 가이드입니다.  
> 코드까지 포함해 **이 파일 하나만 보고** 전체 구조를 학습할 수 있도록 구성했습니다.

---

## 목차

1. [전체 흐름 요약](#1-전체-흐름-요약)
2. [createModalContext — Modal 컨텍스트·Provider·dispatch](#2-createmodalcontext--modal-컨텍스트providerdispatch)
3. [useModalController — open / replace / close](#3-usemodalcontroller--open--replace--close)
4. [Input — withSuspense + Text·Number·TextArea](#4-input--withsuspense--textnumbertextarea)
5. [withSuspense — lazy + Suspense + forwardRef](#5-withsuspense--lazy--suspense--forwardref)
6. [정리·확장 학습](#6-정리확장-학습)

---

## 1. 전체 흐름 요약

```
Modal
  createModalContext(key, Components)
    → [OverlayProvider, useModal, useMountedModal, dispatchModal]
  useModalController(Context) → { open, replace, close, getId }
  dispatchModal(key, data) → window CustomEvent → DispatchListener에서 open/openWithCancel

Input
  Input.Text / Input.Number / Input.TextArea
    → withSuspense(dynamic import, fallback) 로 코드 스플리팅 + Suspense

withSuspense
  lazy(importFn) + Suspense(fallback) + forwardRef
  → “필요할 때만 로드” + “로딩 중엔 fallback” + ref 전달 가능
```

- **Modal**: `createModalContext`로 “키별 Modal 인스턴스”를 만들고, **Provider**로 감싼 뒤 **useModalController**로 열기/닫기, **dispatchModal**로 트리 외부에서도 열 수 있게 한다.
- **Input**: Text/Number/TextArea를 **withSuspense**로 감싸서 번들 분리 + 로딩 UI를 통일한다.
- **withSuspense**: `lazy` + `Suspense` + `forwardRef`를 한 번에 쓰기 위한 래퍼다.

---

## 2. createModalContext — Modal 컨텍스트·Provider·dispatch

**역할**: “키 하나”에 대해 **OverlayProvider**·**useModal**·**useMountedModal**·**dispatchModal** 네 가지를 묶어서 반환한다. 앱에서 CenterModal·BottomModal처럼 **성격이 다른 모달을 여러 개** 쓸 때, 키별로 나누어 쓸 수 있게 한다.

**위치**: `packages/component/src/Modal/useModalController/OverlayProvider.tsx` (createModalContext는 여기서 export)

### 2.1 시그니처

```ts
export const createModalContext = (
  key: string,
  Components: ModalComponent
): CreateModalContextReturn => [OverlayProvider, useModal, useMountedModal, dispatchModal];
```

- **key**: 이 Modal 인스턴스를 구분하는 값. `dispatchModal(key, data)` 할 때와 CustomEvent 이름 `DISPATCH_MODAL:${key}` 에 쓰인다.
- **Components**: `Container` / `ButtonGroup` / `Resolver` / `Canceler` 등 **UI 껍데기**를 정의한 객체. “어떤 레이아웃·버튼으로 모달을 그릴지”를 정한다.

### 2.2 ModalComponent 타입 (types.ts)

```ts
export interface ModalComponent {
  Container: ContainerElement;   // Body, Buttons 등 감싸는 레이아웃
  ButtonGroup: ButtonGroupElement;
  Resolver: ResolverElement;     // 확인 버튼
  Canceler: CancelerElement;     // 취소 버튼
}

export type OverlayElement = (props: ModalOverlayProps) => JSX.Element | null;
export type ModalOverlayProps = {
  isMounted: boolean;
  isOpen: boolean;
  isClosing: boolean;
  children: ReactNode;
  onClickBackdrop?: (e: MouseEvent<HTMLElement>) => void;
};
```

- **OverlayElement**: `mounted → open → close → unmount` 순서로 전달되는 상태를 받아, 배경·애니메이션을 그리는 컴포넌트 타입이다.

### 2.3 반환값 사용 패턴

```ts
const [OverlayProvider, useModal, useMountedModal, dispatchModal] = createModalContext('center', CenterModalComponents);

// 앱 루트 부근
<OverlayProvider OverlayElement={CenterOverlay} mountDuration={300} preventScroll>
  <App />
</OverlayProvider>

// 모달을 열고 싶은 컴포넌트 (Context 내부)
const modal = useModal();
const id = await modal.open(<ConfirmBody />, () => {}, false);
modal.close(id);

// Context 밖(다른 트리)에서 열고 싶을 때
dispatchModal('center', { content: <ConfirmBody /> });
```

- **useModal** / **useMountedModal**은 **같은 Context(Provider) 아래**에서만 쓸 수 있다.
- **dispatchModal**은 **같은 key**를 쓰는 Provider 아래의 **DispatchListener**가 `window` 이벤트를 듣고, 그 안에서 `useModal`로 open/openWithCancel을 호출한다.

### 2.4 OverlayProvider 내부 흐름 (개념)

- **useOverlayPresence**: mount/open/close/unmount 타이밍과 **mountDuration**을 관리한다.
- **useContentRegistry**: 열린 모달 컨텐츠들을 **id → { element, onBeforeUnmount, preventBackdropClose }** 형태로 들고 있고, mount/update/unmount/unmountAll/isExclusive를 제공한다.
- **DispatchListener**: `DISPATCH_MODAL:${key}` CustomEvent를 구독하고, 이벤트가 오면 `useModal`로 얻은 `open`/`openWithCancel`을 호출해 모달을 띄운다.
- **배경 클릭**: `onClickBackdrop`에서 “preventBackdropClose가 하나도 없을 때만” overlay close → unmount → content unmountAll 한다.

---

## 3. useModalController — open / replace / close

**역할**: **Context에서 받은 overlay·content**를 이용해 “모달 하나 열기/내용 바꾸기/닫기”를 수행하는 **id 기반 API**를 제공한다.  
`useModalController`는 **Context 타입만 인자로 받는** 저수준 훅이고, 보통은 **createModalContext**가 반환하는 **useModal**을 쓰면 그 안에서 이 controller 로직과 결합된 형태로 쓰인다.

**위치**: `packages/component/src/Modal/useModalController/useModalController.ts`

### 3.1 시그니처

```ts
export function useModalController(Context: ModalContext) {
  const controller = useContext(Context);
  // ...
  return { getId, open, replace, close };
}
```

- **open(BaseElement, onBeforeUnmount?, preventBackdropClose?)**:  
  `overlay.mount()` → `overlay.open()` → `content.mount(id, BaseElement, ...)` 순으로 실행하고, **id**를 반환한다.
- **replace(id, BaseElement)**: 해당 id의 컨텐츠만 `content.update(id, BaseElement, ...)`로 바꾼다.
- **close(id)**:  
  - 그 id가 **유일한 컨텐츠**가 아니면 `content.unmount(id)`만 한다.  
  - 유일하면 `overlay.close()` → 필요 시 `overlay.unmount()` → `content.unmount(id)` 한다.

### 3.2 Context가 제공하는 overlay / content

**위치**: `packages/component/src/Modal/types.ts`

```ts
export interface OverlayContextValues {
  overlay: {
    mount(): Promise<boolean>;
    open(): void;
    close(): Promise<boolean>;
    unmount(): void;
  };
  content: {
    mount(id, element, onBeforeUnmount?, preventBackdropClose?): void;
    update(id, element, ...): void;
    unmount(id): void;
    unmountAll(): void;
    isExclusive(id): boolean;
  };
}
```

- **overlay**: “배경/패널”의 생명주기. mount/open과 close/unmount 사이에 **mountDuration**만큼 간격을 두어 애니메이션을 넣을 수 있다.
- **content**: “지금 떠 있는 모달 내용들”을 id별로 관리한다. 여러 개가 동시에 열릴 수 있고, **마지막 하나가 닫힐 때** overlay까지 닫도록 `isExclusive`로 판단한다.

---

## 4. Input — withSuspense + Text·Number·TextArea

**역할**: `Input.Text` / `Input.Number` / `Input.TextArea`를 **동적 import + Suspense**로 감싸서,  
초기 번들에는 포함하지 않고 **첫 렌더 시점에 해당 청크만 로드**하게 한다. 로딩 중에는 **fallback** 컴포넌트를 보여 준다.

**위치**: `packages/component/src/Input/index.tsx`

### 4.1 구조 (개념)

```ts
const FallbackInput = (props: TextInputProps | NumberInputProps) => (
  <input type="text" id={props.id} placeholder={props.placeholder} value={props.value} ... />
);

const Input = {
  Text: withSuspense<TextInputProps, HTMLInputElement>(
    () => import('./Text/TextInput'),
    FallbackInput,
  ),
  Number: withSuspense<NumberInputProps, HTMLInputElement>(
    () => import('./Number/NumberInput'),
    FallbackInput,
  ),
  TextArea: withSuspense<TextAreaProps, HTMLTextAreaElement>(
    () => import('./Text/TextArea'),
    FallbackTextArea,
  ),
};
```

- **첫 번째 인자**: `() => import('...')` 형태의 **동적 import**. 이 경로가 별도 청크로 나뉜다.
- **두 번째 인자**: 로딩 중에 보여 줄 **fallback** 컴포넌트. `withSuspense`는 이를 `(props) => ReactNode`로 받아서, Suspense fallback에 `fallbackRender(props)`를 넘긴다. 그래서 **같은 props를 흉내 낸 플레이스홀더**를 보여 줄 수 있다.

### 4.2 사용 예시

```tsx
import Input from '@backoffice-fe/component/Input';

<Input.Text
  value={keyword}
  onChange={(v, e) => setKeyword(v)}
  placeholder="검색어"
/>
<Input.Number value={count} onChange={(v, e) => setCount(v)} />
<Input.TextArea value={desc} onChange={(v, e) => setDesc(v)} />
```

- **Input**을 쓰는 쪽은 “동적 로드 + Suspense”를 신경 쓰지 않고, 일반 컴포넌트처럼 쓰면 된다.  
- **ref**를 넘기려면 `withSuspense`가 forwardRef를 사용하므로, `Input.Text`에 ref를 줄 수 있다.

---

## 5. withSuspense — lazy + Suspense + forwardRef

**역할**:  
- **lazy(importFn)** 로 컴포넌트를 필요할 때만 로드하고,  
- **Suspense**로 로딩 중에는 **fallbackRender(props)** 결과를 보여 주며,  
- **forwardRef**로 ref를 그대로 Lazy 컴포넌트에 넘길 수 있게 한다.

**위치**: `packages/component/src/utils/withSuspense.tsx`

### 5.1 시그니처

```ts
function withSuspense<P extends Props<any>, R extends HTMLElement>(
  importFn: () => Promise<{ default: ForwardRefExoticComponent<P & RefAttributes<R>> }>,
  fallbackRender: (props: PropsWithoutRef<P>) => ReactNode,
) {
  const LazyComponent = lazy(importFn);
  const ForwardedRef = forwardRef<R, P>((props, ref) => (
    <Suspense fallback={fallbackRender(props)}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
  return ForwardedRef;
}
```

- **importFn**: `() => import('./SomeComponent')` 처럼 **default export**가 `forwardRef`된 컴포넌트인 동적 import.
- **fallbackRender**: **props를 받아서** 로딩 UI를 만든다. 그래서 id/placeholder/value 같은 걸 그대로 쓸 수 있어, 레이아웃이 크게 바뀌지 않는 “스켈레톤” 같은 fallback을 만들기 좋다.

### 5.2 lazy + Suspense만 쓸 때와의 차이

- **lazy + Suspense만** 쓰면 fallback은 보통 “고정된 스피너/플레이스홀더”다.  
- **withSuspense**는 **fallbackRender(props)** 로 “현재 넘어온 props를 반영한” fallback을 줄 수 있어, Input처럼 **같은 자리·비슷한 크기**로 로딩 상태를 보여 주기 편하다.

### 5.3 주의

- `LazyComponent`에 ref를 넘기는 부분은 구현에 따라 `@ts-expect-error`로 처리해 두는 경우가 있다.  
  동적 import되는 쪽이 `forwardRef`를 쓰고, 제네릭이 완전히 맞지 않을 때 타입만 희석시키기 위함이다.

---

## 6. 정리·확장 학습

### 6.1 정리

| 주제 | 요약 |
|------|------|
| **createModalContext** | 키별로 OverlayProvider·useModal·useMountedModal·dispatchModal 네 가지를 묶어서 반환. 여러 “종류”의 모달을 키로 나누어 쓸 수 있음. |
| **useModalController** | Context의 overlay/content를 이용해 open/replace/close를 제공. 보통은 createModalContext가 돌려준 useModal 안에서 사용. |
| **dispatchModal** | 같은 key의 Provider 아래 DispatchListener가 `DISPATCH_MODAL:${key}` 이벤트를 듣고, 트리 밖에서도 모달을 띄울 수 있게 함. |
| **Input** | Text/Number/TextArea를 withSuspense로 감싸서 코드 스플리팅 + 로딩 시 fallback 통일. |
| **withSuspense** | lazy + Suspense(fallbackRender(props)) + forwardRef로 “필요할 때만 로드 + props 기반 fallback + ref 전달”을 한 번에 처리. |

### 6.2 확장 학습

- **React.lazy / Suspense**: 코드 스플리팅과 “비동기 준비”를 선언적으로 다루는 방식.  
  이 레포에서는 withSuspense로 **props 기반 fallback**과 **ref**까지 한 꺼번에 쓰기 위한 패턴으로 정리됨.
- **CustomEvent + window**: 트리 구조에 의존하지 않고 “어디서나” 모달을 열기 위한 이벤트 채널.  
  key로 구분해 여러 모달 유형을 나누는 방식과 맞춰 두었다.
- **Overlay 생명주기**: mount → open / close → unmount 단계를 두어, **mountDuration** 동안만 애니메이션을 넣고 그 다음에 DOM에서 제거하는 패턴.

이후 확장 학습 가능 개념: **Portal과 레이어 순서**, **모달 접근성(focus trap, esc)**, **React의 Concurrent Rendering과 Suspense**.

