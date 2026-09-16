# SPA back vs WebView 종료

> 작성일: 2026-09-16
> 형식: 경량
> 맥락: care detail 헤더 뒤로가기에서 goBackOrPageFinish 사용 배경을 브릿지와 함께 정리

## 결론

WebView 안 SPA에서 “뒤로”는 브라우저 history와 **네이티브 화면 닫기(`pageFinish`)** 가 다르다. SPA에 쌓인 진입/referrer가 있으면 `history.back()`, 없으면 브릿지로 웹뷰를 닫는다. API 훅의 `close-webview`도 같은 `pageFinish`로 수렴한다.

## 학습 주제 · 키워드

- **Navigation stack 경계**: SPA history, WebView Activity finish
- **History state idx / referrer**: goBack vs terminate

## 이 레포 예문

뒤로갈 수 있으면 SPA back, 아니면 네이티브 종료.

```658:670:c:\Users\yojic\projects\protector\care\src\app\constants\utils.ts
export function goBackOrPageFinish() {
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  const canGoBackInSpa = typeof idx === 'number' && idx > 0;
  const canGoBackByReferrer = Boolean(document.referrer);
  if (canGoBackInSpa || canGoBackByReferrer) {
    history.back();
  } else {
    pageFinish();
  }
}
```

## GPT에 물어볼 때

```
하이브리드 WebView 안에서 SPA history.back()과 네이티브 pageFinish(웹뷰 종료)를 언제 써야 하는지 설명해줘.
우리는 history.state.idx > 0 또는 document.referrer면 back, 아니면 pageFinish.
React Router history v5 idx, location.href 풀 로드 후 idx=0인 경우, referrer만 믿을 때의 함정까지.
기존 SPA push vs replace와 어떻게 맞춰야 하는지도.
```
