# 한 도메인 멀티 SPA — catch-all(`*`)의 범위

> 작성일: 2026-09-29
> 형식: 경량
> 맥락: app-dailycare `path='*'`가 history로 보내는지, CI에서 `/ffff`가 `/`로만 가는 이유를 검증한 세션.

## 결론

`ci_carenation.app.carenation.kr`에서 `/ffff`는 **케어네이션 번들**만 로드되고, carenation의 `*`가 `/`로 보냄. 통합돌봄의 `FallbackRedirect`는 **dailycare JS가 로드된 URL(`/dailycare/...`)** 에서만 실행된다. 서브앱의 aggressive `*`는 통합 배포에서 “전역”이 아니라 **잘못된 index.html을 주는 nginx 설정**일 때만 다른 path를 오염시킨다.

## 학습 주제 · 키워드

- **멀티 SPA on one host**: `location prefix`, `try_files`, `index.html` 선택, 번들 격리
- **React Router catch-all**: `path='*'`, `Navigate replace`, 앱별 폴백 정책

## 이 레포 예문

carenation — 알 수 없는 path는 홈으로만 보냄 (`/ffff` 검증과 일치).

```450:450:C:\Users\yojic\projects\protector\carenation\src\app\index.tsx
                <Route path='*' element={<Navigate replace to='/' />} />
```

app-dailycare — 동일 도메인이어도 이 코드는 dailycare entry가 로드될 때만 돌아감.

```16:20:C:\Users\yojic\projects\app-dailycare\src\App.tsx
const FallbackRedirect = () => {
  if (isLoggedIn()) {
    return <Navigate to={HISTORY_PATH} replace />;
  }
  return <Navigate to='/dailycare/login' replace />;
};
```

## GPT에 물어볼 때

```
한 도메인에 carenation(/)과 app-dailycare(/dailycare) 두 CRA SPA를 nginx location으로 나눠 띄울 때,
/unknown 이 A앱의 React Router path='*'에 걸리는 조건을 단계별로 설명해줘.
내 설정: carenation * → /, dailycare * → login/history. /ffff는 케어네이션 타이틀만 보임.
잘못된 try_files로 dailycare index가 / 에도 내려가면 어떤 증상이 나는지도 짧게.
```
