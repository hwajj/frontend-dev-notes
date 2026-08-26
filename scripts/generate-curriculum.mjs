import fs from "node:fs";
import path from "node:path";

const root = path.resolve("docs/curriculum");

// 주차는 고정, 일수는 유연. 각 Day는 "하나의 응집된 subsystem"을 목표로 한다.
// 주의: 이 스크립트는 기존 md를 "덮어쓰지 않는다"(existsSync 가드). 손으로 채운 내용을 보존하고,
//       없는 파일만 스캐폴딩하며, 사이드바는 항상 재생성한다.
const weeks = [
  {
    dir: "week-01-web-js",
    title: "1주차 — 웹 & JS 기초 체력 다지기",
    summary: "기본기 + 구조 이해. 클린코드 자바스크립트 정리.",
    pages: [
      { file: "day-01-http-basics.md", title: "Day 1: HTTP 기초" },
      { file: "day-02-network-flow.md", title: "Day 2: 네트워크 연결 흐름" },
      { file: "ref-web-deep.md", title: "(참고) 웹 동작 원리" },
      { file: "day-03-rendering-1.md", title: "Day 3: 브라우저 렌더링(1)" },
      { file: "day-04-rendering-2.md", title: "Day 4: 브라우저 렌더링(2)" },
      { file: "ref-rendering-pipeline.md", title: "(참고) 브라우저 렌더링 파이프라인" },
      { file: "day-05-cache-hints.md", title: "Day 5: 캐시 & 리소스 힌트" },
      { file: "day-06-auth-storage.md", title: "Day 6: 인증/저장소" },
      { file: "day-07-review.md", title: "Day 7: 주간 정리" },
      { file: "ref-js-execution-model.md", title: "(참고) JS 실행 모델" },
    ],
  },
  {
    dir: "week-02-js-advanced",
    title: "2주차 — JS 심화",
    summary: "면접 단골 구간.",
    pages: [
      { file: "day-08-execution-context.md", title: "Day 8: Execution Context" },
      { file: "day-09-lexical-environment.md", title: "Day 9: Lexical Environment" },
      { file: "day-10-scope-closure.md", title: "Day 10: Scope Chain / Closure" },
      { file: "day-11-hoisting-tdz.md", title: "Day 11: Hoisting / TDZ" },
      { file: "day-12-this-bind.md", title: "Day 12: this / bind / call / apply" },
      { file: "day-13-prototype.md", title: "Day 13: Prototype / Prototype Chain" },
      { file: "day-14-review.md", title: "Day 14: 주간 정리" },
      { file: "day-15-async-event-loop.md", title: "Day 15: 비동기 & 이벤트 루프" },
      { file: "ref-closure-prototype.md", title: "(참고) 클로저 & 프로토타입" },
      { file: "ref-async-event-loop.md", title: "(참고) 비동기 & 이벤트 루프" },
      { file: "ref-data-functional.md", title: "(참고) 데이터 & 함수형 사고" },
    ],
  },
  {
    dir: "week-03-typescript-dom",
    title: "3주차 — TypeScript + DOM & 성능",
    summary: "타입스크립트 + DOM + 브라우저 성능.",
    pages: [
      { file: "day-16-typescript-basic.md", title: "Day 16: TypeScript Basic" },
      { file: "day-17-type-inference.md", title: "Day 17: Type Inference & Type System" },
      { file: "day-18-generic.md", title: "Day 18: Generic" },
      { file: "day-19-utility-types.md", title: "Day 19: Utility Types" },
      { file: "day-20-dom.md", title: "Day 20: DOM" },
      { file: "day-21-event.md", title: "Day 21: Event" },
      { file: "day-22-browser-performance.md", title: "Day 22: Browser Performance" },
      { file: "day-23-typescript-dom-practice.md", title: "Day 23: TypeScript + DOM 실전" },
      { file: "ref-typescript-deep.md", title: "(참고) TypeScript Deep Dive" },
      { file: "ref-dom-performance.md", title: "(참고) DOM & 성능 실전" },
    ],
  },
  {
    dir: "week-04-network-perf",
    title: "4주차 — 네트워크 & 렌더링 전략",
    summary: "Fetch/REST/인증 + CSR/SSR + Web Vitals/리소스 최적화(기초 1회독).",
    pages: [
      { file: "day-24-fetch.md", title: "Day 24: Fetch" },
      { file: "day-25-rest-api.md", title: "Day 25: REST API" },
      { file: "day-26-authentication.md", title: "Day 26: Authentication" },
      { file: "day-27-csr.md", title: "Day 27: CSR" },
      { file: "day-28-ssr-hydration.md", title: "Day 28: SSR & Hydration" },
      { file: "day-29-core-web-vitals.md", title: "Day 29: Core Web Vitals" },
      { file: "day-30-resource-optimization.md", title: "Day 30: Resource Optimization" },
      { file: "ref-data-communication-auth.md", title: "(참고) 데이터 통신 & 인증" },
      { file: "ref-network-performance-advanced.md", title: "(참고) 네트워크 & 성능 (고급)" },
      { file: "ref-web-vitals.md", title: "(참고) Web Vitals" },
    ],
  },
  {
    dir: "week-05-react-rendering",
    title: "5주차 — React Rendering",
    summary: "React 렌더링 원리.",
    pages: [
      { file: "day-31-react-rendering.md", title: "Day 31: React Rendering" },
      { file: "day-32-reconciliation.md", title: "Day 32: Reconciliation" },
      { file: "day-33-virtual-dom.md", title: "Day 33: Virtual DOM" },
      { file: "day-34-fiber.md", title: "Day 34: Fiber" },
      { file: "day-35-batching.md", title: "Day 35: Batching" },
      { file: "day-36-key.md", title: "Day 36: key" },
      { file: "day-37-react-query.md", title: "Day 37: TanStack Query" },
    ],
  },
  {
    dir: "week-06-react-hooks",
    title: "6주차 — React Hooks & 성능",
    summary: "Hooks + 렌더 성능(React Profiler 포함).",
    pages: [
      { file: "day-38-use-state.md", title: "Day 38: useState" },
      { file: "day-39-use-effect.md", title: "Day 39: useEffect" },
      { file: "day-40-dependency.md", title: "Day 40: dependency" },
      { file: "day-41-stale-closure.md", title: "Day 41: stale closure" },
      { file: "day-42-use-ref.md", title: "Day 42: useRef" },
      { file: "day-43-react-memo.md", title: "Day 43: React.memo & React Profiler" },
      { file: "day-44-use-memo.md", title: "Day 44: useMemo" },
      { file: "day-45-use-callback.md", title: "Day 45: useCallback" },
    ],
  },
  {
    dir: "week-07-react-state-error",
    title: "7주차 — React 설계/상태/에러",
    summary: "Day 46~51",
    pages: [
      { file: "day-46-context.md", title: "Day 46: Context" },
      { file: "day-47-zustand-redux.md", title: "Day 47: Zustand / Redux" },
      { file: "day-48-custom-hook.md", title: "Day 48: Custom Hook" },
      { file: "day-49-controlled-component.md", title: "Day 49: Controlled Component" },
      { file: "day-50-error-boundary.md", title: "Day 50: Error Boundary" },
      { file: "day-51-suspense.md", title: "Day 51: Suspense" },
    ],
  },
  {
    dir: "week-08-routing-realtime",
    title: "8주차 — 라우팅 · URL 상태 · 실시간 통신",
    summary: "프론트 실전에서 자주 빠지는 영역.",
    pages: [
      { file: "08-1-spa-routing-history.md", title: "SPA 라우팅 & History API" },
      { file: "08-2-url-as-state.md", title: "URL을 상태로 (URL as State)" },
      { file: "08-3-realtime-communication.md", title: "실시간 통신 (WebSocket · SSE · 폴링)" },
      { file: "08-4-cross-tab-communication.md", title: "탭 간 통신 (postMessage · storage)" },
    ],
  },
  {
    dir: "week-09-quality",
    title: "9주차 — 프론트 품질 (CSS · 접근성 · 테스트 · 보안)",
    summary: "동작하는 것에서 믿을 수 있는 것으로.",
    pages: [
      { file: "09-1-css-layout-architecture.md", title: "CSS 레이아웃 & 아키텍처" },
      { file: "09-2-semantic-html-a11y.md", title: "시맨틱 HTML & 접근성(a11y)" },
      { file: "09-3-testing.md", title: "테스트 (단위 · RTL · E2E)" },
      { file: "09-4-security.md", title: "프론트 보안 (XSS · CSRF · CSP)" },
    ],
  },
  {
    dir: "week-10-tooling",
    title: "10주차 — 개발환경 & 빌드 툴링",
    summary: "매일 쓰지만 제대로 안 배우는 빌드·환경.",
    pages: [
      { file: "10-1-bundler-and-bundle-optimization.md", title: "번들러 & 번들 최적화" },
      { file: "10-2-eslint-prettier.md", title: "ESLint & Prettier 파이프라인" },
      { file: "10-3-node-version-env.md", title: "Node 버전 · 환경변수" },
      { file: "10-4-monorepo-git.md", title: "모노레포 & Git 설정" },
      { file: "10-5-package-manager.md", title: "패키지 관리 (npm · pnpm · lockfile)" },
    ],
  },
  {
    dir: "week-11-backend",
    title: "11주차 — 백엔드 기초 (Node · API · 인증서버)",
    summary: "프론트가 서버 응답을 이해하기 위한 최소 백엔드.",
    pages: [
      { file: "11-1-node-runtime-server.md", title: "Node 런타임 & 서버 기초" },
      { file: "11-2-rest-api-design-advanced.md", title: "REST API 설계 심화" },
      { file: "11-3-auth-server.md", title: "인증·인가 서버 관점 (세션 · JWT · OAuth)" },
      { file: "11-4-bff-gateway.md", title: "BFF · API Gateway · 서버 구조" },
    ],
  },
  {
    dir: "week-12-database",
    title: "12주차 — 데이터베이스",
    summary: "연결 고갈·느린 쿼리를 이해하는 최소 DB.",
    pages: [
      { file: "12-1-connection-pool.md", title: "연결 & 커넥션 풀" },
      { file: "12-2-index-query.md", title: "인덱스 & 쿼리 최적화" },
      { file: "12-3-transaction-n1.md", title: "트랜잭션 & N+1" },
    ],
  },
  {
    dir: "week-13-infra-deploy",
    title: "13주차 — 네트워크 · 인프라 & 배포 트러블슈팅",
    summary: "내 코드는 되는데 배포하면 안 되는 구간을 실전 사례로.",
    pages: [
      { file: "13-1-network-deep.md", title: "네트워크 심화 (TCP · TLS · HTTP/2·3 · DNS)" },
      {
        file: "13-2-nginx-reverse-proxy-subdomain.md",
        title: "Nginx 리버스 프록시 · 서브도메인 · 라우팅",
      },
      {
        file: "13-3-static-deploy-s3-media.md",
        title: "정적 배포 · S3 · CDN(CloudFront) · 미디어",
      },
      { file: "13-4-docker-cicd.md", title: "Docker & CI/CD" },
      { file: "13-5-troubleshooting-cases.md", title: "실전 트러블슈팅 사례집" },
    ],
  },
  {
    dir: "week-14-analytics",
    title: "14주차 — 분석 · 측정 & 관측",
    summary: "만든 것이 실제로 어떻게 쓰이는지 데이터로 본다.",
    pages: [
      { file: "14-1-ga4-clarity-looker.md", title: "사용자 분석 (GA4 · Clarity · Looker)" },
      { file: "14-2-monitoring-rum-sentry.md", title: "프론트 관측 (모니터링 · RUM · Sentry)" },
    ],
  },
  {
    dir: "week-15-career",
    title: "15주차 — 경력 무기화",
    summary: "Day 75~80",
    pages: [
      { file: "day-75-project-retrospective-1.md", title: "프로젝트 회고 ①" },
      { file: "day-76-project-retrospective-2.md", title: "프로젝트 회고 ②" },
      { file: "day-77-incident-experience.md", title: "장애 경험 정리" },
      { file: "day-78-performance-improvement.md", title: "성능 개선 경험 정리" },
      { file: "day-79-collaboration.md", title: "협업 경험 정리" },
      { file: "day-80-star-answers.md", title: "STAR 답변 작성" },
    ],
  },
];

