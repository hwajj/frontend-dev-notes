# useParamState가 있는 이유

> 작성일: 2026-07-02
> 형식: 경량
> 맥락: `@backoffice-fe/hook`의 `useParamState`를 처음 보며 “버그 때문에 만든 훅인가?”가 헷갈려서, 목적과 나중 fix를 나눠 정리했다.

## 결론

백오피스 **목록 화면**에서 필터·검색·페이지를 URL과 맞추되, 페이지마다 `parseInt`·enum fallback·`Link` 쿼리 조합을 복붙하지 않으려고 만든 훅이다. `setSearchParams` race fix(`50eab3fd`)는 **추가 이후** 내부 `updateParam` 보강이지, 훅을 만든 이유가 아니다.

## 학습 주제 · 키워드

- **URL 상태·React Router**: `useSearchParams`, query string, `replace`, list filter sync
- **FE 설계**: typed URL state, `Param`, `createQueryParams`, shared hook library

## 이 레포 예문

목록 필터 스펙을 한 번 선언하고 읽기·쓰기·링크에 재사용한다.

```tsx
export const reviewParams = createQueryParams({
  keyword: Param.string(),
  page: Param.number(1),
})
const [param, updateParam] = useParamState(reviewParams.configs)
// <Link to={`?${reviewParams.keyword('hello')}`} />
```

`plans/프론트엔드_아키텍처_설계`의 `useListParams`와 같은 계열(새 앱 이름 vs 이 레포 훅 이름).

## GPT에 물어볼 때

```
백오피스 SPA에서 목록 필터·페이지네이션을 URL과 동기화할 때
useSearchParams만 쓰는 방식 vs 커스텀 훅(타입·validator·Link 헬퍼)으로 묶는 방식을 비교해줘.
팀 공유 라이브러리로 빼는 기준(반복 횟수, encode 규칙, 테스트)도 짧게 정리해줘.
```
