# 모노레포 패키지를 다른 앱에서 바로 테스트하기

> 작성일: 2026-05-29  
> 맥락: 공유 라이브러리를 npm에 올리기 전에, **내 백오피스 앱**에서 소스를 바로 import해 수정·확인하고 싶다.

## 먼저 이것만

1. **alias** = `import '문자열'`을 디스크 **폴더**에 연결하는 Vite·TypeScript 설정이다.
2. 라이브러리 **소스 안**은 종종 `__@hook__/…`처럼 **내부 전용 이름**으로 서로 import한다.
3. 소비 앱에서 테스트할 때는 **① npm 이름**만 alias 하면 부족하고, **② 내부 alias(`__@hook__`)도 같은 폴더**를 가리켜야 빌드가 된다.
4. 수동으로 `vite.config.ts` + `tsconfig paths`에 넣거나, 팀 도구(`apply-aliases`)로 한 번에 패치한다.

## 이 글의 질문

- publish / `npm link` 없이 로컬 소스를 붙이려면 설정에 뭘 넣나?
- 패키지 이름(`@backoffice-fe/hook`)과 `__@hook__`은 왜 둘 다 얘기되나?

## 핵심 (먼저 읽기)

| 이름 종류 | 예시 | 누가 쓰나 |
|-----------|------|-----------|
| **npm 패키지명** | `@backoffice-fe/hook` | `package.json`·배포 후 `import` |
| **내부 alias** | `__@hook__/useBlocker` | 라이브러리 **소스 파일끼리** |
| **로컬 테스트용 alias** | `@hook-dev` 또는 직접 지정 | 소비 앱에서 **소스 폴더**를 가리킬 때 |

| 방식 | 장점 | 단점 |
|------|------|------|
| `npm link` + `dist` | 설정 간단 | 빌드본만 봄, HMR·타입 추적 느림 |
| **소스 alias** | 저장 즉시 반영 | vite + tsconfig **둘 다** 맞춰야 함 |

## 전제 (30초)

- **모노레포**: hook·form 등 여러 패키지가 한 저장소 `packages/hook/src` 같은 경로에 있음.
- **소비 앱**: Vite + React로 돌아가는 실제 화면 프로젝트(별도 폴더).
- **Vite**: 번들할 때 alias로 `import` 경로를 실제 파일로 바꿈.
- **TypeScript `paths`**: 에디터·`tsc`가 같은 경로를 이해하게 함 (Vite만 맞고 tsconfig가 틀리면 빨간 줄).

## 한눈에 — import 한 줄이 어디로 가나

**배포 후 (일반)**

```
소비 앱  import { useBlocker } from '@backoffice-fe/hook'
              → node_modules/@backoffice-fe/hook/dist/...  (빌드 결과)
```

**로컬 소스 연결 (이 글의 목표)**

```
소비 앱  import { useBlocker } from '@hook-dev'
              → /SHARED/packages/hook/src/index.ts  (소스)

그런데 hook 소스 안에는 이미:
  import { x } from '__@hook__/useParamState/utils'
              → 같은 /SHARED/packages/hook/src/... 를 가리켜야 함
```

내부 alias를 소비 앱에 안 넣으면, Vite가 hook 패키지를 파다가 `__@hook__`를 **못 찾아** 실패하거나 React가 **두 번 로드**되는 식의 이상이 난다.

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `SHARED` | 공유 라이브러리 루트 폴더 (예: `../backoffice-shared`) |
| `__@hook__` | hook 패키지 소스 전용 path alias (패키지마다 `__@이름__` 패턴) |
| `paths` | `tsconfig`의 `compilerOptions.paths` — TS 경로 매핑 |
| `resolve.alias` | Vite의 `resolve.alias` — 번들러 경로 매핑 |

## 함정 한 가지

**착각**: 소비 앱에서 `@backoffice-fe/hook`만 alias 하면 된다.  
**실제**: 라이브러리 **내부 파일**은 `__@hook__/…`로 import한다. 소비 앱의 Vite/tsconfig에 **`__@hook__` → `packages/hook/src`** 가 없으면, hook 소스를 읽는 순간 해석이 끊긴다.

## 왜 이렇게인가

`npm link`는 보통 **이미 빌드된 `dist`**를 가리킨다. 라이브러리 코드를 고치면 매번 rebuild하거나, 소스맵만으로는 타입·HMR이 불편하다.  
그래서 소비 앱이 **직접 `packages/hook/src`를 읽게** alias를 둔다.  
내부 alias(`__@hook__`)는 publish 이름과 분리해, 패키지 안에서는 항상 같은 짧은 경로로 import하기 위함이다. 소비 앱이 그 소스를 번들할 때는 **내부 alias 규칙까지 복제**해야 한다.

