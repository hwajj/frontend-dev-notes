# 스크롤 UI 상태 모델링 — 위치 vs 동작 중

> 작성일: 2026-07-14  
> 맥락: 플로팅 버튼이 조금만 내려도 계속 작아진 채 남는 UX — “얼마나 내렸나”로 상태를 잘못 잡았을 때  
> 본문 주제: 연속 신호(스크롤)를 UI boolean으로 바꿀 때 — threshold · idle · debounce · 네이밍 · 훅 경계 · 모션 동기화  
> 관점: 축소 조건이 **위치**인가, **동작 중**인가  
> 범위: 로컬 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- 스크롤에 반응하는 UI에서 `isScrolled` 같은 boolean은 **무엇을** 뜻해야 하나?
- “사용자가 스크롤을 **멈췄다**”는 브라우저 이벤트로 어떻게 아나?
- CSS로 줄어드는 시간과 JS가 true→false로 바꾸는 타이밍이 어긋나면 무엇이 보이나?

## 핵심 정리 (결론부터)

| 방식 | 묻는 것 | 전형적 구현 | 잘 맞는 UX |
|------|---------|-------------|------------|
| A. 위치(threshold) | 얼마나 내렸나 | `scrollY > N` | 헤더 고정·그림자, “맨 위가 아님” |
| B. 동작 중(idle) | 지금 움직이는가 | scroll마다 true → Nms 무입력 후 false | 스크롤 **중만** 축소·숨김, 멈추면 원복 |
| C. 진행률 | 문서의 몇 %인가 | `(scrollY / max)` | 읽기 진행 바 |

한 줄: **증상(계속 작음)은 CSS 버그가 아니라, A로 B UX를 구현한 판별 오류다.**

## 배경 지식 (짧게만)

- **scroll 이벤트**: 화면이 움직일 때 브라우저가 반복 호출. “멈췄다” 이벤트는 없다.
- **threshold**: 어떤 숫자(예: 10px)를 넘었는지로 on/off.
- **idle(유휴)**: 마지막 입력 이후 일정 시간이 지남 → “끝”으로 간주.
- **debounce (trailing)**: 연속 입력 동안은 결과 보류, **조용해진 뒤** 한 번 확정. idle 판정에 자주 씀.
- **throttle**: 일정 간격마다 한 번씩 처리. “매 Nms마다 위치 갱신”에 가깝고, “멈춤” 감지와는 역할이 다름.

## 한눈에

