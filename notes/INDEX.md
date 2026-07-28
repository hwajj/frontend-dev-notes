# 학습 노트 목차

> `notes/` 학습 노트 인덱스. **새 글 추가·기존 글 제목 변경 시 이 파일을 함께 갱신한다.**
> 카테고리는 [study-notes 룰](../.cursor/rules/study-notes.mdc) + [write-study-note 스킬](../.cursor/skills/write-study-note/categories.md) 확장 분류를 따른다.

---

## 빠른 통계

| 항목 | 값 |
|------|-----|
| 전체 | 56 |
| 최근 갱신 | 2026-07-27 |

---

## 카테고리별

### 브라우저·네트워크

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-07-27 | [경로 기반 리버스 프록시](./2026-07-27_path-reverse-proxy-ports.md) | 게이트웨이 한 포트 + path → upstream 포트 표로 로컬 멀티 SPA 통합 |
| 2026-07-27 | [정적 자원·HMR WebSocket의 타겟 포트 결정](./2026-07-27_hmr-static-port-routing.md) | path 라우팅 + Referer/쿠키 upstream 재선택 + WS upgrade 프록시 |
| 2026-07-27 | [로컬 개발에서 여러 프로세스를 동시에 띄우기](./2026-07-27_dev-all-concurrently-ports.md) | 브라우저 → 게이트웨이 포트, 게이트웨이 → 각 앱 포트 역할 분리 |
| 2026-07-24 | [URL query string 구성 — `?` 와 `&`](./2026-07-24_url-query-string-construction.md) | 첫 키는 `?`, 이후는 `&` — `?` 없이 `&`만 쓰면 쿼리로 안 읽힘 |
| 2026-07-24 | [SPA history — push vs replace](./2026-07-24_spa-history-push-vs-replace.md) | 편집→상세 복귀는 push가 아니라 replace로 history 루프 방지 |
| 2026-06-30 | [REST vs WebSocket](./2026-06-30_rest-vs-websocket.md) | 스냅샷 조회는 HTTP, 바뀌면 바로 알림은 WS/SSE — 둘을 같이 쓰는 경우 많음 |
| 2026-06-30 | [cross-origin·iframe·postMessage](./2026-06-30_cross-origin-iframe-messaging.md) | cross-origin iframe은 DOM 직접 접근 불가·postMessage로 JSON 계약만 |
| 2026-06-15 | [스크립트 로딩(defer·module)과 JS 모듈](./2026-06-15_script-loading-and-js-modules.md) | defer·async·module 차이, React가 defer를 안 쓰는 이유, require vs import |
| 2026-06-08 | [프록시 ECONNREFUSED — 설정이 아니라 업스트림 미기동](./2026-06-08_proxy-econnrefused-upstream.md) | INTEGRATED(3000)는 떴는데 COMMON(5300) 미기동·프록시 설정 문제 아님 |
| 2026-05-29 | [로컬 개발 — CORS, `/api`, 프록시, 서버 두 번 켜기](./2026-05-29_cors-local-dev.md) | `/api` same-origin·3001 직통 CORS·상대 URL·이중 dev 함정 |

### React · 라우팅·URL

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-07-02 | [useParamState가 있는 이유](./2026-07-02_use-param-state-purpose.md) | 목록 필터·페이지를 URL과 맞추되 parseInt·Link 쿼리 복붙을 훅으로 흡수 |
| 2026-07-02 | [replace:true와 뒤로가기](./2026-07-02_url-replace-no-history.md) | 필터 변경은 replace 기본·필터마다 history 쌓지 않는 백오피스 UX |
| 2026-07-02 | [UrlPlayground race 체험](./2026-07-02_url-playground-race.md) | setSearchParams 연속 호출 시 마지막 키만 남는 race 재현·useParamState와 같은 계열 |
| 2026-07-02 | [Param은 URL 코덱](./2026-07-02_param-url-codec.md) | 범용 스키마가 아니라 팀 URL 문자열 규칙용 코덱·boolean·배열 규칙이 코드에 박힘 |
| 2026-07-01 | [useParamState URL 동기화 race](./2026-07-01_use-param-state-url-race.md) | merge 기준을 prev 대신 location.href + await 80ms로 주소창과 맞춤 |
| 2026-05-29 | [useParamState — URL 쿼리를 연속으로 바꿀 때](./study/2026-05-29_use-param-state-batch.md) | setSearchParams 연속 호출은 합쳐지지 않음·한 번에 객체 또는 href merge |
| 2026-05-29 | [useBlocker — 폼 작성 중 나가기 막기](./study/2026-05-29_use-blocker-pitfalls.md) | SPA 라우트 전환만 가로챔·제출 실패 후 예외·scrollY 저장으로 튐 완화 |

