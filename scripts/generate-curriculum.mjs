import fs from "node:fs";
import path from "node:path";

const root = path.resolve("docs/curriculum");

const weeks = [
  {
    dir: "week-01-web-js",
    title: "1주차 — 웹 & JS 기초 체력 다지기",
    summary: "기본기 + 구조 이해. 클린코드 자바스크립트 정리.",
    pages: [
      {
        file: "day-01-http-basics.md",
        title: "Day 1: HTTP 기초",
        keywords: ["HTTP / HTTPS", "Request / Response", "Header", "Status Code"],
        interview: "스크립트 로딩이 렌더에 미치는 영향",
        goal: "주소 치면 무슨 일? 스토리텔링으로 설명 가능",
      },
      {
        file: "day-02-network-flow.md",
        title: "Day 2: 네트워크 연결 흐름",
        keywords: ["DNS lookup", "TCP", "TLS", "URL 입력부터 화면까지"],
      },
      {
        file: "ref-web-deep.md",
        title: "(참고) 웹 동작 원리",
        keywords: [
          "웹 동작 원리",
          "DNS lookup",
          "CORS",
          "쿠키 / 세션 / 토큰",
          "HTTP 상태 코드 패턴",
          "브라우저 캐시 전략",
          "DOMContentLoaded / defer / async",
        ],
        interview: "스크립트 로딩이 렌더에 미치는 영향",
        goal: "주소 치면 무슨 일? 스토리텔링으로 설명 가능",
      },
      {
        file: "day-03-rendering-1.md",
        title: "Day 3: 브라우저 렌더링(1)",
        keywords: ["Browser Rendering", "DOM", "CSSOM", "Render Tree"],
      },
      {
        file: "day-04-rendering-2.md",
        title: "Day 4: 브라우저 렌더링(2)",
        keywords: ["Reflow", "Repaint", "Composite", "requestAnimationFrame"],
      },
      {
        file: "ref-rendering-pipeline.md",
        title: "(참고) 브라우저 렌더링 파이프라인",
        keywords: [
          "CRP (Critical Rendering Path)",
          "DOM / CSSOM / Render Tree",
          "Reflow vs Repaint",
          "브라우저 렌더 순서",
          "requestAnimationFrame",
          "IntersectionObserver",
        ],
        interview: "스크롤/애니메이션 왜 느려졌어요?",
        goal: "왜 이게 느리죠?에 구조적으로 답변",
      },
      {
        file: "day-05-cache-hints.md",
        title: "Day 5: 캐시 & 리소스 힌트",
        keywords: ["Cache-Control", "ETag", "preload", "prefetch"],
      },
      {
        file: "day-06-auth-storage.md",
        title: "Day 6: 인증/저장소",
        keywords: ["Cookie / Session / Token", "JWT", "LocalStorage"],
      },
      {
        file: "day-07-review.md",
        title: "Day 7: 주간 정리",
        keywords: ["노션 정리", "회사 프로젝트 연결"],
        note: "모의면접 Day는 별도 운영",
      },
      {
        file: "ref-js-execution-model.md",
        title: "(참고) JS 실행 모델",
        keywords: [
          "실행 컨텍스트",
          "스코프 체인",
          "Lexical Environment",
          "호이스팅",
          "var / let / const",
          "TDZ",
          "this 바인딩",
          "함수 선언 vs 표현식",
        ],
        interview: "this 왜 깨졌어요? / 클로저 써본 적 있어요?",
        goal: "왜 이 코드 이렇게 돼요? 설명 가능",
      },
    ],
  },
  {
    dir: "week-02-js-advanced",
    title: "2주차 — JS 심화",
    summary: "면접 단골 구간.",
    pages: [
      { file: "day-08-execution-context.md", title: "Day 8: Execution Context", keywords: ["Execution Context"] },
      { file: "day-09-lexical-environment.md", title: "Day 9: Lexical Environment", keywords: ["Lexical Environment"] },
      {
        file: "day-10-scope-closure.md",
        title: "Day 10: Scope Chain / Closure",
        keywords: ["Scope Chain", "Closure"],
      },
      { file: "day-11-hoisting-tdz.md", title: "Day 11: Hoisting / TDZ", keywords: ["Hoisting", "TDZ"] },
      {
        file: "day-12-this-bind.md",
        title: "Day 12: this / bind / call / apply",
        keywords: ["this", "bind", "call", "apply"],
      },
      {
        file: "day-13-prototype.md",
        title: "Day 13: Prototype / Prototype Chain",
        keywords: ["Prototype", "Prototype Chain"],
      },
      { file: "day-14-review.md", title: "Day 14: 주간 정리", keywords: ["노션 정리"], note: "모의면접 Day는 별도 운영" },
      {
        file: "ref-closure-prototype.md",
        title: "(참고) 클로저 & 프로토타입",
        keywords: ["클로저", "프로토타입", "prototype vs __proto__", "Arrow Function 내부 동작"],
        interview: "왜 이 상태가 공유돼요?",
        goal: "클로저 질문 나오면 당황 안 함",
      },
      {
        file: "ref-async-event-loop.md",
        title: "(참고) 비동기 & 이벤트 루프",
        keywords: [
          "Event Loop",
          "Microtask vs Macrotask",
          "Promise 구조",
          "async / await 내부 동작",
          "Error Handling 패턴",
        ],
        interview: "Promise vs setTimeout / microtask vs macrotask / try/catch vs .catch",
        goal: "Promise vs setTimeout 왜 이 순서냐? 그림 그리듯 설명 가능",
      },
      {
        file: "ref-data-functional.md",
        title: "(참고) 데이터 & 함수형 사고",
        keywords: [
          "Deep Copy / Shallow Copy",
          "Immutable data",
          "Side Effect",
          "Pure Function",
          "Memoization",
          "Type Coercion",
          "NaN / undefined / null",
        ],
        interview: "상태 관리 어떻게 했어요?",
        goal: "상태 관리 / 버그 원인 논리적으로 추적",
      },
    ],
  },
  {
    dir: "week-03-typescript-dom",
    title: "3주차 — TypeScript + DOM & 성능",
    summary: "타입스크립트 학습.",
    pages: [
      {
        file: "ref-typescript-deep.md",
        title: "(참고) TypeScript Deep Dive",
        keywords: [
          "타입 추론",
          "타입 가드",
          "제네릭",
          "Utility Types",
          "keyof / typeof / infer",
          "Mapped Type",
          "never / unknown / any",
          "interface vs type",
          "tsconfig strict",
          "타입 호환성",
          "Discriminated Union",
        ],
        interview: "도메인 모델 어떻게 설계했어요?",
        goal: "TS 어느 정도? → 상급자 취급",
      },
      {
        file: "ref-dom-performance.md",
        title: "(참고) DOM & 성능 실전",
        keywords: [
          "DOM API",
          "Event Delegation",
          "Scroll 이벤트 최적화",
          "requestAnimationFrame",
          "Virtual DOM 개념",
          "브라우저 렌더 순서 최적화",
        ],
        interview: "이벤트 위임 왜 써요?",
        goal: "성능 개선 경험 질문 대응",
      },
    ],
  },
  {
    dir: "week-04-network-perf",
    title: "4주차 — 네트워크 + 실무/면접용 성능 최적화",
    pages: [
      {
        file: "ref-data-communication-auth.md",
        title: "(참고) 데이터 통신 & 인증",
        keywords: [
          "RESTful 설계",
          "Fetch API",
          "HTTP Header",
          "JWT 인증",
          "Refresh Token Rotation",
          "Caching Layer",
        ],
        goal: "백엔드랑 같은 언어로 대화",
      },
      {
        file: "ref-network-performance-advanced.md",
        title: "(참고) 네트워크 & 성능 (고급)",
        keywords: [
          "HTTP 캐싱",
          "ETag / Cache-Control",
          "Code Splitting",
          "Tree Shaking",
          "Lazy Loading",
          "이미지 최적화",
        ],
        interview: "메모리 릭 경험?",
        goal: "번들 줄여봤어요? → 실전 답변 가능",
      },
      {
        file: "ref-web-vitals.md",
        title: "(참고) Web Vitals",
        keywords: [
          "Core Web Vitals",
          "FCP / LCP / CLS",
          "CSR vs SSR 성능 비교",
          "Memory Leak",
          "useMemo / memo",
        ],
        goal: "성능 + 아키텍처 질문까지 커버",
      },
    ],
  },
  {
    dir: "week-05-react-rendering",
    title: "5주차 — React Rendering",
    summary: "Day 31~36",
    pages: [
      { file: "day-31-react-rendering.md", title: "Day 31: React Rendering", keywords: ["React Rendering"] },
      { file: "day-32-reconciliation.md", title: "Day 32: Reconciliation", keywords: ["Reconciliation"] },
      { file: "day-33-virtual-dom.md", title: "Day 33: Virtual DOM", keywords: ["Virtual DOM"] },
      { file: "day-34-fiber.md", title: "Day 34: Fiber", keywords: ["Fiber"] },
      { file: "day-35-batching.md", title: "Day 35: Batching", keywords: ["Batching"] },
      { file: "day-36-key.md", title: "Day 36: key", keywords: ["key"] },
    ],
  },
  {
    dir: "week-06-react-hooks",
    title: "6주차 — React Hooks",
    summary: "Day 38~45",
    pages: [
      { file: "day-38-use-state.md", title: "Day 38: useState", keywords: ["useState"] },
      { file: "day-39-use-effect.md", title: "Day 39: useEffect", keywords: ["useEffect"] },
      { file: "day-40-dependency.md", title: "Day 40: dependency", keywords: ["dependency array"] },
      { file: "day-41-stale-closure.md", title: "Day 41: stale closure", keywords: ["stale closure"] },
      { file: "day-42-use-ref.md", title: "Day 42: useRef", keywords: ["useRef"] },
      { file: "day-43-react-memo.md", title: "Day 43: React.memo", keywords: ["React.memo"] },
      { file: "day-44-use-memo.md", title: "Day 44: useMemo", keywords: ["useMemo"] },
      { file: "day-45-use-callback.md", title: "Day 45: useCallback", keywords: ["useCallback"] },
    ],
  },
  {
    dir: "week-07-react-state-error",
    title: "7주차 — React 설계/상태/에러",
    summary: "Day 46~51",
    pages: [
      { file: "day-46-context.md", title: "Day 46: Context", keywords: ["Context"] },
      { file: "day-47-zustand-redux.md", title: "Day 47: Zustand / Redux", keywords: ["Zustand", "Redux"] },
      { file: "day-48-custom-hook.md", title: "Day 48: Custom Hook", keywords: ["Custom Hook"] },
      { file: "day-49-controlled-component.md", title: "Day 49: Controlled Component", keywords: ["Controlled Component"] },
      { file: "day-50-error-boundary.md", title: "Day 50: Error Boundary", keywords: ["Error Boundary"] },
      { file: "day-51-suspense.md", title: "Day 51: Suspense", keywords: ["Suspense"] },
    ],
  },
  {
    dir: "week-08-network-api",
    title: "8주차 — 네트워크/API",
    summary: "Day 53~59",
    pages: [
      { file: "day-53-rest.md", title: "Day 53: REST", keywords: ["REST"] },
      { file: "day-54-fetch.md", title: "Day 54: Fetch", keywords: ["Fetch API"] },
      { file: "day-55-abort-controller.md", title: "Day 55: AbortController", keywords: ["AbortController"] },
      { file: "day-56-jwt.md", title: "Day 56: JWT", keywords: ["JWT"] },
      { file: "day-57-refresh-token.md", title: "Day 57: Refresh Token", keywords: ["Refresh Token"] },
      { file: "day-58-cors.md", title: "Day 58: CORS", keywords: ["CORS"] },
      { file: "day-59-api-design.md", title: "Day 59: API 설계", keywords: ["API 설계"] },
    ],
  },
  {
    dir: "week-09-web-vitals",
    title: "9주차 — Core Web Vitals & 번들",
    summary: "Day 61~67",
    pages: [
      { file: "day-61-core-web-vitals.md", title: "Day 61: Core Web Vitals", keywords: ["Core Web Vitals"] },
      { file: "day-62-lcp.md", title: "Day 62: LCP", keywords: ["LCP"] },
      { file: "day-63-cls.md", title: "Day 63: CLS", keywords: ["CLS"] },
      { file: "day-64-inp.md", title: "Day 64: INP", keywords: ["INP"] },
      { file: "day-65-code-splitting.md", title: "Day 65: Code Splitting", keywords: ["Code Splitting"] },
      { file: "day-66-lazy-loading.md", title: "Day 66: Lazy Loading", keywords: ["Lazy Loading"] },
      { file: "day-67-tree-shaking.md", title: "Day 67: Tree Shaking", keywords: ["Tree Shaking"] },
    ],
  },
  {
    dir: "week-10-rendering-strategy",
    title: "10주차 — 렌더링 전략/리소스/프로파일링",
    summary: "Day 68~74",
    pages: [
      { file: "day-68-csr.md", title: "Day 68: CSR", keywords: ["CSR"] },
      { file: "day-69-ssr.md", title: "Day 69: SSR", keywords: ["SSR"] },
      { file: "day-70-hydration.md", title: "Day 70: Hydration", keywords: ["Hydration"] },
      { file: "day-71-cdn.md", title: "Day 71: CDN", keywords: ["CDN"] },
      { file: "day-72-image-optimization.md", title: "Day 72: 이미지 최적화", keywords: ["이미지 최적화"] },
      { file: "day-73-font-optimization.md", title: "Day 73: Font 최적화", keywords: ["Font 최적화"] },
      { file: "day-74-react-profiler.md", title: "Day 74: React Profiler", keywords: ["React Profiler"] },
    ],
  },
  {
    dir: "week-11-career",
    title: "11주차 — 경력 무기화",
    summary: "Day 75~80",
    pages: [
      { file: "day-75-project-retrospective-1.md", title: "Day 75: 프로젝트 회고 ①", keywords: ["프로젝트 회고"] },
      { file: "day-76-project-retrospective-2.md", title: "Day 76: 프로젝트 회고 ②", keywords: ["프로젝트 회고"] },
      { file: "day-77-incident-experience.md", title: "Day 77: 장애 경험 정리", keywords: ["장애 경험"] },
      { file: "day-78-performance-improvement.md", title: "Day 78: 성능 개선 경험 정리", keywords: ["성능 개선"] },
      { file: "day-79-collaboration.md", title: "Day 79: 협업 경험 정리", keywords: ["협업 경험"] },
      { file: "day-80-star-answers.md", title: "Day 80: STAR 답변 작성", keywords: ["STAR 답변"] },
    ],
  },
];

