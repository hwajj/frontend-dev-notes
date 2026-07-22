# 학습 노트 목차

> `docs/notes/` 학습 노트 인덱스. **새 글 추가·기존 글 제목 변경 시 이 파일을 함께 갱신한다.**
> 카테고리는 [study-notes 룰](../.cursor/rules/study-notes.mdc) + [write-study-note 스킬](../.cursor/skills/write-study-note/categories.md) 확장 분류를 따른다.

---

## 빠른 통계

| 항목 | 값 |
|------|-----|
| 전체 | 27 |
| 최근 갱신 | 2026-06-15 |

---

## 카테고리별

### 브라우저·네트워크

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-06-15 | [스크립트 로딩(defer·module)과 JS 모듈](./2026-06-15_script-loading-and-js-modules.md) | defer·async·module 차이, React가 defer를 안 쓰는 이유, require vs import |
| 2026-06-08 | [프록시 ECONNREFUSED — 설정이 아니라 업스트림 미기동](./2026-06-08_proxy-econnrefused-upstream.md) | INTEGRATED(3000)는 떴는데 COMMON(5300) 미기동·프록시 설정 문제 아님 |
| 2026-05-29 | [로컬 개발 — CORS, `/api`, 프록시, 서버 두 번 켜기](./2026-05-29_cors-local-dev.md) | `/api` same-origin·3001 직통 CORS·상대 URL·이중 dev 함정 |

### DB·ORM

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-06-01 | [DB 연결과 풀 — 처음부터 쉽게](./2026-06-01_db-connection-basics.md) | 연결·풀·15한도≠사용자·로컬 dev 연결 고갈(EMAXCONNSESSION) |
| 2026-06-01 | [Supabase Session pool — 「15개만 연다」가 무슨 뜻인지](./2026-06-01_supabase-session-pool-slots.md) | Session=연결 점유·15슬롯·로그인 세션과 다름·5432 vs 6543 |

### 상태·데이터

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-06-08 | [크로스 포털 정산 화면 동기화 — React Query·폴링·알림](./2026-06-08_cross-portal-settlement-sync.md) | invalidate만으론 타 탭·타 역할 동기화 불가·조건부 폴링+알림 invalidate |
| 2026-06-04 | [Polling — 새로고침 없이 알림이 뜨는 이유](./2026-06-04-polling.md) | 클라이언트 주기 refetch·WS 대비 구현 쉬움·알림 vs 채팅 역할 분리 |
| 2026-06-02 | [Zustand selector — useStore()를 호출하는 두 가지 방법](./2026-06-02_zustand-selector.md) | selector 없으면 관심 없는 값이 바뀌어도 리렌더·shallow 비교 필요성 |
| 2026-06-02 | [카탈로그 UI state vs 주문서 draft — "담기 전"과 "담은 후"의 상태 경계](./2026-06-02_local-vs-draft-state.md) | 담기 버튼이 경계·rowQtys 로컬·draft API SSOT·optimistic 패턴 |
| 2026-05-29 | [장바구니·주문서 — 상태 3층·시행착오·동기화 개념](./2026-05-29_nh-cart-three-layers.md) | Zustand+persist·Link 공유·카탈로그 vs 재고 draft 시점 |
| 2026-05-28 | [주문서 수량 UX — 바꿀 때마다 서버? 낙관적? debounce? 로컬?](./2026-05-28_react-query-optimistic-update.md) | 4단계 시행착오, 최종은 Zustand+persist·제출 시 sync |
| 2026-05-28 | [관련 개념 — 서버 state · 클라이언트 state · 동기화](./2026-05-28_concepts-server-client-state.md) | SSOT·낙관적·debounce·race·flush 개념 사전 |

### 성능

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-06-02 | [큰 테이블 리렌더 — state 하나 바뀌면 왜 모든 행이 다시 그려지나](./2026-06-02_table-rerender-perf.md) | 인라인 렌더·전체 구독·memo 부재가 겹치면 100개 행이 매 클릭마다 재실행됨 |

### 인증·권한

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-05-29 | [SPA 로그아웃 — 버튼 눌렀는데 왜 안 나가지?](./2026-05-29_spa-logout-three-layers.md) | clearAuth vs logout·이중 저장·사이드바 연결·Guard |