```
[스크롤 연속]──► onScroll ──► true (축소)
                    │
                    └─ clearTimeout + setTimeout(idleMs)
                              │
                    (idleMs 동안 추가 scroll 없음)
                              ▼
                           false (원복)

비교 — 위치만 볼 때:
[scrollY > 10]──► true … 페이지 중간에서 멈춰도 true 유지
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| threshold | 기준선. 넘으면 on |
| idle / idleMs | 마지막 이벤트 후 기다리는 ms |
| trailing debounce | 연속 구간의 **끝**에서 한 번 실행 |
| passive listener | scroll 등에서 `preventDefault` 안 함 → 스크롤 성능에 유리한 옵션 |
| false friend (네이밍) | 이름은 익숙한데 뜻이 다른 boolean (`isScrolled`가 “동작 중”인 척할 때) |

---

## 관점

흔한 착각은 “스크롤 UI면 `scrollY`를 보면 된다”이다. 실제로는 **제품이 원하는 축**을 먼저 고른다.  
“조금 내려가면 작아지고, **손가락/휠이 멈추면** 다시 커진다”면 답은 위치(A)가 아니라 동작 중(B)이다.  
판단 축은 셋이다. **무엇을**(위치·동작·진행률) · **언제**(임계값 vs idle) · **얼마나**(Npx vs Nms).  
라이브러리나 훅 이름보다 이 세 질문이 먼저다.

## 한 줄 요약

연속 입력 UI는 API(`scrollY`)가 아니라 **의도한 상태 축**에 맞춰 boolean을 정의한다.

## 함정 한 가지

변수명을 `isScrolled`로 두면 리뷰어·미래의 나까지 “위치”로 읽는다. 의미는 idle인데 이름이 위치면, 다음 수정자가 다시 `scrollY > 10`으로 “고치기” 쉽다.

---

## 왜 이렇게인가

### 1. 상태 축 — 위치 vs 동작 중

스크롤은 연속 숫자다. UI는 보통 on/off 한 비트만 원한다. 그 비트를 어떻게 자를지가 설계다.

- **위치**: “맨 위에서 벗어났는가” → threshold.
- **동작**: “입력이 진행 중인가” → 이벤트 중 true, idle 후 false.
- **진행률**: 다른 축. 여기선 생략해도 되지만, A/B와 섞지 말 것.

같은 `.scroll` CSS 클래스라도, **언제 붙이느냐**가 UX를 바꾼다.

### 2. 연속 이벤트에서 “멈춤” — idle · debounce

브라우저는 `scrollend`를 일부 환경에서 주기도 하지만, 광범위 호환·단순 패턴은 여전히:

1. 이벤트마다 “진행 중”으로 표시  
2. 타이머를 리셋  
3. 타이머가 만료되면 “유휴”

이것이 trailing debounce와 같은 모양이다.  
throttle은 “너무 자주 그리지 않기”용이지, “멈춤 시각”을 알려 주지 않는다.

검색 키워드(깊게): `debounce vs throttle`, `scroll idle detection`, `requestAnimationFrame scroll`

### 3. 사이드이펙트 훅 경계

window 리스너·타이머는 컴포넌트 JSX 밖에 두는 편이 안전하다.

| 할 일 | 흔한 자리 |
|-------|-----------|
| add/removeEventListener | `useEffect` + cleanup |
| 타이머 ID | `useRef` (리렌더와 무관하게 유지) |
| 화면이 읽는 값 | `useState` |

`disabled`(예: 패널 오픈)면 리스너를 붙이지 않거나 상태를 false로 고정한다.  
검색: `useEffect cleanup`, `useRef setTimeout`, `passive: true scroll`

### 4. CSS 시간과 JS 시간

버튼이 `transition: 0.3s`로 줄어드는데, JS가 80ms 만에 false로 돌리면 애니메이션이 중간에 끊긴 느낌이 난다.  
반대로 idle이 너무 길면 “멈췄는데도 한참 작음”이 된다.  
**모션 duration ≈ idleMs**를 같은 상수(또는 주석으로 대응)로 두는 이유가 여기 있다.

검색: `CSS transition duration JS sync`

### 5. 네이밍 — API가 아니라 의도

| 이름 | 읽히는 뜻 | 실제가 idle이면 |
|------|-----------|-----------------|
| `isScrolled` | 얼마나/이미 내림 | false friend |
| `isScrolling` / `isScrollIdle`의 반대 | 동작 중 | 의도와 맞음 |
| `shrinkFloatingBtn` | UI 의도 | 측정 방법과 분리됨 |

이름은 리팩터·버그의 방향키다. 축을 바꿨으면 이름도 함께 바꾼다.

---

## 참고 코드

일반적으로: 스크롤 중 true → idle 후 false. 타이머는 ref에 보관하고, effect cleanup에서 리스너·타이머를 제거한다.

```ts
const onScroll = () => {
  setIsScrolling(true);
  if (timerRef.current) window.clearTimeout(timerRef.current);
  timerRef.current = window.setTimeout(() => {
    setIsScrolling(false);
    timerRef.current = null;
  }, idleMs);
};
```

이 레포에서는 `idleMs` 기본값을 플로팅 버튼 CSS transition(0.3s)과 맞춘 300으로 두고, 챗봇/계산 패널이 열리면 훅을 비활성화한다.

```ts
const FLOATING_BTN_TRANSITION_MS = 300; // SCSS transition 0.3s 와 대응
// ...
useFloatingBtnScroll({ disabled: chatbotActive || calcOpen });
```

---

## 이 레포에서는

| 개념 | 대응 |
|------|------|
| 잘못된 축(위치) | 예전: `window.scrollY > 10` → 중간에서 멈춰도 축소 유지 |
| 올바른 축(동작) | `useFloatingBtnScroll` → scroll 중 축소, idle 후 원복 |
| 모션 동기화 | `FLOATING_BTN_TRANSITION_MS = 300` ↔ `%floating-btn` 0.3s |
| 연출 끄기 | `disabled: chatbotActive \|\| calcOpen` |
| 이름 잔상 | 호출부는 아직 `isScrolled`로 받을 수 있음 — 의미가 idle이면 리네임 후보 |

경로 힌트: `src/hook/useFloatingBtnScroll.ts`, Footer에서 플로팅 버튼으로 전달.

---

## 더 볼 것 (선택)

- `IntersectionObserver`로 “섹션 진입” — 위치 축의 다른 구현  
- `scrollend` 이벤트 — idle 타이머 대체 가능성·호환성  
- Scroll-driven Animations / ScrollTimeline — CSS만으로 스크롤 연동  
- 오버레이 열릴 때 motion·리스너 정책(접근성·포커스 트랩과 함께)
