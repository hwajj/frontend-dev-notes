# 번들러 & 번들 최적화

## 키워드

- **번들러(webpack / Vite / esbuild)** — 여러 모듈을 브라우저용으로 묶는 도구. Vite는 dev에서 ESM+esbuild로 빠름.
- **CommonJS (CJS)** — `require` / `module.exports`. Node 전통 모듈. 정적 분석이 어려워 Tree Shaking에 불리.
- **ESM** — `import` / `export`. 정적 구조라 번들러가 미사용 export를 제거하기 쉽다.
- **Code Splitting** — 번들을 나눠 필요한 것만 로드. 라우트 단위 분리가 대표.
- **Lazy Loading** — `React.lazy` + `Suspense`로 컴포넌트 지연 로드.
- **Tree Shaking** — 안 쓰는 export 제거. ESM·sideEffects 설정이 전제.
- **Dynamic import** — `import()`로 런타임 분할 로드.

## 모듈 시스템 (CJS vs ESM)

| | CommonJS | ESM |
|--|----------|-----|
| 문법 | `require`, `module.exports` | `import`, `export` |
| 로딩 | 동기·런타임에 경로 결정 가능 | 정적(분석 가능) + 동적 `import()` |
| Tree Shaking | 어렵다(무엇을 export했는지 빌드가 확신하기 힘듦) | 가능(전제: side effect 관리) |

브라우저·모던 번들은 ESM을 전제로 최적화한다. 라이브러리가 CJS만 제공하면 shaking이 약해지고 번들이 커질 수 있다. Node 서버(→ 11-1)에서도 `"type": "module"` vs CJS 혼용 이슈가 난다.

## 면접 포인트

- **Q. Code Splitting은 어떤 지표를 개선하나?**
  → 초기 번들 크기↓ → 초기 로드/TTI 개선(→ CSR·Web Vitals와 연결). 대신 요청 수·워터폴은 관리 필요.
- **Q. Tree Shaking이 안 먹는 대표 원인은?**
  → CommonJS 모듈, 부수효과(side effect) 있는 import, 배럴 파일 오용. ESM + `sideEffects: false`가 전제.
- **Q. webpack vs Vite 차이는?**
  → webpack은 번들 기반, Vite는 dev에서 네이티브 ESM+esbuild로 콜드스타트가 빠르고 prod는 Rollup 번들.
- **Q. CJS와 ESM을 왜 구분하나?**
  → 문법·로딩 모델이 다르고, 번들 최적화(Tree Shaking)·상호 운용(`require(esm)`) 이슈의 출발점이다.

## 관련 실무 노트

- `notes/2026-06-08_node-openssl-webpack.md`
- `notes/2026-06-15_script-loading-and-js-modules.md`

## 목표

- 번들러의 역할과 webpack/Vite 차이를 설명할 수 있다.
- CJS vs ESM이 Tree Shaking·상호 운용에 미치는 영향을 안다.
- code splitting·lazy loading으로 초기 로드를 개선한다.
