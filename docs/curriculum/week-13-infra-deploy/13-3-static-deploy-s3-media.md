# 정적 배포 · S3 · CDN(CloudFront) · 미디어

## 키워드

- **정적 배포** — 빌드된 HTML/JS/CSS를 정적 호스팅(자체 서버·S3·CDN).
- **객체 스토리지(S3)** — Origin에 가까운 역할. 버킷에 객체 저장·권한·퍼블릭/서명 URL.
- **CDN (CloudFront 등)** — Edge 캐시. 사용자와 가까운 PoP에서 응답.
- **Origin** — Edge가 없을 때(또는 miss 시) 가져오는 원본(S3, ALB 등).
- **Cache Hit / Miss** — Edge에 있으면 Hit, 없으면 Origin fetch 후 채움.
- **Invalidation** — Edge 캐시를 강제로 무효화. 비용·전파 지연이 있어 **파일명 해싱**이 우선인 경우가 많음.
- **Compression** — Edge/Origin에서 gzip·Brotli.
- **미디어** — 대용량은 앱 서버 대신 객체 스토리지+CDN에 위임.

## 핵심 흐름

```
사용자
  ↓
CloudFront (Edge Cache)  ← Cache Hit면 여기서 응답
  ↓ Miss
S3 (Origin) / 미디어 버킷
```

왜 S3만 안 쓰고 CDN을 앞에 두나?

1. **지연** — 사용자 ↔ 가까운 Edge
2. **Origin 부하·대역폭** — Hit가 많을수록 S3/서버 부담↓
3. **HTTPS·압축·캐시 헤더**를 엣지에서 일관 적용하기 쉬움

프론트 리소스 전략(해시·이미지·폰트)은 **Day 30**, 이 문서는 **배포 인프라에서 그 캐시가 어디에 사는지**.

### Invalidation vs 파일명 해싱

| 방식 | 감각 |
|------|------|
| 해시 파일명 (`app.abc.js`) | URL이 바뀌어 새 객체 → 캐시 충돌 거의 없음. HTML만 짧게 캐시 |
| Invalidation | 같은 URL을 Edge에서 지움. 긴급 롤백·HTML에 유용, 남용은 비용·실수 |

### 미디어

HTML/API는 앱·Nginx, 큰 동영상·이미지는 S3(+CDN). Presigned URL 업로드는 **11-2**.

## 면접 포인트

- **Q. S3 앞에 CloudFront를 두는 이유는?**
  → Edge 캐시로 지연·Origin 부하를 줄이고, 전역 사용자에게 가까운 응답을 준다.
- **Q. Cache Hit과 Miss는?**
  → Hit는 Edge에 있어 Origin까지 안 감. Miss는 Origin에서 가져와 Edge에 채운 뒤 응답.
- **Q. 배포 후 옛 JS가 보이는 이유는?**
  → CDN/브라우저 캐시. 해시 파일명 + HTML 짧은 TTL, 필요 시 Invalidation.
- **Q. S3 파일이 403이 뜨는 흔한 원인은?**
  → 버킷/객체 권한·OAI/공개 정책·서명 URL 만료. CDN Origin 설정도 확인.
- **Q. HTML은 서버, 큰 동영상은 S3로 나누는 이유는?**
  → 앱 서버가 대용량을 직접 서빙하면 대역폭·부하 부담. 객체 스토리지+CDN에 위임.

## 관련 실무 노트

- `notes/2026-06-11_ubuntu-deploy-s3-media.md`

## 목표

- `S3 → CloudFront → 사용자` 흐름과 Hit/Miss를 설명할 수 있다.
- Invalidation과 파일명 해싱 전략을 비교한다.
- 정적 자산·미디어의 Origin/CDN 역할 분담을 Day 30과 연결한다.
