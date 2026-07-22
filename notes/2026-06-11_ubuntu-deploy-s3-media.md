# 우분투 정적 배포 vs S3 미디어

> 작성일: 2026-06-11
> 맥락: 배포는 우분투 SSH로 `out/`을 올리는데, 히어로 영상 URL은 S3다. “회사 서버가 S3냐” 헷갈리고, 해상도별 MP4를 S3에 올릴 수 있는지 알고 싶다.
> 범위: 로컬 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- 홈페이지 전체가 S3에 올라가는 구조인가?
- 우분투 수동 배포와 S3는 **어떤 관계**인가?
- 인코딩 나눈 MP4를 **S3에만** 올리면 되나?

## 핵심 정리 (결론부터)

| 구분 | 무엇인가 | 이 프로젝트에서 |
|------|----------|-----------------|
| **홈페이지** (`www.carenation.kr`) | HTML·CSS·JS·`public/img` | `npm run build` → `out/` → **우분투 웹서버** (SSH/rsync) |
| **미디어 버킷** (`img.carenation.kr`) | 대용량 영상·일부 정적 파일 | **AWS S3** — 브라우저가 URL로 **직접** 요청 |
| **인코딩** | ffmpeg 등으로 파일 생성 | **로컬/CI에서 만든 뒤** S3에 업로드 (S3가 인코딩해 주지 않음) |

**한 줄:** **서버 전체가 S3가 아니다.** 사이트 껍데기는 **우분투**, 히어로 MP4 같은 **큰 미디어는 S3**다. 720p/1080p를 나눠 올리고 코드에서 URL만 고르면 된다 — **우분투 배포와는 별도 작업**이다.

## 배경 지식 (짧게만)

- **`output: "export"` (Next)**: 빌드 결과가 **정적 파일** — Node 서버 없이 Nginx·S3 정적 호스팅 등에 올릴 수 있다.
- **S3**: AWS 객체 저장소 — 폴더처럼 경로를 두고 파일을 올린다.
- **커스텀 도메인**: `img.carenation.kr`이 버킷 앞에 CloudFront 등 CDN일 수 있다 (인프라팀 확인).
- **SSH 배포**: 개발 PC에서 빌드한 `out/`을 원격 서버 디렉터리에 복사.

## 한눈에

```
[개발 PC]
  npm run build → out/
       │
       ▼ SSH / rsync (수동 배포)
[우분투 + Nginx 등]  ← www.carenation.kr
  ├── index.html
  ├── /css/*.css
  └── /img/*.png  (public/img)

[AWS S3 버킷 img.carenation.kr]
  └── carenation2.0-homepage/carenation/video/
        ├── top_video.mp4        (현재 단일)
        ├── top_video_720.mp4    (추가 가능)
        └── top_video_1080.mp4
       ▲
       └── 브라우저가 <video src="https://s3..."> 로 직접 GET
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `out/` | Next static export 빌드 산출물 폴더 |
| `img.carenation.kr` | 미디어용 호스트( S3 버킷 + CDN 가능) |
| IAM | AWS에서 S3 업로드 권한을 주는 계정·역할 |

---

## 한 줄 요약 (정책 한 줄)

**HTML/CSS는 우분투에, 큰 MP4는 S3에** — 역할이 다르고, 영상 해상도 분기는 **S3 파일 추가 + 프론트 URL 선택**이다.

## 함정 한 가지

**“배포할 때 우분투만 쓰니까 S3에 못 올린다”**는 아니다. SSH 배포 권한과 **S3 업로드 IAM 권한은 별개**다. 영상만 S3에 올리려면 인프라/백엔드에 `img.carenation.kr` 버킷 업로드 권한을 확인한다.

## 왜 이렇게인가

정적 export 사이트는 **파일 단위 배포**가 단순하다. 다만 히어로 MP4처럼 **수 MB~수십 MB** 파일을 웹서버에서 직접 서빙하면 대역폭·캐시 부담이 커진다. 그래서 **일부 URL만 S3(＋CDN)** 를 가리키고, 나머지는 기존 우분투 흐름을 유지하는 **혼합 구조**가 흔하다.

영상을 `public/video/`에 넣고 우분투만 써도 되지만, CDN 없으면 느려질 수 있다 — **용량 큰 히어로는 S3 쪽이 맞는 편**이다.

## 참고 코드

이 레포 `next.config.ts`에 `output: "export"`가 있다. 레포 안에 **S3 업로드 스크립트·CI는 없다** — 배포는 README·팀 절차(우분투) 기준.

히어로 영상 상수 (`MainHeroVideo.tsx`):

```ts
const HERO_VIDEO_SRC =
  "https://s3.ap-northeast-2.amazonaws.com/img.carenation.kr/carenation2.0-homepage/carenation/video/top_video.mp4";
```

## 이 레포에서는

| 작업 | 담당/경로 |
|------|-----------|
| 사이트 배포 | 우분투 SSH, `out/` 복사 |
| MP4 추가 | S3 `img.carenation.kr` (IAM 필요) |
| URL 분기 | `MainHeroVideo.tsx` — [hero-video-responsive](./2026-06-11_hero-video-responsive.md) |

### 작업 흐름 (해상도 분기 시)

1. 로컬에서 ffmpeg로 720p·1080p 인코딩  
2. AWS 콘솔·CLI·사내 도구로 S3 업로드  
3. 브라우저에서 URL 직접 열어 재생 확인  
4. 코드에서 `pickHeroVideoSrc()` 등으로 URL 선택  

## 더 볼 것 (선택)

- CloudFront가 `img.carenation.kr` 앞에 있는지 — 캐시·지연 확인
- [2026-06-11_hero-video-responsive.md](./2026-06-11_hero-video-responsive.md) — 어떤 해상도를 올릴지
