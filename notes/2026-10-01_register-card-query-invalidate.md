# 카드 등록 후 React Query invalidate

> 작성일: 2026-10-01
> 형식: 경량
> 맥락: `AddTimeRegisterCard` 등록 성공 뒤 추가시간 신청 화면으로 돌아갈 때 결제 카드 목록을 갱신하려고.

## 결론

등록 API 성공 후 `queryClient.invalidateQueries({ queryKey: addTimePayCardsQueryKey })`로 목록 쿼리를 무효화한다. 삭제 쪽(`AddTimeApply`)은 mock이 아니면 `setQueryData`로 optimistic 제거 — 등록은 서버가 id를 주므로 invalidate가 단순하다. 쿼리 키는 `addTimePayCardsQueryKey = ['addTime', 'payCards']` 한 곳(`addTimePayCardApi.ts`)에 SSOT.

## 학습 주제 · 키워드

- **TanStack Query**: `invalidateQueries`, `setQueryData`, queryKey 상수
- **캐시 갱신 전략**: POST create → invalidate vs DELETE → setQueryData

## 이 레포 예문

등록 성공 시 invalidate 후 toast·`navigate(..., { replace: true })`.

```200:214:src/components/component/addTime/AddTimeRegisterCard.tsx
	const onSubmit = async () => {
		// ...
			const message = await registerAddTimePayCardApi(payload)
			await queryClient.invalidateQueries({ queryKey: addTimePayCardsQueryKey })
			showToast(message)
			setTimeout(() => {
				navigate(buildAddTimeApplyPath(jobId), { replace: true })
			}, 800)
```

신청 화면은 같은 키로 `useQuery` (`AddTimeApply.tsx`).

## GPT에 물어볼 때

```
React Query v5에서 POST로 리소스 생성 후 목록을 맞출 때
invalidateQueries vs setQueryData로 새 항목을 붙이는 기준을 알려줘.
우리 키는 ['addTime','payCards'] 이고 등록 화면은 create API만 호출한 뒤 invalidate 한다.
삭제는 setQueryData filter 로 처리 중이야.
```
