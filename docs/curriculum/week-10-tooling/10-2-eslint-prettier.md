# ESLint & Prettier 파이프라인

## 키워드

- **ESLint** — 코드 품질·버그 패턴을 잡는 린터(규칙 기반).
- **Prettier** — 코드 포맷터(스타일 통일). "품질(ESLint) vs 포맷(Prettier)" 역할 분리.
- **역할 충돌** — 포맷 관련 규칙은 `eslint-config-prettier`로 끄고 Prettier에 위임.
- **format on save** — 에디터 저장 시 자동 포맷. `.vscode/settings.json`.
- **pre-commit 훅** — husky + lint-staged로 커밋 전 검사.

## 면접 포인트

- **Q. ESLint와 Prettier의 역할 차이는?**
  → ESLint는 "버그 날 만한 코드"를, Prettier는 "보이는 스타일"을 담당. 겹치는 포맷 규칙은 Prettier에 넘겨 충돌을 없앤다.
- **Q. 저장 시 포맷이 안 먹는 흔한 원인은?**
  → 에디터 기본 포매터 미지정, ESLint/Prettier 규칙 충돌, 확장 미설치. 파이프라인(에디터→ESLint→Prettier)을 명시적으로 정렬해야 한다.
- **Q. 팀 일관성을 어떻게 강제하나?**
  → 설정을 레포에 커밋 + pre-commit 훅(lint-staged)으로 커밋 시점에 자동 검사·수정.

## 관련 실무 노트

- `notes/2026-07-10_eslint-prettier-save-pipeline.md`
- `notes/2026-07-10_VSCode-Prettier-ESLint-정리.md`

## 목표

- ESLint/Prettier 역할을 분리하고 충돌을 제거한다.
- format on save + pre-commit 파이프라인을 구성한다.
- 팀 일관성을 자동화로 강제하는 방법을 안다.
