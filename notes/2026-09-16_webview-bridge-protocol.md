# Web↔Native WebView 브릿지 규약

> 작성일: 2026-09-16
> 형식: 경량
> 맥락: Protector WebView에서 Android/iOS 네이티브 호출 경로를 코드로 확인한 세션

## 결론

하이브리드에서 “브릿지”는 UI가 아니라 **Web→Native 호출 규약**이다. 웹은 OS별로 `AndroidApp.메서드` / `webkit.messageHandlers.이름.postMessage`를 맞추고, 네이티브는 같은 이름·페이로드로 받는다.

## 학습 주제 · 키워드

- **JavascriptInterface / WKScriptMessageHandler**: `AndroidApp`, `messageHandlers`, `postMessage`
- **UA로 WebView 판별**: `connectionType/webview`, `osCheck`

## 이 레포 예문

웹이 Android/iOS 핸들러를 고르는 진입점.

```132:145:c:\Users\yojic\projects\protector\care\src\app\constants\utils.ts
export function androidDevice() {
  const messageHandler = (window as any).AndroidApp;
  return messageHandler;
}
export function iosDevice(functionName: string) {
  const messageHandler = (window as any).webkit && (window as any).webkit.messageHandlers && (window as any).webkit.messageHandlers[functionName];
  return messageHandler;
}
```

네이티브는 `WebViewBridge`를 `AndroidApp`으로 주입한다.

```847:847:c:\Users\yojic\projects\android\carenation\app\src\main\java\kr\carenation\protector\ui\WebViewActivity.kt
view.addJavascriptInterface(WebViewBridge(this, pref, webViewBridgeCallback), "AndroidApp")
```

## GPT에 물어볼 때

```
하이브리드 앱 WebView 브릿지를 설명해줘.
우리 웹은 Android: window.AndroidApp.fn(), iOS: webkit.messageHandlers.fn.postMessage(obj).
UA에 connectionType/webview로 osCheck 한다.
JavascriptInterface와 WKScriptMessageHandler 차이, 페이로드를 문자열/객체로 맞출 때 흔한 깨짐, Native→Web 콜백 패턴까지 이어서.
```
