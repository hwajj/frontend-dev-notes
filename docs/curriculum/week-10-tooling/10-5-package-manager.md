# 패키지 관리 (npm · pnpm · lockfile · semver)

## 키워드

- **npm / pnpm / yarn** — Node 패키지 매니저. 설치·스크립트·워크스페이스 지원 방식이 다름.
- **lockfile** — `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`. **실제로 설치된 트리**를 고정.
- **semantic versioning** — `MAJOR.MINOR.PATCH`. 호환 범위 표기: `^`, `~`, exact.
- **dependencies** — 런타임에 필요한 패키지.
- **devDependencies** — 빌드·테스트·린트용. 프로덕션 번들에 안 넣으려는 의도(번들러가 최종 결정).
- **peerDependencies** — "호스트가 이 버전을 갖고 있어야 함"(예: React를 쓰는 라이브러리). 중복 React를 막기 위함.
- **workspace** — 모노레포 내 패키지 연결(→ 10-4).

## 개념 정리

### 왜 lockfile을 커밋하나

`package.json`의 `"lodash": "^4.17.0"`은 **허용 범위**일 뿐, 오늘 설치와 내일 설치가 미묘하게 다를 수 있다. lockfile이 있으면 CI·팀원이 **같은 트리**를 재현한다. "내 PC에선 되는데"의 흔한 원인 중 하나가 lock 미커밋·매니저 혼용이다.

### `^` / `~` / exact

| 표기 | 대략적 의미 |
|------|-------------|
| `^1.2.3` | 같은 메이저 안에서 업데이트 허용 (1.x) |
| `~1.2.3` | 같은 마이너 패치 허용 (1.2.x) |
| `1.2.3` | 그 버전만 |

라이브러리 앱은 `^`가 흔하고, 배포 재현성이 극도로 중요하면 exact + lock에 더 기댄다.

### peerDependencies

컴포넌트 라이브러리가 React를 dependencies에 넣으면 **앱 React와 두 개가 설치**되어 훅 규칙·번들이 깨질 수 있다. peer로 "React는 앱이 제공"이라고 선언한다.

### npm vs pnpm (감각)

- **npm** — 기본, 생태계 표준에 가까움
- **pnpm** — content-addressable store + 심링크, 디스크·모노레포에 강점, 호이스팅이 엄격해 phantom dependency를 드러냄
- 팀에서 **매니저를 하나로 고정**하고 lockfile을 그 매니저 것으로 유지한다.

## 면접 포인트

- **Q. lockfile을 왜 커밋하나?**
  → 허용 범위(`^`)만으로는 설치마다 트리가 달라질 수 있다. lock이 재현 가능한 빌드를 만든다.
- **Q. `^`와 `~` 차이는?**
  → `^`는 메이저 고정 하에서 더 넓은 업데이트, `~`는 마이너 고정에 가깝다.
- **Q. peerDependencies는 왜 쓰나?**
  → 호스트(앱)가 제공하는 단일 인스턴스(예: React)를 쓰게 해 중복·불일치를 줄인다.
- **Q. dependencies와 devDependencies 차이는?**
  → 런타임 필요 vs 개발·빌드 도구. 프론트 번들은 결국 bundler가 import 그래프를 따라가므로 "dev면 절대 안 들어간다"와는 별개로, **의도·설치 범위**를 나눈다.

## 목표

- lockfile·semver 표기로 설치 재현성을 설명할 수 있다.
- peerDependencies의 존재 이유를 React 예시로 말한다.
- 팀 패키지 매니저 통일 + 10-4 워크스페이스로 연결한다.
