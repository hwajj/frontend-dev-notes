# cross-origin·iframe·postMessage

> 작성일: 2026-06-30
> 맥락: 부모 페이지에 챗봇을 `<iframe>`으로 넣었는데, 부모 JS에서 iframe 안의 React 함수를 **직접 호출**하려다 막히거나, 반대로 embed가 준비됐는지 **알림만** 보내야 할 때
> 본문 주제: same-origin·cross-origin·iframe 격리·postMessage
> 관점: 탭이 다른데 왜 직접 함수 호출이 안 되나
> 범위: 로컬 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- iframe 안의 `App` 함수를 부모에서 `iframe.contentWindow.foo()`로 부르면 왜 안 되나?
- 같은 도메인인데도 **샌드박스** 때문에 막히는 경우는?
- 준비 완료를 알릴 때 `postMessage`는 **누구에게** 무엇을내나?

## 핵심 정리 (결론부터)

| 관계 | 부모 → 자식 DOM/JS 직접 접근 | 창 간 통신 |
|------|------------------------------|-----------|
| **same-origin** (스킴·호스트·포트 동일) | 대체로 가능 (`contentWindow`) | postMessage도 가능 |
| **cross-origin** (도메인·포트 다름) | **불가** (보안 예외) | **postMessage** 등 제한된 채널 |
| **file:// vs https://** | cross-origin 취급 | postMessage + origin 검증 필수 |

한 줄 결론: 출처(Origin)가 다르면 **객체 공유가 아니라 메시지**로만 협력한다.

## 배경 지식 (짧게만)

- **브라우저 탭**: 각 탭은 자기 **JavaScript 세계**(전역 객체, DOM, 메모리)를 갖는다.
- **iframe**: 탭 안에 **또 다른 문서(미니 탭)** 를 넣는다. src가 다르면 **별도 Origin**일 수 있다.
- **Origin**: `https://example.com:443`처럼 **프로토콜 + 호스트 + 포트** 묶음. “같은 사이트인가” 판별에 쓴다.

## 한눈에

### 시나리오 A — same-origin (직접 접근 가능)

```
부모: https://shop.com/page
iframe src: https://shop.com/embed/chat
        ↓
부모 JS: iframe.contentWindow.someApi()  ← 같은 Origin이라 허용
```

### 시나리오 B — cross-origin (직접 접근 차단)

```
부모: https://shop.com/page
iframe src: https://chat.cdn.com/embed
        ↓
부모 JS: iframe.contentWindow.React...  ← SecurityError
        ↓
대신: iframe.contentWindow.postMessage({ type: 'OPEN' }, 'https://chat.cdn.com')
      embed 쪽: window.addEventListener('message', handler)
```

### 시나리오 C — embed가 부모에게 “준비됨” 알림

```
embed (자식): window.parent.postMessage({ type: 'CHAT_READY' }, '*')
부모: addEventListener('message', e => { if (e.data.type === 'CHAT_READY') ... })
```

`*`는 **어디든 보낸다**는 뜻이지 “검증 없이 받아도 된다”는 뜻이 아니다. **수신 쪽에서 `event.origin`을 검사**해야 한다.

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| Origin | URL에서 출처를 식별하는 단위 (스킴+호스트+포트) |
| same-origin | 두 URL의 Origin이 완전히 같음 |
| cross-origin | Origin이 다름 — 브라우저가 접근을 제한 |
| iframe | HTML 안에 다른 문서를嵌入하는 요소 |
| postMessage | 서로 다른 창이 **구조화된 메시지**를 주고받는 브라우저 API |
| `event.origin` | 메시지를 **보낸 쪽**의 Origin (수신 시 검증용) |

---

## 관점

iframe 문제는 “React props가 안 내려가서”가 아니라 **보안 경계** 문제다. 부모와 embed가 **같은 배포 단위·같은 Origin**이 아니면, 컴포넌트처럼 함수를 붙이는 모델을 포기하고 **메시지 계약**(type, payload, 허용 origin)을 먼저 정한다. `CHAT_READY` 같은 타입명은 그 계약의 일부일 뿐, 학습 포인트는 **왜 메시지밖에 답이 없는지**다.

## 한 줄 요약

cross-origin iframe은 **DOM·JS 직접 접근이 막히므로**, `postMessage`로 **작은 JSON 계약**만 주고받는다.

## 함정 한 가지