// 상위 개요 index를 위한 Part 그룹핑
const parts = [
  {
    title: "Part 1 · 프론트 기반 (1~7주)",
    dirs: [
      "week-01-web-js",
      "week-02-js-advanced",
      "week-03-typescript-dom",
      "week-04-network-perf",
      "week-05-react-rendering",
      "week-06-react-hooks",
      "week-07-react-state-error",
    ],
  },
  {
    title: "Part 2 · 프론트 실전 (8~10주)",
    dirs: ["week-08-routing-realtime", "week-09-quality", "week-10-tooling"],
  },
  {
    title: "Part 3 · 백엔드 · CS · 인프라 (11~14주)",
    dirs: ["week-11-backend", "week-12-database", "week-13-infra-deploy", "week-14-analytics"],
  },
  { title: "Part 4 · 마무리", dirs: ["week-15-career"] },
];

function slugFromFile(file) {
  return file.replace(/\.md$/, "");
}

function renderPage({ title, keywords = [], interview, goal, note }) {
  const lines = [`# ${title}`, "", "## 키워드", ""];
  for (const kw of keywords) lines.push(`- ${kw}`);
  if (keywords.length === 0) lines.push("(작성 예정)");
  lines.push("", "## 핵심 개념", "", interview ? `- ${interview}` : "(작성 예정)");
  lines.push("", "## 목표", "", goal ? `- ${goal}` : "(작성 예정)");
  if (note) lines.push("", "## 참고", "", `- ${note}`);
  lines.push("");
  return lines.join("\n");
}

