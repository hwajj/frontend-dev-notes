# 학습 노트 INDEX

> 위치: `~/.cursor/notes/` · 기본 스킬: `write-study-note-brief` · 풀: `write-study-note`
> 빠른 통계: **전체 44편** · 최근 갱신: **2026-09-29**

## A. 도메인·업무

| 날짜 | 파일 | 제목 |
|------|------|------|
| 2026-08-24 | [경량] [0원 본인부담금 — PG 생략·매칭 플로우](./2026-08-24_payment-free-order-skip-pg.md) | totalFee===0이면 FreeMatchingPopup→createOrder(0)→result |

## B. 프론트엔드

| 날짜 | 파일 | 제목 |
|------|------|------|
| 2026-09-29 | [경량] [한 도메인 멀티 SPA — catch-all(`*`)의 범위](./2026-09-29_multi-spa-catch-all-scope.md) | nginx path가 번들 선택 — dailycare `*`는 `/dailycare` entry에서만 |
| 2026-09-23 | [경량] [Android IME(이동/검색)와 돋보기 동작 통일](./2026-09-23_mobile-ime-search-blur.md) | IME는 keydown Enter+blur, 돋보기와 공통 핸들러 |
| 2026-09-16 | [경량] [Web↔Native WebView 브릿지 규약](./2026-09-16_webview-bridge-protocol.md) | AndroidApp / messageHandlers로 OS별 호출 형태를 맞추는 게 브릿지 |
| 2026-09-16 | [경량] [네이티브 기능 버전 게이트·폴백](./2026-09-16_native-capability-fallback.md) | 메서드 존재 + 앱 버전으로 신규/구 브릿지 분기 |
| 2026-09-16 | [경량] [SPA back vs WebView 종료](./2026-09-16_spa-back-vs-pagefinish.md) | history/referrer로 history.back vs pageFinish |
| 2026-08-24 | [경량] [queryKey = 캐시 단위](./2026-08-24_rq-querykey-cache-split.md) | closed/complete가 jobKeys.list(filter)로 별도 캐시 |
| 2026-08-24 | [경량] [staleTime vs refetchOnMount always 함정](./2026-08-24_rq-staletime-refetch-trap.md) | care always는 staleTime 무의미 — dailycare는 기본값 |
| 2026-08-24 | [경량] [isLoading·isFetching·isPreviousData](./2026-08-24_rq-loading-states-usejoblist.md) | useJobList — 캐시 hit 스피너 생략, 에러는 data 없을 때만 |
| 2026-08-24 | [경량] [keepPreviousData 필터 전환 UX](./2026-08-24_rq-keep-previous-data.md) | closed↔complete 토글 시 목록 깜빡임 없음 |
| 2026-08-24 | [경량] [enabled 조건부 fetch](./2026-08-24_rq-enabled-gate.md) | id·cgsUsersId 준비될 때만 queryFn 실행 |
| 2026-08-24 | [경량] [invalidateQueries 계층 키](./2026-08-24_rq-invalidate-hierarchy.md) | 결제 성공 시 jobKeys.lists()로 status 3종 무효화 |
| 2026-08-24 | [경량] [staleTime Infinity (정적 데이터)](./2026-08-24_rq-staletime-infinity.md) | useCaremateAward — 수상 내역 1회 fetch |
| 2026-08-24 | [경량] [useJobDetail 캐시 공유](./2026-08-24_rq-detail-cache-share.md) | 상세→결제 jobKeys.detail(id) 재사용 |
| 2026-08-24 | [경량] [React 17 → react-query v4](./2026-08-24_rq-v4-react17.md) | v5 불가, QueryClientProvider 전역 설정 |
| 2026-08-24 | [경량] [캐시만 vs invalidate](./2026-08-24_rq-cache-vs-invalidate.md) | TTL만으론 결제 후 60s stale — invalidate 필요 |
| 2026-08-24 | [경량] [cancelled → useQuery](./2026-08-24_rq-cancelled-to-usequery.md) | filter race — queryKey 변경이 cancelled 대체 |
| 2026-08-24 | [경량] [mutation은 RQ 밖 — ordering ref](./2026-08-24_rq-mutation-outside-cache.md) | createOrder 중복 방지는 ref, GET만 useQuery |
| 2026-08-24 | [경량] [details/summary 네이티브 아코디언](./2026-08-24_details-summary-native-accordion.md) | open 속성 토글, reset.css는 marker만 제거 |
| 2026-08-06 | [경량] [JobRepository 주입·스왑](./2026-08-06_job-repository-inject-swap.md) | UI는 인터페이스만, factory+env로 dummy/http 교체 |
| 2026-07-27 | [경로 기반 리버스 프록시](./2026-07-27_path-reverse-proxy-ports.md) | Origin 하나로 고정, path → upstream 포트 |
| 2026-07-24 | [SPA history — push vs replace](./2026-07-24_spa-history-push-vs-replace.md) | returnUrl 복귀는 replace — push면 상세↔수정 루프 |
| 2026-07-14 | [스크롤 UI 상태 모델링 — 위치 vs 동작 중](./2026-07-14_scroll-ui-state-modeling.md) | threshold≠idle — 상태 축·debounce·훅 경계·transition 동기화·네이밍 |
| 2026-07-13 | [경량] [Adrop 로그아웃 로딩 고착 (React effect)](./2026-07-13_adrop-logout-temp-id.md) | setSid 후 early return이면 fetch는 다음 리렌더 의존 — 같은 effect에서 uid로 바로 fetch |
| 2026-07-13 | [경량] [same-tab setItem은 storage 이벤트 없음](./2026-07-13_same-tab-storage-notify.md) | setItem의 storage 이벤트는 다른 탭만 — 같은 탭은 notifySameTab 필요 |
| 2026-07-10 | [경량] [저장 시 ESLint·Prettier 파이프라인](./2026-07-10_eslint-prettier-save-pipeline.md) | return 빈 줄=ESLint fix — 확장 없으면 CLI만, prettier extends로 충돌 방지 |
| 2026-07-02 | [경량] [useParamState가 있는 이유](./2026-07-02_use-param-state-purpose.md) | 목록 필터 URL 타입·검증 API — race fix는 나중 보강 |
| 2026-07-02 | [경량] [Param은 URL 코덱](./2026-07-02_param-url-codec.md) | 팀 URL encode/decode·fallback — Zod 대체 아님 |
| 2026-07-02 | [경량] [UrlPlayground race 체험](./2026-07-02_url-playground-race.md) | demo 연속 setSearchParams로 str2만 남는 증상 재현 |
| 2026-07-02 | [경량] [replace:true와 뒤로가기](./2026-07-02_url-replace-no-history.md) | 필터 변경은 history replace — 뒤로가기 거의 없음 |
| 2026-07-01 | [경량] [useParamState URL 동기화 race](./2026-07-01_use-param-state-url-race.md) | setSearchParams 연속 호출 시 location.href 스냅샷 + 80ms await |
| 2026-06-30 | [2026-06-30_debounce-vs-throttle.md](./2026-06-30_debounce-vs-throttle.md) | debounce vs throttle |
| 2026-06-30 | [2026-06-30_cross-origin-iframe-messaging.md](./2026-06-30_cross-origin-iframe-messaging.md) | cross-origin·iframe·postMessage |
| 2026-06-15 | [2026-06-15_script-loading-and-js-modules.md](./2026-06-15_script-loading-and-js-modules.md) | 스크립트 로딩(defer·module)과 JS 모듈(CommonJS·번들러) |
| 2026-06-11 | [2026-06-11_spa-css-next-renewal.md](./2026-06-11_spa-css-next-renewal.md) | SPA CSS 충돌·느림과 Next route group으로 풀기 |
| 2026-06-11 | [2026-06-11_mobile-lcp-semantic-html.md](./2026-06-11_mobile-lcp-semantic-html.md) | 모바일 LCP·geo-static·시맨틱 HTML (리뉴얼 SEO) |
| 2026-06-11 | [2026-06-11_hero-video-responsive.md](./2026-06-11_hero-video-responsive.md) | 히어로 영상 해상도 분기 (PC만) |
| 2026-06-10 | [2026-06-10_spa-pageview-limits.md](./2026-06-10_spa-pageview-limits.md) | SPA에서 pageview만으로는 퍼널을 못 본다 |