`postMessage(data, '*')`로 보내고 **수신 쪽에서 origin을 안 보면**, 악의적인 다른 사이트가 iframe에 가짜 설정을 넣을 수 있다. 개발 편의용 `*`는 **로컬에서만** 쓰고, 운영에서는 **부모·자식 URL을 고정해 `targetOrigin`과 `event.origin`을 맞춘다**.

## 언제 발생하나 (조건)

다음이 **모두** 해당하면 “직접 함수 호출”은 기대하면 안 된다.

- 챗봇·결제·지도 등을 **외부 도메인** iframe으로 넣음
- 또는 메인 사이트와 embed **포트가 다름** (로컬 `5173` vs `4173` 등)
- 부모가 자식의 **내부 state·함수**에 접근하려 함

## 왜 존재하나 (목적)

웹은 악성 사이트가 `bank.com`을 iframe에 넣고 사용자 입력을 훔치는 **클릭재킹**, 다른 탭의 DOM을 읽는 **데이터 탈취**를 막아야 한다. **동일 출처 정책(SOP)** 은 “다른 Origin의 문서는 내 JS가 마음대로 건드리지 못하게” 하는 규칙이다. CORS는 **네트워크 요청**에, SOP는 **DOM·창 접근**에 가깝다.

postMessage는 그 벽을 **의도적으로 뚫는 공식 구멍**이다. “아무 객체나 넘기지 말고, **직렬화 가능한 메시지**만 보내라”는 전제가 있다.

## 도구·경로 비교

| 방법 | cross-origin에서 | 비고 |
|------|------------------|------|
| `iframe.contentWindow.fn()` | ❌ | same-origin만 |
| `postMessage` | ✅ | 계약·origin 검증 필요 |
| URL query / hash로 설정 전달 | △ | 새로고침·노출·길이 제한 |
| 공통 백엔드 세션만 공유 | ✅ | UI 연동은 메시지·URL로 별도 |

Postman·curl은 이 논의 밖이다. **브라우저 안의 두 문서** 사이 규칙이다.

## 설정/라우팅을 안 한 경우 (증상)

- 콘솔 `SecurityError: Blocked a frame with origin "..." from accessing a cross-origin frame`
- 부모에서 iframe 높이·테마를 **JS로 읽으려다** 항상 `null`
- embed는 떴는데 부모는 “아직 로딩 중” — **준비 완료 메시지** 없음

## 왜 postMessage 패턴을 쓰나

1. **준비 신호**: embed React 앱은 비동기 부트스트랩 → `CHAT_READY`로 “이제 메시지 받을 수 있음”
2. **설정 전달**: `CHAT_CONFIG`처럼 타입을 나눠 부모→자식 설정 (cross-origin이면 이 경로가 정석)
3. **느슨한 결합**: embed를 **별도 빌드·별도 호스트**로 배포해도 계약만 유지하면 됨

메시지는 **함수 호출이 아니다**. 수신 쪽 `switch (event.data.type)`으로 **상태 머신**을 돌리는 형태가 일반적이다.

## 참고 코드

일반 패턴 — embed(자식) 쪽:

```javascript
window.addEventListener('message', (event) => {
  // if (event.origin !== 'https://allowed-parent.com') return;
  if (event.data?.type === 'CHAT_CONFIG') { /* ... */ }
});
window.parent.postMessage({ type: 'CHAT_READY' }, '*');
```

부모 쪽은 `iframe.contentWindow.postMessage(...)`로 자식에게 보내고, `window.addEventListener('message', ...)`로 자식 응답을 받는다.

## 이 레포에서는

| 구분 | 내용 |
|------|------|
| 메인 홈페이지 | GTM 등 **추적용 hidden iframe** — 챗봇 embed와 목적이 다름 |
| 튜토리얼 embed 앱 | 마운트 후 `window.parent.postMessage({ type: 'CHAT_READY' }, '*')` 로 준비 알림 |
| embed 설계 | 부모 설정 변경(`CHAT_CONFIG`)은 **무시**하고 고정값 사용 — **단방향·격리** 예시 |

챗봇 본앱이 메인 SPA 안에 **같은 Origin으로 라우트**되어 있으면 iframe 없이 React 트리로 붙는다. **별도 embed 프로젝트**를 쓸 때만 cross-origin + postMessage 이야기가 본격적으로 등장한다.

## 더 볼 것 (선택)

- `sandbox` iframe 속성 — 추가 권한 제한
- `window.opener` / 팝업 간 통신 (같은 postMessage 모델)
- Module Federation vs iframe — 배포 경계 다른 두 가지 접근
