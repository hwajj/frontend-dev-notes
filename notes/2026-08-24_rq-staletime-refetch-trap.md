# staleTime vs refetchOnMount always 함정

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: care 앱 설정을 그대로 베끼면 dailycare의 60초 캐시 정책이 깨짐

## 결론

`staleTime: 60000`만 걸어도 `refetchOnMount: 'always'`면 **마운트마다 무조건 재요청**해서 staleTime이 사실상 무의미해진다. dailycare는 `refetchOnMount`를 기본값(true, stale 존중)으로 두고 `refetchOnWindowFocus: false`만 끈다.

## 학습 주제 · 키워드

- **React Query staleTime**: `staleTime`, `refetchOnMount`, `refetchOnWindowFocus`, `fresh vs stale`

## 이 레포 예문

dailycare 전역 설정 — `always`를 쓰지 않는 이유가 주석으로 남아 있다.

```ts
// queryClient.ts
staleTime: STALE_TIME, // 60000
refetchOnWindowFocus: false,
// refetchOnMount: 기본값 true — 'always' 아님
```

care `useGetCareList`는 `refetchOnMount: 'always'` — 페이지 재진입마다 API 호출.

## GPT에 물어볼 때

```
TanStack Query v4에서 staleTime 60s + refetchOnMount true vs 'always' vs false
각 조합이 마운트·포커스·캐시 hit 시 어떻게 다른지 표로 정리해줘.
care 앱 always 패턴과 dailycare 기본값 패턴의 UX 차이도.
```
