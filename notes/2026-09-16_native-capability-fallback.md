# 네이티브 기능 버전 게이트·폴백

> 작성일: 2026-09-16
> 형식: 경량
> 맥락: aiChatbotLink 웹 선배포 시 구앱 호환 분기를 care/carenation 코드에서 확인

## 결론

웹만 먼저 나가면 구앱에서 새 브릿지가 없다. **메서드 존재 여부 + 최소 앱 버전**을 둘 다 보고, 실패하면 구 API(`aiChatbot`)로 폴백한다. iOS 버전 비교는 정책(초과만 신규)에 맞춰 기준 문자열을 올린다.

## 학습 주제 · 키워드

- **Capability detection**: `typeof fn === 'function'`, handler 존재
- **Feature gating / fallback**: 앱 버전, 구·신 API 분기

## 이 레포 예문

존재 검사 → 버전 → 신규/구 호출.

```63:125:c:\Users\yojic\projects\protector\care\src\app\constants\utils.ts
export function hasNativeAiChatbotLink(): boolean {
  // android: typeof androidHandler?.aiChatbotLink === 'function'
  // ios: !!iosDevice('aiChatbotLink')
}
export function supportsAiChatbotLinkNative(): boolean {
  if (!hasNativeAiChatbotLink()) return false;
  return isCurrentVersionBiggerThen('3.4.58', '1.7.15');
}
export function openAiChatbotWithPath(path: string = '/app') {
  if (supportsAiChatbotLinkNative()) aiChatbotLink(path);
  else aiChatbot();
}
```

## GPT에 물어볼 때

```
모바일 하이브리드에서 웹 선배포 + 네이티브 브릿지 폴백 패턴을 설명해줘.
우리는 (1) window에 메서드/handler 존재 검사 (2) LocalStorage APP_VERSION으로 Android/iOS 최소 버전 비교 후 신규 aiChatbotLink, 아니면 구 aiChatbot.
버전 비교 함정(semver, iOS "초과만 신규" 정책), 존재만 보고 버전을 안 보면 생기는 문제까지.
```
