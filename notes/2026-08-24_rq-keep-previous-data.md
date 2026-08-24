# keepPreviousData로 필터 전환 UX

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: 완료 탭에서 closed↔complete 토글 시 목록이 빈 화면으로 깜빡이는 문제

## 결론

`keepPreviousData: true`면 queryKey가 바뀌어도 **이전 query의 data를 placeholder**로 보여준다. 새 fetch가 끝날 때까지 `closed` 목록이 남아 깜빡임이 없고, `isPreviousData`로 “옛 데이터를 보여 중”임을 구분한다.

## 학습 주제 · 키워드

- **React Query placeholder**: `keepPreviousData`, `isPreviousData`, `placeholderData`

## 이 레포 예문

```ts
// useJobList.ts
const query = useQuery({
  queryKey: jobKeys.list(filter),
  queryFn: () => jobRepository.getList(filter),
  keepPreviousData: true,
});
```

## GPT에 물어볼 때

```
v4 keepPreviousData와 v5 placeholderData(prev => prev) 마이그레이션 차이.
필터·페이지네이션 UI에서 keepPreviousData 쓸 때
잘못된 데이터가 잠깐 보이는 함정과 완화 패턴 알려줘.
```
