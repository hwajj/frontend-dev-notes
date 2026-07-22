# 네트워크 심화 (TCP · TLS · HTTP/2·3 · DNS)

## 키워드

- **TCP / UDP** — 신뢰성 연결(TCP) vs 비연결·저지연(UDP). 3-way handshake.
- **TLS** — 암호화·인증서. HTTPS의 기반. 핸드셰이크 비용.
- **HTTP/1.1 vs 2 vs 3** — HOL 블로킹, 멀티플렉싱(2), QUIC/UDP 기반(3).
- **DNS** — 도메인→IP 변환. 조회 지연·캐시·레코드(A/CNAME).
- **로드밸런싱** — 트래픽 분산(L4/L7).

## 면접 포인트

- **Q. HTTP/2가 1.1보다 빠른 이유는?**
  → 하나의 연결에서 멀티플렉싱으로 여러 요청 동시 처리 → HOL 블로킹 완화, 헤더 압축(HPACK).
- **Q. HTTPS 핸드셰이크가 성능에 주는 영향과 완화는?**
  → 초기 왕복 비용. TLS 1.3·세션 재개·HTTP/2로 완화. TTFB(→ Web Vitals)와 연결.
- **Q. DNS가 첫 로드 지연에 어떻게 영향 주나?**
  → 조회 왕복이 추가된다. `dns-prefetch`/`preconnect`로 미리 해결 가능.

## 관련 실무 노트

- `notes/2026-06-30_rest-vs-websocket.md`

## 목표

- TCP/TLS/HTTP 버전 차이를 성능 관점에서 설명한다.
- DNS 조회가 로드에 미치는 영향과 최적화를 안다.
- 로드밸런싱의 기본 개념을 이해한다.