## C. 백엔드·풀스택

| 날짜 | 파일 | 제목 |
|------|------|------|
| 2026-08-24 | [경량] [payment API + jobDetail merge](./2026-08-24_payment-caregiver-card-merge.md) | applicant_user에 amount_time 없음 — detail 캐시 merge |
| 2026-07-27 | [로컬 개발에서 여러 프로세스를 동시에 띄우기](./2026-07-27_dev-all-concurrently-ports.md) | 진입점은 게이트웨이(3000), CRA는 5300+BROWSER=none |
| 2026-07-27 | [정적 자원·HMR WebSocket의 타겟 포트 결정](./2026-07-27_hmr-static-port-routing.md) | 정적·HMR은 Referer/쿠키로 upstream — upgrade 프록시 |
| 2026-06-30 | [2026-06-30_rest-vs-websocket.md](./2026-06-30_rest-vs-websocket.md) | REST vs WebSocket |
| 2026-06-11 | [2026-06-11_ubuntu-deploy-s3-media.md](./2026-06-11_ubuntu-deploy-s3-media.md) | 우분투 정적 배포 vs S3 미디어 |

## D. 컴퓨터 과학·기초

| 날짜 | 파일 | 제목 |
|------|------|------|
| 2026-07-24 | [URL query string 구성 — `?` 와 `&`](./2026-07-24_url-query-string-construction.md) | 첫 키는 `?`, 다음만 `&` — `&`만 붙이면 path |

