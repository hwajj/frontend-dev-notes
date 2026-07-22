# Modal — 팩토리 Context와 dispatchModal

> 작성일: 2026-05-29  
> 맥락: React 컴포넌트 밖(HTTP 인터셉터 등)에서도 확인 모달을 띄우고, Center/Bottom처럼 **종류 다른 모달**을 같이 쓰고 싶다.

## 먼저 이것만

1. `useModal` 같은 훅은 **Provider 안**에서만 쓸 수 있다.
2. **Context**로 모달 상태·UI를 모으고, **CustomEvent**로 트리 밖에서 “열어라” 신호를 보낸다.
3. 모달 종류마다 `createModalContext('center', …)`처럼 **팩토리를 한 번 더** 호출한다.

## 이 글의 질문

- axios 콜백에서 어떻게 같은 모달 UX를 쓰나?
- Center/Bottom 모달을 나누려면?

## 핵심 (먼저 읽기)

| 조각 | 역할 |
|------|------|
| `OverlayProvider` | 열린 모달 목록·백드롭·스크롤 잠금 |
| `useModal` | 컴포넌트 안에서 `open({ message })` |
| `dispatchModal(key, data)` | `window`에 이벤트 발행 — **훅 없이** 호출 가능 |
| `DispatchListener` | 이벤트 수신 → `open` 실행 |

## 전제 (30초)

- **React Context**: Provider 아래만 같은 “모달 서비스” 공유.
- **CustomEvent**: `window.dispatchEvent` — React 밖 코드도 발행 가능.
- **명령형 API**: `openAlert('저장됨')`처럼 함수 한 번으로 UI 띄우기.

## 한눈에

```
[컴포넌트 안]
  const modal = useModal()
  modal.open({ message: '저장할까요?' })

[트리 밖 — 예: fetch catch]
  dispatchModal('center', { message: '세션 만료' })
       ↓
  이벤트 이름: 'DISPATCH_MODAL:center'
       ↓
  DispatchListener (Provider 안) → open(...)
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `createModalContext` | Provider·훅·dispatch를 **한 세트**로 만드는 팩토리 |
| `key` | `'center'` / `'bottom'` — 이벤트·Context 구분자 |
| `preventBackdropClose` | 배경 클릭으로 닫기 금지 |

## 함정 한 가지

**착각**: `dispatchModal` 하나로 모든 모달 스타일을 처리한다.  
**실제**: `key`마다 Listener·Overlay가 다르다. Center/Bottom은 **팩토리 두 번** + Provider 두 겹(또는 각각 루트 근처).

## 왜 이렇게인가

Hook 규칙 때문에 비 UI 레이어는 `useModal`을 직접 쓸 수 없다. 전역 이벤트는 Provider 쪽 리스너가 받아 **같은 open 로직**을 탄다. 팩토리로 Context를 나누면 스타일·백드롭 정책을 섞지 않는다. Listener는 `useNonReactivity`로 모달 API 참조를 effect deps에서 빼, 리스너 재등록을 줄인다(EffectEvent 패턴과 동일 계열).

## 실무 체크포인트 — 최소 구현 스케치

### 1) 발행 (어디서든)

```typescript
const MODAL_DISPATCH_EVENT = 'DISPATCH_MODAL';

export function dispatchModal(key: string, detail: { message: string }) {
  window.dispatchEvent(
    new CustomEvent(`${MODAL_DISPATCH_EVENT}:${key}`, { detail }),
  );
}
```

### 2) 수신 (Provider 안에만)

```typescript
function DispatchListener({ modalKey, onOpen }: { modalKey: string; onOpen: (d: any) => void }) {
  useEffect(() => {
    const handler = (e: Event) => onOpen((e as CustomEvent).detail);
    window.addEventListener(`${MODAL_DISPATCH_EVENT}:${modalKey}`, handler);
    return () => window.removeEventListener(`${MODAL_DISPATCH_EVENT}:${modalKey}`, handler);
  }, [modalKey, onOpen]);
  return null;
}
```

### 3) 앱 루트

```tsx
function App() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');

  return (
    <ModalProvider>
      <DispatchListener
        modalKey="center"
        onOpen={(d) => { setMsg(d.message); setOpen(true); }}
      />
      {open && <dialog open><p>{msg}</p></dialog>}
      <Routes />
    </ModalProvider>
  );
}
```

### 4) 트리 밖에서 호출

```typescript
// api/client.ts — React import 없음
dispatchModal('center', { message: '로그인이 필요합니다' });
```

| 증상 | 원인 |
|------|------|
| 이벤트만 가고 모달 안 뜸 | `modalKey` 불일치 / Provider·Listener 미마운트 |
| 두 번 뜸 | Listener 중복 등록 |

## 참고 코드 — 팀 라이브러리 형태

```typescript
// createModalContext가 반환하는 것 (개념)
const [OverlayProvider, useModal, useMountedModal, dispatchModalBound] =
  createModalContext('center', { Overlay, Wrapper });

// dispatchModalBound(data) === dispatchModal('center', data)
```

```typescript
// 발행 한 줄
window.dispatchEvent(
  new CustomEvent('DISPATCH_MODAL:center', { detail: { message: '…' } }),
);
```

## 부록 — backoffice-shared `@backoffice-fe/component`

- `createModalContext(key, Components)` → `[OverlayProvider, useModal, useMountedModal, dispatchModal]`
- `OverlayProvider` 안에 `DispatchListener id={key}`가 붙어 있음.
- 인터셉터에서는 **바인딩된** `dispatchModal` 또는 `dispatchModal(key, …)` 사용.

## 면접 한 줄

「전역 모달 = Context(상태) + CustomEvent(경계 밖 진입); 종류는 **key·팩토리**로 분리한다.」