### DB·ORM

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-06-01 | [DB 연결과 풀 — 처음부터 쉽게](./2026-06-01_db-connection-basics.md) | 연결·풀·15한도≠사용자·로컬 dev 연결 고갈(EMAXCONNSESSION) |
| 2026-06-01 | [Supabase Session pool — 「15개만 연다」가 무슨 뜻인지](./2026-06-01_supabase-session-pool-slots.md) | Session=연결 점유·15슬롯·로그인 세션과 다름·5432 vs 6543 |

### 상태·데이터

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-07-27 | [Draft·Edit·ReRegister 세션 분리](./2026-07-27_draft-edit-reregister-session-separation.md) | RegisterDraft와 Edit/ReRegister 세션 분리로 생명주기 겹침·덮어쓰기 충돌 방지 |
| 2026-07-13 | [same-tab setItem은 storage 이벤트 없음](./2026-07-13_same-tab-storage-notify.md) | storage 이벤트는 다른 탭만·같은 탭은 notifySameTab으로 useSyncExternalStore 갱신 |
| 2026-07-13 | [Adrop 로그아웃 로딩 고착 (React effect)](./2026-07-13_adrop-logout-temp-id.md) | setSid만 하고 fetch 없으면 sid 불변·같은 effect에서 finalUid로 fetch |
| 2026-07-07 | [leather-shop 장바구니 localStorage 동기화](./2026-07-07_cart-localstorage-sync.md) | cart state SSOT·useEffect로 localStorage 동기화·결제 완료 시만 비움 |
| 2026-06-08 | [크로스 포털 정산 화면 동기화 — React Query·폴링·알림](./2026-06-08_cross-portal-settlement-sync.md) | invalidate만으론 타 탭·타 역할 동기화 불가·조건부 폴링+알림 invalidate |
| 2026-06-04 | [Polling — 새로고침 없이 알림이 뜨는 이유](./2026-06-04-polling.md) | 클라이언트 주기 refetch·WS 대비 구현 쉬움·알림 vs 채팅 역할 분리 |
| 2026-06-02 | [Zustand selector — useStore()를 호출하는 두 가지 방법](./2026-06-02_zustand-selector.md) | selector 없으면 관심 없는 값이 바뀌어도 리렌더·shallow 비교 필요성 |
| 2026-06-02 | [카탈로그 UI state vs 주문서 draft — "담기 전"과 "담은 후"의 상태 경계](./2026-06-02_local-vs-draft-state.md) | 담기 버튼이 경계·rowQtys 로컬·draft API SSOT·optimistic 패턴 |
| 2026-05-29 | [장바구니·주문서 — 상태 3층·시행착오·동기화 개념](./2026-05-29_nh-cart-three-layers.md) | Zustand+persist·Link 공유·카탈로그 vs 재고 draft 시점 |
| 2026-05-28 | [주문서 수량 UX — 바꿀 때마다 서버? 낙관적? debounce? 로컬?](./2026-05-28_react-query-optimistic-update.md) | 4단계 시행착오, 최종은 Zustand+persist·제출 시 sync |
| 2026-05-28 | [관련 개념 — 서버 state · 클라이언트 state · 동기화](./2026-05-28_concepts-server-client-state.md) | SSOT·낙관적·debounce·race·flush 개념 사전 |
| 2026-05-29 | [useAtomicContext — Context 전체 리렌더 줄이기](./study/2026-05-29_atomic-context-store.md) | ref store + subscribe + useSyncExternalStore로 필드 단위 구독 |
| 2026-05-29 | [Modal — 팩토리 Context와 dispatchModal](./study/2026-05-29_modal-factory-dispatch.md) | Context로 모달 상태·CustomEvent로 트리 밖 dispatch·종류별 팩토리 |