## 실무 체크포인트 — 손으로 따라 하기

`MY_APP` = 백오피스 앱 루트, `SHARED` = 공유 레포 루트 (`MY_APP`에서 본 상대 경로).

### 1) 폴더가 맞는지 확인

hook 소스가 아래에 있어야 한다.

`SHARED/packages/hook/src/index.ts` (또는 export하는 진입 파일)

### 2) Vite — 번들러 alias

`MY_APP/vite.config.ts` 상단에 `path` import가 없으면 추가한다.

```typescript
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      // ① 라이브러리 내부 import용 — 필수
      '__@hook__': path.resolve(__dirname, '../SHARED/packages/hook/src'),
      // ② 소비 앱에서 쓸 이름 — 아무 이름이나 가능 (예: @hook-dev)
      '@hook-dev': path.resolve(__dirname, '../SHARED/packages/hook/src'),
    },
  },
});
```

`../SHARED`는 실제 상대 경로로 바꾼다 (예: `../backoffice-shared`).

### 3) TypeScript — 에디터·타입 alias

`MY_APP/tsconfig.app.json` (또는 `tsconfig.json`)의 `compilerOptions.paths`:

```json
{
  "compilerOptions": {
    "paths": {
      "__@hook__/*": ["../SHARED/packages/hook/src/*"],
      "@hook-dev/*": ["../SHARED/packages/hook/src/*"]
    }
  }
}
```

### 4) 소비 앱에서 import

```typescript
// 배포본이 아니라 로컬 소스 alias로 import
import { useBlocker } from '@hook-dev';
```

내부 alias는 npm 패키지가 아니므로, `@hook-dev/index`처럼 **실제 export 파일**을 가리키는 형태도 가능하다 (팀 규칙에 따름).

### 5) 동작 확인 (레포 없이 가능)

1. hook 소스에 `console.log` 한 줄 넣고 저장  
2. 소비 앱 dev 서버 새로고침  
3. 로그가 보이면 **소스 alias 경로**가 맞는 것  
4. `Cannot find module '__@hook__/…'` → **②번 `__@hook__` alias 누락**이 거의 전부

| 증상 | 흔한 원인 |
|------|-----------|
| `__@hook__` not found | Vite `resolve.alias`에 내부 alias 없음 |
| 타입만 빨간 줄, 실행은 됨 | `tsconfig paths`만 빠짐 |
| React hook invalid | React가 앱·라이브러리에서 **두 벌** 로드됨 → alias가 `node_modules`와 `src`를 섞음 |

## 참고 코드 — 최소 예시 (개념용)

**라이브러리 소스 안 (내부 alias)**

```typescript
// packages/hook/src/useBlocker/useBlocker.ts (일부)
import { useGlobalEvent } from '__@hook__/useGlobalEvent/useGlobalEvent';
```

**소비 앱이 이 소스를 번들할 때 필요한 것**

```typescript
// vite: '__@hook__' → .../packages/hook/src
// 그래야 위 import가 .../useGlobalEvent/useGlobalEvent.ts 로 풀림
```

## 부록 — backoffice-shared 팀 설정

이 저장소 이름은 **backoffice-shared**. hook npm 이름은 `@backoffice-fe/hook`.

| 도구 | 하는 일 |
|------|---------|
| 수동 | README §3.A — `vite` + `tsconfig`에 `__@hook__`와 테스트용 alias |
| `npx apply-aliases <SHARED경로>` | `@backoffice-fe/dev` CLI가 paths·vite alias 자동 패치 |
| `--package=hook,service` | 일부 패키지만 |

CLI가 넣는 **외부 alias 이름**은 `@hook-dev` 형식(`@패키지명-dev`)이다. README 예시의 `@backoffice-fe/hook/TEST`는 수동 설정 때 쓰는 **별칭**이고, 역할은 같다(둘 다 `packages/hook/src`).

```shell
# MY_APP 폴더에서
npm install -D @backoffice-fe/dev
npx apply-aliases ../backoffice-shared
npx apply-aliases ../backoffice-shared --package=hook,service
```

같은 레포 안에서는 `pnpm run demo`로 `demo/` 앱에 paths만 추가해 패키지를 직접 import해 볼 수 있다.

## 면접 한 줄

「공유 라이브러리 로컬 개발은 link 대신 **소스 alias**이고, 패키지 **내부 alias까지** 소비 앱 Vite·tsconfig에 복제해야 한다.」
