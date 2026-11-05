# 클라이언트 persist — 첫 렌더를 저장값과 맞추기

> 작성일: 2026-11-05
> 형식: 경량
> 맥락: app-birthcare 동료 커밋(7dea754)에서 Recoil+localStorage 깜빡임을 default 쪽 읽기로 해결한 패턴을, 라이브러리에 덜 묶인 형태로 남김.

## 결론

브라우저 저장소에서 복원할 때 **「기본값으로 한 번 그린 뒤, 나중에 저장값으로 덮어쓰기」**가 있으면 첫 paint가 저장 상태와 어긋난다. **초기 스냅샷은 구독 직전(Recoil atom default, store init, query initialData 등)에서 동기적으로 맞추고**, 이후 레이어(effect, onSet, subscribe)는 **변경분만 디스크에 쓰는 역할**로 두는 게 실무 공통 축이다. 저장값 파싱 실패·스키마 불일치는 fallback과 merge 정책을 default 로더 한곳에 모은다.

## 학습 주제 · 키워드

- **클라이언트 상태 복원과 첫 paint**: `two-phase init`, `hydration flicker`, `initial snapshot`, `persist on write`
- **Recoil atom effect**: `readLocalStorage`, `saveLocalStorage`, `setSelf`, `onSet`, `atom default`

## 이 레포 예문

동료 수정 방향: `@setting`에서 effect의 `setSelf(JSON.parse(...))`를 제거하고, 각 atom `default`에서 `readLocalStorage`로 같은 key를 읽는다(커밋 7dea754, `app-birthcare`).

```ts
// src/atom/@setting.ts (수정 후 요지)
export function readLocalStorage<T>(key: string): T | null {
  /* getItem + parse, 실패 시 null */
}

export const saveLocalStorage =
  <T>(key: string): AtomEffect<T> =>
  ({ onSet }) => {
    onSet((newValue, _, isReset) => {
      isReset ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };
```

```ts
// src/atom/pageAnimationAtom.ts — default만 저장값, effect는 쓰기만
default: loadPageAnimation(), // readLocalStorage + enum 검증
effects: [saveLocalStorage('pageAnimation')],
```

## GPT에 물어볼 때

```
Recoil atom + localStorage persist에서 effect setSelf vs atom default에서 readLocalStorage 차이를
「두 단계 초기화 → 첫 paint 불일치」 관점으로 설명해줘.
Zustand persist / TanStack Query initialData / Next hydration과 같은 트레이드오프 축으로 비교해줘.
우리는 birthcare SPA, Recoil atom 여러 개가 saveLocalStorage effect를 씀.
```
