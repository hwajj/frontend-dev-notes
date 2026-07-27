# Draft·Edit·ReRegister 세션 분리

> 작성일: 2026-07-27
> 형식: 경량
> 맥락: `job-regist-demo`에서 care 동선을 단순화하며 “신규 작성 중단→재등록→다시 신규 이어쓰기” 충돌을 없애기 위해 상태 저장소를 분리했다.

## 결론

등록 초안(`RegisterDraft`)과 수정/재등록 세션(`EditSession`, `ReRegisterSession`)을 분리하면, 서로의 생명주기가 겹치지 않아 의도치 않은 덮어쓰기와 초기화 충돌을 막을 수 있다. 특히 재등록을 여러 번 거쳐도 신규 Draft는 그대로 유지되어 이어쓰기 UX가 안정된다.

## 학습 주제 · 키워드

- **FE 설계 · 상태 분리**: `draft-vs-session`, `lifecycle-boundary`, `single-source-per-mode`, `state-isolation`
- **상태·데이터 동기화**: `persist-scope`, `memory-working-copy`, `mode-specific-store`

## 이 레포 예문

Draft를 localStorage 1키로 고정해 “신규 등록” 책임을 분리한다.
```ts
// src/store/registerDraft.ts
export const useRegisterDraftStore = create<RegisterDraftState>()(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: 'job-regist-demo:register-draft',
    },
  ),
);
```

재등록 세션은 Draft와 별도 store에서 committed/working만 관리한다.
```ts
// src/store/reRegisterSession.ts
/** RegisterDraft와 완전 분리 */
export const useReRegisterSessionStore = create<ReRegisterSessionState>((set, get) => ({
  session: null,
  start: (sourceJobId, data) => {
    set({ session: { sourceJobId, committed: { ...data }, working: null } });
  },
  // ...
}));
```

## GPT에 물어볼 때

```
React/Zustand 멀티 모드 폼에서 상태 분리 전략을 설명해줘.
내 케이스는 RegisterDraft(localStorage persist)와
EditSession/ReRegisterSession(memory only)을 분리했다.
이 구조에서 생명주기 경계, reset 정책, 경쟁 상태(race) 체크리스트를
실무 기준으로 정리해줘.
```
