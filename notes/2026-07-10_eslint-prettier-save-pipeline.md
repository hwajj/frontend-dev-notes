# 저장 시 ESLint·Prettier 파이프라인

> 작성일: 2026-07-10
> 맥락: ServiceHomecareJobPage 저장 시 `return` 위 빈 줄이 안 생기고, `npx eslint --fix`만 되던 세션

---

## 결론 (한 줄)

`return` 위 빈 줄은 **ESLint 규칙**이고, 저장 시 자동 적용하려면 **ESLint 확장 + `source.fixAll.eslint`** 가 필요하다. 실행 순서는 **ESLint fix → Prettier** 이며, 이 순서는 VS Code/Cursor가 고정한다.

---

## 저장 시 실제 실행 순서

```
Ctrl+S (저장)
 │
 ├─ 1단계: editor.codeActionsOnSave
 │         └─ source.fixAll.eslint  →  ESLint --fix (dbaeumer.vscode-eslint 확장)
 │
 └─ 2단계: editor.formatOnSave
           └─ editor.defaultFormatter  →  Prettier (esbenp.prettier-vscode 확장)
```

**ESLint fix → Prettier** 순서가 맞다. Prettier → ESLint 순서는 틀렸다.

### 순서를 누가 정하나?

**VS Code / Cursor 에디터 엔진**이 정한다. 프로젝트 `settings.json`이나 ESLint/Prettier 설정 파일 어디에도 순서를 바꾸는 옵션은 없다.

- `editor.codeActionsOnSave` — 저장 시 code action **실행 여부**
- `editor.formatOnSave` — 저장 시 포맷 **실행 여부**
- 둘 사이 **실행 순서** — 에디터 내부 고정 (code action이 항상 먼저)

Microsoft VS Code PR에서 처음부터 `code actions are run before format` 으로 설계됨.

### codeActionsOnSave 안에서만 순서 조절 가능

같은 1단계 **안에서** 여러 action 순서는 배열로 지정 가능:

```json
"editor.codeActionsOnSave": [
  "source.organizeImports",
  "source.fixAll.eslint"
]
```

`formatOnSave`(Prettier)와의 순서는 여전히 바꿀 수 없다. Prettier는 항상 2단계.

---

## 설정 한눈에 보기

| 설정 | 위치 | 하는 일 |
|------|------|---------|
| `source.fixAll.eslint: "always"` | `.vscode/settings.json` | 저장 시 ESLint fix **실행 여부** |
| `editor.formatOnSave: true` | `.vscode/settings.json` | 저장 시 포맷 **실행 여부** |
| `editor.defaultFormatter` | `.vscode/settings.json` | 포맷터 = Prettier **지정** |
| `padding-line-between-statements` | `.eslintrc.cjs` | `return` 위 빈 줄 **규칙** |
| `extends: ["prettier"]` | `.eslintrc.cjs` | Prettier와 겹치는 ESLint 규칙 **끔** |
| **실행 순서** (ESLint fix → Prettier) | **VS Code/Cursor 내부** | **사용자가 설정 불가** |

> 실행 순서만 예외: `settings.json`에 켜고 끄는 옵션이 아니라, 에디터 엔진이 `codeActionsOnSave` → `formatOnSave` 로 고정한다.

---

## 역할 분리 — 누가 뭘 하나

| 담당 | 도구 | 하는 일 |
|------|------|---------|
| 빈 줄·import/export 간격 | ESLint `padding-line-between-statements` | `return` 위 빈 줄 추가 등 |
| 들여쓰기·따옴표·세미콜론 | Prettier | 코드 스타일 포맷 |
| 충돌 방지 | `eslint-config-prettier` | Prettier와 겹치는 ESLint 규칙 끔 |

Prettier는 `return` 위 빈 줄을 **추가하지도, 제거하지도 않는다** (있으면 유지).

---

## 충돌을 어떻게 피했나

### 1. `eslint-config-prettier` (`extends` 마지막에 `"prettier"`)

Prettier와 겹치는 ESLint 스타일 규칙(따옴표, 세미콜론, 들여쓰기 등)을 끈다.  
ESLint fix와 Prettier가 같은 것을 두 번 고치지 않게 한다.

