# useBlocker — 폼 작성 중 나가기 막기

> 작성일: 2026-05-29  
> 맥락: 저장 안 한 폼에서 다른 메뉴로 가면 막고 싶은데, **제출 실패 후**에는 막지 말아야 하거나, 막을 때 **스크롤이 튄다**.

## 먼저 이것만

1. React Router **`useBlocker`** — SPA **안**의 라우트 전환만 가로쌈 (탭 닫기는 별도).
2. `when: true`면 pathname이 바뀔 때 `blocked` → 사용자 확인 → `proceed()` / `reset()`.
3. 예외 한 번 통과는 **`disable()` ref**로, 스크롤 튐은 **scrollY 저장·복원**으로 완화.

## 이 글의 질문

- `when={isDirty}`만으로 충분한가?
- 제출 실패 직후 `navigate`는 왜 막히나?

## 핵심 (먼저 읽기)

| 레이어 | 막는 것 |
|--------|---------|
| `useBlocker` | 같은 앱 안 **다른 pathname**으로 이동 |
| `beforeunload` | 탭 닫기·새로고침 (브라우저 기본 확인, 문구 커스텀 제한) |
| `ignoreBlocked` ref | 이번 전환만 blocker **무시** |

## 전제 (30초)

- **SPA**: 페이지 전체 새로고침 없이 URL만 바뀜.
- **dirty**: 입력이 초기값과 다름.
- **blocked 상태**: Router가 전환을 보류 — `proceed()` 할 때까지.

## 한눈에

```
사용자: 사이드바 /orders → /settings 클릭
  shouldBlock: when && !ignoreBlocked && pathname 변경
  → state === 'blocked'
  → onBlocked({ proceed, reset })  // 확인 모달
  → 확인 시 proceed(), 취소 시 reset()

제출 onError 후 navigate:
  blocker.disable()  // ref만 true — 다음 전환은 통과
  navigate('/list')
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `proceed` | 막아 둔 네비게이션 **계속** |
| `reset` | 전환 **취소**, 현재 페이지 유지 |
| `enable` / `disable` | ref로 blocker 일시 on/off |

## 함정 한 가지

**착각**: `setIsDirty(false)`만 하면 제출 실패 후 이동이 항상 된다.  
**실제**: state 업데이트 **전에** `navigate`가 호출되면 여전히 `when === true` — **`disable()` 한 번**이 더 확실하다.

## 왜 이렇게인가

Blocker는 boolean 조건만 본다. “검증 실패 후에는 나가도 됨” 같은 **일회성 예외**는 ref가 적합하다(리렌더 없이 즉시). 스크롤 점프는 blocker가 전환을 막는 순간 레이아웃·포커스가 바뀌며 `scrollY`가 튀는 UX 이슈에 대한 방어다.

## 실무 체크포인트

### 소비 코드 예 (개념)

```tsx
function OrderFormPage() {
  const [dirty, setDirty] = useState(false);
  const navigate = useNavigate();

  const { disable } = useBlocker({
    when: dirty,
    withBeforeUnload: true,
    onBlocked: ({ proceed, reset }) => {
      openConfirm({
        message: '저장하지 않고 나가시겠습니까?',
        onOk: proceed,
        onCancel: reset,
      });
    },
  });

  const handleSubmit = async () => {
    try {
      await saveOrder();
      setDirty(false);
      navigate('/orders');
    } catch {
      disable(); // 이번만 blocker 끔
      navigate('/orders'); // 검증 실패 후 목록으로
    }
  };

  return <form onChange={() => setDirty(true)}>...</form>;
}
```

### shouldBlock 조건 (요지)

```typescript
const shouldBlock = ({ currentLocation, nextLocation }) =>
  !ignoreBlocked.current &&
  when &&
  currentLocation.pathname !== nextLocation.pathname;
```

### 확인 방법

1. 입력 후 다른 메뉴 클릭 → 확인 모달 뜨는지.  
2. `disable()` 후 `navigate` → 막히지 않는지.  
3. 입력 후 탭 닫기 → `withBeforeUnload` 시 브라우저 확인창.

| 증상 | 원인 |
|------|------|
| 막히지 않음 | `when` false / 같은 pathname |
| 나가기 막힘만 있고 탭 닫기는 됨 | `beforeunload` 미설정 |
| 화면이 위로 튐 | scroll 복원 로직 없음 |

## 참고 코드 — 스크롤·ref (요지)

```typescript
const ignoreBlocked = useRef(false);
const scrollY = useRef<number | null>(null);

// block 직전
scrollY.current = window.scrollY;

// scroll 이벤트에서 복원
if (scrollY.current !== null) {
  window.scrollTo({ top: scrollY.current });
  scrollY.current = null;
}
```

## 부록 — backoffice-shared

`@backoffice-fe/hook`의 `useBlocker` — Router `useBlocker` + `useGlobalEvent`(beforeunload, scroll) + `enable`/`disable` 반환.

## 면접 한 줄

「네비게이션 가드는 boolean 하나로 끝나지 않고, 일회 예외·탭 이탈·스크롤 UX를 각각 다룬다.」