function slugFromFile(file) {
  return file.replace(/\.md$/, "");
}

function renderPage({ title, keywords = [], interview, goal, note }) {
  const lines = [`# ${title}`, "", "## 키워드", ""];
  for (const kw of keywords) lines.push(`- ${kw}`);
  lines.push("", "## 면접 포인트", "", interview ? `- ${interview}` : "(작성 예정)");
  lines.push("", "## 목표", "", goal ? `- ${goal}` : "(작성 예정)");
  if (note) {
    lines.push("", "## 참고", "", `- ${note}`);
  }
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

const sidebar = [];

fs.mkdirSync(root, { recursive: true });

for (const week of weeks) {
  const weekDir = path.join(root, week.dir);
  fs.mkdirSync(weekDir, { recursive: true });
  fs.writeFileSync(path.join(weekDir, "index.md"), renderWeekIndex(week), "utf8");

  const items = [{ text: "주차 개요", link: `/curriculum/${week.dir}/` }];
  for (const page of week.pages) {
    const slug = slugFromFile(page.file);
    fs.writeFileSync(path.join(weekDir, page.file), renderPage(page), "utf8");
    items.push({ text: page.title, link: `/curriculum/${week.dir}/${slug}` });
  }

  sidebar.push({ text: week.title, collapsed: true, items });
}

const curriculumIndex = `# 커리큘럼 개요

> "왜 이렇게 설계했는지 설명할 수 있는 프론트"로 체급 올리기

## 하루 루틴 (추천)

- 📘 이론 1~1.5시간
- ✍️ 노트 정리 30분
- 🧠 면접 질문 형태로 말로 설명해보기 30분
- 💻 실무 코드랑 연결해서 "어디에 쓰지?" 생각

## 주차별 목록

${weeks
  .map((w) => `- [${w.title}](/curriculum/${w.dir}/)`)
  .join("\n")}

## 면접 준비

주제별 Q&A는 [면접 준비](/interview/)에서 확인합니다.
`;

fs.writeFileSync(path.join(root, "index.md"), curriculumIndex, "utf8");

const sidebarExport = `// Auto-generated by scripts/generate-curriculum.mjs
export const curriculumSidebar = ${JSON.stringify(sidebar, null, 2)} as const;
`;

fs.writeFileSync(path.resolve("docs/.vitepress/curriculum-sidebar.mts"), sidebarExport, "utf8");

console.log(`Generated ${weeks.length} weeks under docs/curriculum/`);
