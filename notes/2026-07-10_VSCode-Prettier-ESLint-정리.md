# VS Code / Cursor + Prettier + ESLint 설정 정리

## 전체 구조

``` text
저장(Ctrl+S)
    │
    ├─ 1. ESLint 자동 수정 (codeActionsOnSave)
    │      → import/export 사이 빈 줄, return 앞 빈 줄 등
    │
    └─ 2. Prettier 포맷 (formatOnSave)
           → 들여쓰기, 따옴표, 세미콜론, 줄 길이 등
```

> 역할 분담
>
> -   **ESLint**: 코드 품질 및 구조(자동 수정 가능한 규칙)
> -   **Prettier**: 코드 스타일 통일
> -   **eslint-config-prettier**: 두 도구의 충돌 방지

------------------------------------------------------------------------

## 1. Cursor `settings.json`

``` json
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
"prettier.requireConfig": true,
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": "always"
}
```

  -----------------------------------------------------------------------
  설정                                의미
  ----------------------------------- -----------------------------------
  `editor.formatOnSave`               저장 시 Prettier 실행

  `editor.defaultFormatter`           기본 포맷터를 Prettier로 지정

  `prettier.requireConfig`            `.prettierrc`가 있는 프로젝트에서만
                                      Prettier 실행

  `source.fixAll.eslint`              저장 시 ESLint 자동 수정 실행
  -----------------------------------------------------------------------

### 저장 시 실행 순서

1.  ESLint Fix (`source.fixAll.eslint`)
2.  Prettier Format (`formatOnSave`)

------------------------------------------------------------------------

## 2. `.prettierrc`

``` json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

  옵션            설명
  --------------- --------------------------
  printWidth      한 줄 최대 100자
  tabWidth        2칸 들여쓰기
  semi            세미콜론 사용
  singleQuote     큰따옴표 사용
  trailingComma   ES5 범위에서 마지막 콤마
  arrowParens     화살표 함수 괄호 유지
  endOfLine       LF 줄바꿈

Prettier는 **스타일만** 담당합니다.

------------------------------------------------------------------------

## 3. `.eslintrc.cjs`

``` js
extends: [
  "eslint:recommended",
  "plugin:@typescript-eslint/recommended",
  "plugin:react-hooks/recommended",
  "prettier",
]
```

### extends

  항목                             역할
  -------------------------------- -------------------------------------------------
  eslint:recommended               기본 JS 검사
  @typescript-eslint/recommended   TypeScript 규칙
  react-hooks/recommended          React Hooks 검사
  prettier                         Prettier와 충돌하는 ESLint 스타일 규칙 비활성화

### rules

``` js
"padding-line-between-statements": [
  "error",
  { blankLine: "always", prev: ["const", "let", "var", "expression"], next: "return" },
  { blankLine: "always", prev: "import", next: "*" },
  { blankLine: "any", prev: "import", next: "import" },
  { blankLine: "always", prev: "*", next: "export" },
]
```

자동 적용되는 스타일

-   import끼리는 붙여쓰기
-   import 블록 뒤 한 줄
-   return 앞 한 줄
-   export 앞 한 줄

------------------------------------------------------------------------

## 역할 분담

  도구                     담당
  ------------------------ ------------------------------------------------
  Prettier                 들여쓰기, 따옴표, 세미콜론, 줄바꿈
  ESLint                   코드 품질, Hooks, unused vars, 의미 있는 빈 줄
  eslint-config-prettier   충돌 방지

------------------------------------------------------------------------

## package.json

``` json
"lint": "eslint . --ext ts,tsx",
"lint:fix": "eslint . --ext ts,tsx --fix",
"format": "prettier --write \"src/**/*.{ts,tsx,json,css,scss,md}\""
```

  명령어             역할
  ------------------ --------------------
  npm run lint       전체 검사
  npm run lint:fix   전체 자동 수정
  npm run format     전체 Prettier 포맷

------------------------------------------------------------------------

## 동작하지 않을 때 체크

1.  Prettier 확장 설치
2.  ESLint 확장 설치
3.  `.prettierrc` 존재 여부
4.  프로젝트 루트를 열었는지 확인
5.  ESLint Output에 오류가 없는지 확인

------------------------------------------------------------------------

## 최종 요약

``` text
Ctrl + S
    │
    ▼
ESLint Fix
    │
    ├─ import 뒤 빈 줄
    ├─ return 앞 빈 줄
    └─ 기타 autofix
    │
    ▼
Prettier
    │
    ├─ 들여쓰기
    ├─ 따옴표
    ├─ 줄 길이
    ├─ 세미콜론
    └─ 최종 스타일 통일
```

이 구성이 가장 일반적인 실무 구성이다.