function renderWeekIndex(week) {
  const lines = [`# ${week.title}`, ""];
  if (week.summary) lines.push(week.summary, "");
  lines.push("## 목차", "");
  for (const page of week.pages) {
    const slug = slugFromFile(page.file);
    lines.push(`- [${page.title}](/curriculum/${week.dir}/${slug})`);
  }
  lines.push("");
  return lines.join("\n");
}

// 기존 파일은 보존한다(손으로 채운 내용 보호). 없을 때만 생성.
function writeIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) return false;
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

const sidebar = [];
const weekByDir = Object.fromEntries(weeks.map((w) => [w.dir, w]));
let scaffolded = 0;

fs.mkdirSync(root, { recursive: true });

for (const week of weeks) {
  const weekDir = path.join(root, week.dir);
  fs.mkdirSync(weekDir, { recursive: true });
  if (writeIfMissing(path.join(weekDir, "index.md"), renderWeekIndex(week))) scaffolded++;

  const items = [{ text: "주차 개요", link: `/curriculum/${week.dir}/` }];
  for (const page of week.pages) {
    const slug = slugFromFile(page.file);
    if (writeIfMissing(path.join(weekDir, page.file), renderPage(page))) scaffolded++;
    items.push({ text: page.title, link: `/curriculum/${week.dir}/${slug}` });
  }

  sidebar.push({ text: week.title, collapsed: true, items });
}

