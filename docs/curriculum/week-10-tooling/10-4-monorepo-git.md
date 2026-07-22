# 모노레포 & Git 설정

## 키워드

- **모노레포** — 여러 패키지를 한 레포에서 관리(workspaces, Turborepo, pnpm).
- **로컬 alias** — 패키지 간 경로 별칭(`@app/*`), tsconfig `paths` + 번들러 resolve.
- **workspace 프로토콜** — `workspace:*`로 내부 패키지 링크.
- **.git/info/exclude** — 팀 `.gitignore` 건드리지 않고 **내 PC만** 무시.
- **.gitignore vs exclude** — 공유 규칙 vs 개인 규칙.

## 면접 포인트

- **Q. 모노레포의 장단점은?**
  → 장점: 코드 공유·원자적 변경·일관 툴링. 단점: 빌드/CI 복잡, 경계 관리 필요.
- **Q. 내 로컬 파일만 git에서 무시하려면?**
  → `.gitignore`(공유) 대신 `.git/info/exclude`(로컬 전용)에 추가. 팀 설정을 오염시키지 않는다.
- **Q. 로컬 alias가 빌드에서 깨지는 이유는?**
  → tsconfig `paths`만 설정하고 번들러 resolve(alias)를 안 맞추면 타입은 통과해도 런타임/빌드가 못 찾는다. 둘을 함께 설정.

## 관련 실무 노트

- `notes/study/2026-05-29_monorepo-local-alias.md`
- `notes/2026-06-02_git-local-exclude.md`

## 목표

- 모노레포 구조와 트레이드오프를 설명할 수 있다.
- tsconfig paths + 번들러 alias를 정합하게 설정한다.
- 로컬 전용 git ignore를 활용한다.
