# 탭 간 통신 (postMessage · storage 이벤트)

## 키워드

- **storage 이벤트** — 다른 탭에서 `localStorage`가 바뀌면 발생. **같은 탭에서는 안 발생**하는 게 함정.
- **BroadcastChannel** — 같은 출처의 탭/워커 간 메시지 브로드캐스트. 탭 간 상태 동기화에 깔끔.
- **postMessage** — 창/iframe 간 메시지. 크로스 오리진 통신의 표준 통로.
- **iframe messaging** — 부모↔iframe 통신. `origin` 검증 필수(보안).
- **same-tab 알림 트릭** — storage 이벤트가 안 오는 같은 탭은 커스텀 이벤트로 보완.

## 면접 포인트

- **Q. `storage` 이벤트로 같은 탭 동기화가 안 되는 이유는?**
  → 스펙상 storage 이벤트는 "다른" 문서에만 발신된다. 같은 탭은 직접 상태 갱신하거나 커스텀 이벤트/BroadcastChannel로 처리.
- **Q. postMessage 사용 시 보안 주의점은?**
  → 수신 측에서 `event.origin`을 반드시 검증하고, `targetOrigin`을 `*` 대신 명시. 안 그러면 크로스 오리진 공격 노출.
- **Q. 탭 간 로그인/로그아웃 동기화는?**
  → 인증 상태 변경 시 BroadcastChannel/storage로 알려 다른 탭도 갱신(→ 인증 3층 구조와 연결).

## 관련 실무 노트

- `notes/2026-07-13_same-tab-storage-notify.md`
- `notes/2026-06-30_cross-origin-iframe-messaging.md`
- `notes/2026-07-07_cart-localstorage-sync.md`

## 목표

- storage 이벤트의 "같은 탭 미발신" 함정을 설명하고 우회할 수 있다.
- BroadcastChannel/postMessage로 탭·iframe 간 통신을 구현한다.
- postMessage origin 검증 등 보안 수칙을 적용한다.