### 성능

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-07-14 | [스크롤 UI 상태 모델링 — 위치 vs 동작 중](./2026-07-14_scroll-ui-state-modeling.md) | scrollY API가 아니라 의도한 상태 축에 맞춰 boolean 정의 |
| 2026-07-02 | [basicSwiper opacity·데스크톱 클리핑](./2026-07-02_basicSwiper-opacity-desktop-clipping.md) | init 전 opacity:0 + overflow:hidden 겹치면 데스크톱에서 완전 숨김 |
| 2026-06-30 | [debounce vs throttle](./2026-06-30_debounce-vs-throttle.md) | 끝난 뒤 한 번→debounce, 진행 중 가끔→throttle |
| 2026-06-11 | [모바일 LCP·geo-static·시맨틱 HTML (리뉴얼 SEO)](./2026-06-11_mobile-lcp-semantic-html.md) | 모바일 LCP는 영상이 아니라 SPA+blocking CSS+대형 PNG·시맨틱+Server HTML |
| 2026-06-11 | [히어로 영상 해상도 분기 (PC만)](./2026-06-11_hero-video-responsive.md) | 모바일은 영상 끄고 PC에서만 720 vs 1080·LCP는 포스터·정적 이미지 |
| 2026-06-02 | [큰 테이블 리렌더 — state 하나 바뀌면 왜 모든 행이 다시 그려지나](./2026-06-02_table-rerender-perf.md) | 인라인 렌더·전체 구독·memo 부재가 겹치면 100개 행이 매 클릭마다 재실행됨 |

### 인증·권한

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-05-29 | [SPA 로그아웃 — 버튼 눌렀는데 왜 안 나가지?](./2026-05-29_spa-logout-three-layers.md) | clearAuth vs logout·이중 저장·사이드바 연결·Guard |
| 2026-05-29 | [JWT — Storage와 API를 나눈 이유](./study/2026-05-29_jwt-auth-abstraction.md) | JwtStorage·JwtAuthAPI·JwtAuthService 계층으로 앱마다 다른 저장·URL 흡수 |

### 분석·측정

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-06-10 | [care 간병 등록 플로우 GA4 커스텀 이벤트 도입 (실행)](./2026-06-10_care-regist-ga4-analytics.md) | care 등록 플로우 GA4 커스텀 이벤트 구현·Looker 퍼널 데이터 기반 |
| 2026-06-10 | [SPA에서 pageview만으로는 퍼널을 못 본다](./2026-06-10_spa-pageview-limits.md) | pageview만으론 ?step= 하위단계·이탈·「다음」 클릭 구분 불가 |
| 2026-06-09 | [care 간병 등록 플로우 GA4 커스텀 이벤트 도입](./2026-06-09_care-regist-ga4-analytics.md) | care 등록 플로우 GA4 커스텀 이벤트 설계·Looker 퍼널 데이터 기반 |
| 2026-06-09 | [경영 대시보드는 Looker Studio에 만든다](./2026-06-09_looker-ga4-exec-dashboard.md) | 경영 KPI=Looker Studio·FE repo 어드민 UI 아님·GA4가 데이터 소스 |
| 2026-06-09 | [GA4 vs Clarity — 잔존·클릭 시간 KPI에 누가 맞는지](./2026-06-09_ga4-vs-clarity-roles.md) | GA4=집계 KPI·Clarity=녹화·잔존율은 GA4+커스텀 이벤트 |
| 2026-06-09 | [SPA에서 페이지 추적하는 3가지 방법](./2026-06-09_spa-page-tracking-layers.md) | GA4·Clarity·소켓 page_code 역할 분리·자동 URL만으론 퍼널 부족 |