// 상위 개요는 손으로 다듬은 버전을 보존하되, 없으면 Part 그룹 형태로 생성.
const curriculumIndex = `# 커리큘럼 개요

> "왜 이렇게 설계했는지 설명할 수 있는 프론트"로 체급 올리기

## 하루 루틴 (추천)

- 📘 이론 1~1.5시간
- ✍️ 노트 정리 30분
- 🧠 면접 질문 형태로 말로 설명해보기 30분
- 💻 실무 코드랑 연결해서 "어디에 쓰지?" 생각

## 주차별 목록

${parts
  .map(
    (part) =>
      `**${part.title}**\n\n` +
      part.dirs.map((dir) => `- [${weekByDir[dir].title}](/curriculum/${dir}/)`).join("\n")
  )
  .join("\n\n")}

## 면접 준비

주제별 Q&A는 [면접 준비](/interview/)에서 확인합니다.
`;

writeIfMissing(path.join(root, "index.md"), curriculumIndex);

// 사이드바는 파생 산출물이므로 항상 재생성.
const sidebarExport = `// Auto-generated by scripts/generate-curriculum.mjs
export const curriculumSidebar = ${JSON.stringify(sidebar, null, 2)} as const;
`;
fs.writeFileSync(path.resolve("docs/.vitepress/curriculum-sidebar.mts"), sidebarExport, "utf8");

console.log(
  `Generated sidebar for ${weeks.length} weeks. Scaffolded ${scaffolded} missing file(s). Existing files preserved.`
);
