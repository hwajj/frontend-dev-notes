# 히어로 영상 해상도 분기 (PC만)

> 작성일: 2026-06-11
> 맥락: 히어로에 MP4 하나만 쓰는데, 화면 크기·네트워크에 맞춰 작은 파일을 보여주고 싶다. 모바일 Lighthouse가 느린 건 영상 때문이 아니라는 말도 들었다 — PC·모바일을 어떻게 나눠야 하나?
> 범위: 로컬 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- **작은 화면**에 낮은 해상도 영상이면 충분한가?
- S3에 720p·1080p를 올리고 **코드에서 URL만 고르면** 되나?
- 모바일도 영상을 **낮은 해상도로** 틀어야 하나?

## 핵심 정리 (결론부터)

| 구간 | 권장 | 이유 |
|------|------|------|
| **모바일 (<1024px)** | **영상 없음** + 배경 이미지 (현행) | 영상보다 가볍고, 이미 구현됨 |
| **PC 노트북 (~1024–1600)** | **720p** MP4 | 표시 픽셀에 맞추면 충분한 경우 많음 |
| **큰 모니터 (1600+)** | **1080p** | 넓게 보일 때만 |
| **느린 네트워크 / saveData** | **영상 스킵**, 포스터·이미지만 | LCP·데이터 절약 |
| **LCP** | **포스터·정적 이미지가 1순위**, 영상은 idle 후 | 비디오는 LCP 후보로 불리 |

**한 줄:** “작은 기기 = 낮은 해상도 **영상**”이 아니라, **모바일은 영상 자체를 끄고**, **PC 안에서만 720 vs 1080**을 고른다. 제안한 `pickHeroVideoSrc()`는 **이미 PC로 들어온 뒤**의 분기다.

## 배경 지식 (짧게만)

- **`object-fit: cover`**: 영상을 박스에 맞게 잘라 채움 — 4K 원본을 1200px 영역에 써도 눈에는 1080p와 비슷해 보일 수 있음.
- **`devicePixelRatio` (DPR)**: 레티나는 CSS 픽셀 × DPR = 물리 픽셀.
- **`navigator.connection`**: Chrome 등에서 네트워크 품질·`saveData` 힌트 (없는 브라우저도 있음).
- **`requestIdleCallback`**: 브라우저가 한가할 때 콜백 실행 — 히어로 영상을 **첫 페인트 뒤**로 미룸.
- **LCP**: 보이는 가장 큰 요소 — **opacity:0인 비디오**는 LCP에 잘 안 잡힘.

## 한눈에

### 모바일 (Lighthouse Moto G)

```
MainHeroVideo useEffect
  └── matchMedia("(min-width: 1024px)") → false → return
  └── src 설정 없음
mobile.css
  └── video { display: none }
  └── background-image: bg_main_m02/m03.png

  → MP4 요청 0건
```

### PC

```
idle / requestIdleCallback (최대 ~2.5s)
  └── pickHeroVideoSrc()
        ├── saveData / 2g → null (영상 없음)
        ├── innerWidth × DPR ≤ 1920 → 720p URL
        └── 그 외 → 1080p URL
  └── canplay 전 opacity: 0
```

### LCP 권장 패턴 (리뉴얼)

```
[즉시] Server HTML — poster / hero <img priority>
[이후] Client — MainHeroVideo (dynamic, ssr: false)
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `HERO_VIDEO_SRC` | 현재 단일 S3 MP4 URL 상수 |
| `DESKTOP_MQ` | `(min-width: 1024px)` — PC만 영상 |
| `pickHeroVideoSrc` | 뷰포트·DPR·네트워크로 URL 고르는 함수(안) |
| `canplay` | 재생 가능한 만큼 버퍼됐을 때 발생하는 이벤트 |

---

## 한 줄 요약 (정책 한 줄)

표시 **픽셀 수(DPR 포함)**에 맞는 파일 하나만 받고, 모바일은 **영상 대신 이미지**, LCP는 **영상이 아니라 이미지**가 맡는다.

## 함정 한 가지

**“작은 화면 = 480p 영상”**으로 가면 모바일에서 **지금 이미지 배경보다 느려질 수 있다.** 세션에서 말한 “작은 화면에 낮은 해상도”는 **PC 히어로 영역(노트북 vs 대형 모니터)** 을 뜻했다.

## 왜 이렇게인가

같은 해상도라도 **WebM + MP4** 이중 `source`로 용량을 줄일 수 있지만, 루프 히어로 하나면 **720 + 1080 두 파일**이 실무에서 가장 흔하다. HLS는 네트워크에 따라 자동 전환되지만 인코딩·플레이어 비용이 크다 — 마케팅 루프 1개에는 과할 수 있다.

인코딩 가이드 (짧은 루프·무음·autoplay):

| 표시 너비(대략) | 소스 해상도 | 비트레이트 |
|-----------------|-------------|------------|
| ~1280px | 1280×720 | 1~2 Mbps |
| ~1920px | 1920×1080 | 2~4 Mbps |

## 참고 코드

일반적으로 히어로 컴포넌트는 **클라이언트 전용**으로 두고, `src`를 조건에 따라 `setState`한다.

이 레포에서는 `src/components/main/MainHeroVideo.tsx` — 단일 `HERO_VIDEO_SRC`, PC만 `requestIdleCallback` 후 로드, `canplay` 후 `opacity: 1`.

```tsx
// 연결 개념만 — load 안에서:
const url = pickHeroVideoSrc();
if (url) setSrc(url);
```

S3 경로 예:

```text
.../carenation/video/top_video_720.mp4
.../carenation/video/top_video_1080.mp4
```

## 이 레포에서는

| 항목 | 내용 |
|------|------|
| 영상 URL | `s3.ap-northeast-2.amazonaws.com/img.carenation.kr/.../top_video.mp4` |
| 모바일 | JS + `mobile.css`로 영상 미사용 |
| 배포 | MP4는 S3, HTML/CSS는 우분투 — [ubuntu-deploy-s3-media](./2026-06-11_ubuntu-deploy-s3-media.md) |

## 더 볼 것 (선택)

- [2026-06-11_mobile-lcp-semantic-html.md](./2026-06-11_mobile-lcp-semantic-html.md) — 모바일 LCP는 PNG·SPA 쪽
- ffmpeg로 720/1080 인코딩 후 S3 업로드 — 인프라 IAM 권한 확인