### TypeScript · 검증

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-05-29 | [AsyncValidator — satisfies로 검증 타입까지 잡기](./study/2026-05-29_async-validator-types.md) | configs를 satisfies로 선언하면 checkAll 결과 key가 필드 이름으로 좁혀짐 |

### React · effect·폴리필

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-05-29 | [useEffectEvent 폴리필 — effect와 “이벤트성” 핸들러 분리](./study/2026-05-29_use-effect-event-polyfill.md) | deps에 콜백 넣으면 effect 재실행·ref+안정 fn으로 최신 fn만 유지 |

### 아키텍처 · 워크플로

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-07-10 | [저장 시 ESLint·Prettier 파이프라인](./2026-07-10_eslint-prettier-save-pipeline.md) | ESLint fix → Prettier 순서·source.fixAll.eslint로 return 위 빈 줄 등 |
| 2026-07-10 | [VS Code / Cursor + Prettier + ESLint 설정 정리](./2026-07-10_VSCode-Prettier-ESLint-정리.md) | ESLint=규칙 자동 수정·Prettier=포맷·저장 시 1→2단계 역할 분담 |
| 2026-06-11 | [다중 CSS 세트와 SPA — 충돌, render-blocking, layout 분리](./2026-06-11_spa-css-next-renewal.md) | SPA CSS 동시 적용·blocking·layout마다 한 세트만 |
| 2026-06-11 | [정적 사이트 배포와 객체 스토리지 미디어](./2026-06-11_ubuntu-deploy-s3-media.md) | HTML은 자체 서버·큰 MP4는 S3·권한·인코딩 흐름 |
| 2026-06-08 | [.nvmrc와 실제 Node 버전이 다를 때](./2026-06-08_nvmrc-node-drift.md) | .nvmrc는 자동 전환 안 함·nvm use·팀 Node 버전 합치기 |
| 2026-06-08 | [Node 17+에서 webpack 4(react-scripts 4)가 터지는 이유](./2026-06-08_node-openssl-webpack.md) | Node17+ OpenSSL3 vs webpack4·ERR_OSSL_EVP_UNSUPPORTED |
| 2026-06-02 | [Git — 팀용 .gitignore 말고, 내 PC만 무시하기](./2026-06-02_git-local-exclude.md) | .git/info/exclude·팀 gitignore 없이 로컬만 무시 |
| 2026-05-29 | [모노레포 패키지를 다른 앱에서 바로 테스트하기](./study/2026-05-29_monorepo-local-alias.md) | npm publish 없이 alias로 소스 연결·내부 __@hook__ alias도 같이 맞춤 |

---

## 아직 없는 카테고리

아래는 글이 생기면 위 표에 **해당 섹션을 새로 만들고** 행을 추가한다. 전체 목록은 [categories.md](../.cursor/skills/write-study-note/categories.md).

**프론트엔드**: JavaScript, CSS·레이아웃, 접근성·HTML, 테스트, 보안, FE 설계, 디버깅·이슈

**백엔드·풀스택**: Node·서버, API·계약, 검증·에러

**CS·기초**: 자료구조, 알고리즘, OS·런타임, 네트워크, DB 이론, 분산·신뢰성, 설계 원칙

**도메인**: 도메인·업무 (B2B 정책·상태 전이 등)

---

## 갱신 규칙 (에이전트용)

1. `notes/`에 **새 md 추가** 또는 **제목(h1) 변경** 시 → 이 INDEX에 행 추가/수정
2. **빠른 통계** 전체 개수·최근 갱신일 갱신
3. 카테고리가 없으면 `## {카테고리명}` 섹션 생성
4. `INDEX.md` 자체는 목차에 넣지 않음
5. h1 제목이 없는 메모(`YYYY-MM-DD.md` 등)는 목차에 넣지 않음

## 파일명 규칙

- 권장: `YYYY-MM-DD_{주제-kebab}.md`
- `study/` 하위: 라이브러리·패턴 심화 노트
- 예외: 주차·이름 포함 파일도 목차에 포함 (파일이 존재할 때만)