### 분석·측정

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-06-10 | [SPA에서 pageview만으로는 퍼널을 못 본다](./2026-06-10_spa-pageview-limits.md) | pageview만으론 ?step= 하위단계·이탈·「다음」 클릭 구분 불가 |
| 2026-06-09 | [care 간병 등록 플로우 GA4 커스텀 이벤트 도입](./2026-06-09_care-regist-ga4-analytics.md) | care 등록 플로우 GA4 커스텀 이벤트 구현·Looker 퍼널 데이터 기반 |
| 2026-06-09 | [경영 대시보드는 Looker Studio에 만든다](./2026-06-09_looker-ga4-exec-dashboard.md) | 경영 KPI=Looker Studio·FE repo 어드민 UI 아님·GA4가 데이터 소스 |
| 2026-06-09 | [GA4 vs Clarity — 잔존·클릭 시간 KPI에 누가 맞는지](./2026-06-09_ga4-vs-clarity-roles.md) | GA4=집계 KPI·Clarity=녹화·잔존율은 GA4+커스텀 이벤트 |
| 2026-06-09 | [SPA에서 페이지 추적하는 3가지 방법](./2026-06-09_spa-page-tracking-layers.md) | GA4·Clarity·소켓 page_code 역할 분리·자동 URL만으론 퍼널 부족 |

### 아키텍처 · 워크플로

| 날짜 | 제목 | 한 줄 |
|------|------|-------|
| 2026-06-11 | [다중 CSS 세트와 SPA — 충돌, render-blocking, layout 분리](./2026-06-11_spa-css-next-renewal.md) | SPA CSS 동시 적용·blocking·layout마다 한 세트만 |
| 2026-06-11 | [정적 사이트 배포와 객체 스토리지 미디어](./2026-06-11_ubuntu-deploy-s3-media.md) | HTML은 자체 서버·큰 MP4는 S3·권한·인코딩 흐름 |
| 2026-06-08 | [.nvmrc와 실제 Node 버전이 다를 때](./2026-06-08_nvmrc-node-drift.md) | .nvmrc는 자동 전환 안 함·nvm use·팀 Node 버전 합치기 |
| 2026-06-08 | [Node 17+에서 webpack 4(react-scripts 4)가 터지는 이유](./2026-06-08_node-openssl-webpack.md) | Node17+ OpenSSL3 vs webpack4·ERR_OSSL_EVP_UNSUPPORTED |
| 2026-06-02 | [Git — 팀용 .gitignore 말고, 내 PC만 무시하기](./2026-06-02_git-local-exclude.md) | .git/info/exclude·팀 gitignore 없이 로컬만 무시 |

---

## 아직 없는 카테고리

아래는 글이 생기면 위 표에 **해당 섹션을 새로 만들고** 행을 추가한다. 전체 목록은 [categories.md](../.cursor/skills/write-study-note/categories.md).

**프론트엔드**: JavaScript, TypeScript, React, CSS·레이아웃, 접근성·HTML, 테스트, 보안, FE 설계, 디버깅·이슈

**백엔드·풀스택**: Node·서버, API·계약, 검증·에러

**CS·기초**: 자료구조, 알고리즘, OS·런타임, 네트워크, DB 이론, 분산·신뢰성, 설계 원칙

**도메인**: 도메인·업무 (B2B 정책·상태 전이 등)

---

## 갱신 규칙 (에이전트용)

1. `docs/notes/`에 **새 md 추가** 또는 **제목(h1) 변경** 시 → 이 INDEX에 행 추가/수정
2. **빠른 통계** 전체 개수·최근 갱신일 갱신
3. 카테고리가 없으면 `## {카테고리명}` 섹션 생성
4. `INDEX.md` 자체는 목차에 넣지 않음
5. h1 제목이 없는 메모(`YYYY-MM-DD.md` 등)는 목차에 넣지 않음

## 파일명 규칙

- 권장: `YYYY-MM-DD_{주제-kebab}.md`
- 예외: 주차·이름 포함 파일도 목차에 포함 (파일이 존재할 때만)
