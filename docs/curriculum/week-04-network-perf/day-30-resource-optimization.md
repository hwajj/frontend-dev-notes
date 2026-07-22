# Day 30: Resource Optimization

## 키워드

- **CDN** — 사용자와 가까운 Edge에서 정적 자원을 제공해 RTT를 줄임. Origin(S3 등) ↔ Edge 흐름 상세는 **13-3**.
- **Cache** — 브라우저·CDN 캐시로 재요청 비용 절감. `Cache-Control`, `ETag`(→ Day 5).
- **Compression** — gzip/Brotli로 텍스트(JS/CSS/HTML) 전송 크기 축소.
- **Image Optimization** — WebP/AVIF, `srcset`/`picture`, lazy loading.
- **Font Optimization** — FOIT/FOUT, `font-display`, preload, subset.
- **preload / prefetch** — 현재 페이지 중요 자원 vs 다음 항해 예상 자원.

## 개념 정리

### CDN (프론트 관점)

정적 자산을 원 서버만으로 전 세계에 주면 멀리 있는 사용자는 느리다. CDN은 **복사본을 Edge에 두고** 가까운 곳에서 응답한다.

- **Cache Hit** — Edge에 있으면 Origin까지 안 감
- **Cache Miss** — Origin에서 가져와 Edge에 채움
- 배포 후 옛 파일이 보이면: **파일명 해싱**(선호) 또는 **Invalidation**

이 Day는 "왜 CDN이 성능에 필요한가"이고, `S3 → CloudFront → 사용자` 인프라 스토리는 **13-3**.

### 이미지 최적화 ↔ LCP

이미지는 종종 LCP 원소다(→ Day 29).

| 기법 | 하는 일 |
|------|---------|
| WebP / AVIF | 동일 화질에서 용량↓ |
| `srcset` / `picture` | 뷰포트·해상도에 맞는 해상도 제공 |
| `loading="lazy"` | 뷰포트 밖은 지연(LCP 후보는 lazy 금지에 가깝다) |
| 명시 width/height 또는 aspect-ratio | CLS 완화 |

### 폰트 최적화

- **FOIT** — 폰트 로드 전 텍스트 비가시(Invisible)
- **FOUT** — 폴백 폰트로 먼저 보여 준 뒤 교체(Swap)
- `font-display: swap`(또는 optional 등)으로 동작을 고른다
- **preload**로 critical 폰트 우선 로드
- **subset**으로 글리프 수를 줄여 용량↓

### Compression · preload/prefetch

텍스트 자원은 서버/CDN에서 Brotli·gzip. `preload`는 현재 페이지 곧 쓸 자원, `prefetch`는 다음 페이지 후보(우선순위 낮음).

## 면접 포인트

- **Q. preload와 prefetch의 차이는?**
  → `preload`는 **현재 페이지**에서 곧 쓸 중요한 자원(우선순위↑), `prefetch`는 **다음에** 쓸 가능성이 있는 자원(우선순위↓, 유휴 시).
- **Q. 캐시 전략에서 immutable 자원은 어떻게 다루나?**
  → 파일명에 해시를 넣고 `Cache-Control: max-age=31536000, immutable`로 장기 캐싱. 내용 변경 시 파일명이 바뀌어 자연스럽게 갱신(→ Day 5).
- **Q. 이미지 최적화가 성능에 주는 영향은?**
  → 보통 페이지에서 이미지가 가장 큰 용량 → LCP·전송량에 직접적. 포맷·사이즈·지연 로딩이 핵심.
- **Q. FOIT와 FOUT는?**
  → FOIT는 로드 전 글자 숨김, FOUT는 폴백으로 먼저 표시. `font-display`로 정책을 고른다.

## 목표

- 캐시/압축/CDN으로 전송 비용을 줄이는 전략을 설명할 수 있다.
- 이미지·폰트 최적화가 Core Web Vitals(Day 29)에 미치는 영향을 연결한다.
- preload/prefetch를 상황에 맞게 적용하고, CDN 인프라 상세는 13-3로 이어간다.