### 2. `padding-line-between-statements`는 rules에서 다시 켬

`eslint-config-prettier`가 원래 이 규칙도 끄지만, `.eslintrc.cjs`의 `rules`에 직접 넣으면 **override되어 살아남는다**.

### 3. 실제 저장 흐름

```
1. ESLint fix  →  return 위 빈 줄 추가
2. Prettier    →  들여쓰기·줄바꿈 등만 정리, 빈 줄은 유지
```

### eslint-config-prettier 없이 둘 다 스타일을 건드리면?

```
1. ESLint fix  →  따옴표/세미콜론 수정
2. Prettier    →  다시 덮어씀  ← ESLint 수정 무효화
```

순서가 ESLint → Prettier여도 **같은 스타일을 둘 다 건드리면** 충돌한다.

---

## 이 레포 설정

### `.eslintrc.cjs`

```js
extends: [
  "eslint:recommended",
  "plugin:@typescript-eslint/recommended",
  "plugin:react-hooks/recommended",
  "prettier", // ← 마지막: stylistic 충돌 규칙 끔
],
rules: {
  "padding-line-between-statements": [
    "error",
    { blankLine: "always", prev: ["const", "let", "var", "expression"], next: "return" },
    { blankLine: "always", prev: "import", next: "*" },
    { blankLine: "any", prev: "import", next: "import" },
    { blankLine: "always", prev: "*", next: "export" },
  ],
},
```

### `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "always"
  },
  "eslint.enable": true,
  "eslint.validate": ["typescript", "typescriptreact"],
  "eslint.codeActionsOnSave.mode": "all",
  "eslint.workingDirectories": [{ "mode": "auto" }]
}
```

### `.vscode/extensions.json` (권장 확장)

```json
{
  "recommendations": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
}
```

---

## `explicit` vs `always`

| 값 | 의미 |
|----|------|
| `"always"` | 수동 저장 + **자동 저장** 모두 ESLint fix 실행 |
| `"explicit"` | **Ctrl+S 수동 저장만** 실행, 자동 저장은 스킵 |

순서와는 무관. **언제** 돌지의 차이.

---

## 확장 없을 때 CLI만 되는 이유

```
터미널: npx eslint --fix   →  Node.js가 ESLint CLI 직접 실행 ✅

저장:   source.fixAll.eslint  →  ESLint 확장이 VS Code에 연결해 실행
                                  확장 없으면 설정만 있고 아무 일도 안 함 ❌
```

`source.fixAll.eslint`는 에디터에게 내리는 명령이고, 실제 수행은 **`dbaeumer.vscode-eslint` 확장**이 담당한다.

이번 세션에서 Prettier 확장만 있고 ESLint 확장이 없어서, 저장 시 Prettier만 돌고 빈 줄은 안 생겼다.

### 해결됨 (이번 세션)

`dbaeumer.vscode-eslint` 설치 + **Developer: Reload Window** 후, 저장(Ctrl+S) 시 `return` 위 빈 줄 자동 적용 **정상 동작 확인**.

```
문제 당시:  확장 없음  →  저장 시 ESLint fix ❌, CLI만 ✅
해결 후:    확장 + 리로드  →  저장 시 ESLint fix ✅
```

---

## 트러블슈팅 체크리스트

1. `dbaeumer.vscode-eslint` 확장 설치 여부
2. `Developer: Reload Window` 후 재시도
3. `return` 위 빈 줄 지운 뒤 **Ctrl+S** (수동 저장)
4. Output 패널 → **ESLint** 채널 에러 확인
5. 터미널에서 `npx eslint "파일경로" --fix` 로 규칙 자체가 동작하는지 확인

---

## 학습 키워드

- `editor.codeActionsOnSave` / `editor.formatOnSave` — 저장 시 동작 on/off (순서 아님)
- `source.fixAll.eslint` — ESLint 확장을 통한 저장 시 `--fix`
- `eslint-config-prettier` — ESLint·Prettier stylistic 충돌 방지
- `padding-line-between-statements` — Prettier가 모르는 빈 줄 규칙
- `eslint.codeActionsOnSave.mode: "all"` — fixable 규칙 전부 자동 수정
