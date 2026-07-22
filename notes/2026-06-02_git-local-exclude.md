# Git — 팀용 .gitignore 말고, 내 PC만 무시하기

> 작성일: 2026-06-02
> 맥락: `.cursor/`·`.study/`처럼 **나만 쓰는 폴더**를 Git에 안 올리고 싶은데, 팀 `.gitignore`에는 넣기 싫거나, 다른 클론에는 영향을 주면 안 될 때 — “로컬에만 적용한 설정이 맞는지” 어떻게 확인하는지가 헷갈린다.

## 이 글의 질문

- `.gitignore`랑 “로컬만” 무시는 뭐가 다른가?
- 설정은 어디에 두고, **제대로 먹는지** 어떻게 확인하나?
- 다른 PC에서 clone하면 그대로 따라오나?

## 핵심 (먼저 읽기)

| 방식 | 파일 위치 | 커밋·공유 | 쓰는 때 |
|------|-----------|-----------|---------|
| **`.gitignore`** | 저장소 루트 | ✅ 팀 전체 | 모두가 같이 무시할 패턴 |
| **`.git/info/exclude`** | `.git/info/exclude` | ❌ 이 클론만 | 나만 무시 (AI 폴더, 개인 학습 노트 등) |
| **`core.excludesfile`** | git이 가리키는 경로 (보통 홈 디렉터리) | ❌ 내 PC의 모든 저장소 | 여러 프로젝트 공통 패턴 |

**확인 한 줄**: `git check-ignore -v <파일경로>` → 어떤 파일·몇 번째 줄 규칙이 적용됐는지 나온다.

이 레포에서 흔한 조합: 팀은 `.gitignore`에 `.cursor/checkpoints/`만 두고, 개발자는 로컬 `exclude`에 `.cursor/`, `.study/` 전체를 추가해 **개인 도구·노트는 커밋 대상에서 빼는** 패턴.

## 전제 (30초)

- **Git**은 파일을 “추적(tracked)”하거나 “추적 안 함(untracked)”으로 둔다.
- **무시(ignore)**는 “`git add`·`git status`에 안 잡히게” 하는 규칙이다. 무시 ≠ 삭제; 디스크에는 그대로 있다.
- 규칙은 **여러 곳**에 쓸 수 있고, Git이 합쳐서 판단한다. “어디에 썼는지”에 따라 **팀에 공유되느냐**가 갈린다.

## 한눈에

```
[팀 공유]  .gitignore  ──commit──►  origin  ──clone──►  모든 PC에 동일 규칙

[이 PC만]  .git/info/exclude  ──►  .git/ 폴더 안  ──►  커밋 안 됨, clone해도 안 따라옴

[내 모든 repo]  ~/.gitignore_global (예)  ◄── core.excludesfile
```

**확인 흐름**

```
의심하는 경로 (예: .study/INDEX.md)
        │
        ▼
git check-ignore -v .study/INDEX.md
        │
        ├─ 출력 있음 → "어느 파일:몇번째줄:패턴" 이 규칙이 적용됨
        └─ 출력 없음 → 무시 안 됨 (또는 이미 tracked)
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| tracked | 한 번이라도 `git add`·커밋된 파일. ignore만으로는 안 빠짐 |
| untracked | Git이 아직 모르는 새 파일 |
| ignore 규칙 | `git status`에 안 나오게 하는 glob 패턴 (`*.log`, `.study/` 등) |
| `.git/info/exclude` | **이 저장소 클론 하나**에만 적용되는 ignore 파일 |
| `core.excludesfile` | Git 설정 키. “전역 ignore 파일 경로”를 가리킴 |
| `git check-ignore` | 경로가 무시되는지, **어떤 규칙**인지 검사하는 명령 |

---

## 한 줄 요약

**팀 규칙은 `.gitignore`에, “나만”은 `.git/info/exclude`(또는 전역 excludesfile)에 두고, `git check-ignore -v`로 규칙이 맞는지 검증한다.**

## 함정 한 가지

**착각**: “`.gitignore`에 넣었으니 내 PC에서만 안 올라간다.”  
**실제**: `.gitignore`는 **커밋되면 팀 전체**에 적용된다. 로컬만 빼려다가 실수로 push하면, 다른 사람도 그 폴더를 못 보거나, 반대로 필요한 파일이 전부 무시될 수 있다.

**또 다른 함장**: ignore에 넣었는데 `git status`에 계속 보인다.  
**이유**: 그 파일이 **이미 tracked**이면 ignore가 안 먹는다. `git rm --cached <경로>`로 추적만 끊은 뒤(파일은 디스크에 유지) 다시 확인해야 한다.

## 왜 이렇게인가

개인용 폴더(에디터 설정, AI 스킬, 학습 노트)는 **저장소 제품 코드가 아니다**. 팀 `.gitignore`에 올리면 “우리 팀 전원이 이걸 무시한다”는 계약이 되어, 문서·스킬을 repo에 두고 싶은 사람과 충돌한다.

`.git/info/exclude`는 Git이 원래 제공하는 **로컬 전용 ignore** 자리다. `.git` 안에만 있어서 push되지 않고, clone한 동료 PC에는 복사되지 않는다. 패턴 문법은 `.gitignore`와 같다.

전역 `core.excludesfile`은 OS마다 “여기 `.DS_Store`는 전부 무시”처럼 **모든 프로젝트**에 쓸 때 편하다. 이 레포만 다르게 하려면 `exclude`가 더 명확하다.

## 참고 코드

**로컬 exclude 예시** — 이 클론의 `.git/info/exclude`에만 존재한다.

```gitignore
# 로컬 전용 (커밋하지 않음 — .gitignore와 동일 정책)
.cursor/
.study/
```

**팀 공유 ignore 일부** — 커밋되어 remote에 올라간다.

```gitignore
# Agent checkpoints
.cursor/checkpoints/
```

→ 팀은 **체크포인트만** 공통 무시, 개발자는 로컬에서 **`.cursor/` 전체**를 추가로 무시할 수 있다(겹쳐도 문제 없음).

**확인 명령 (PowerShell·bash 공통)**

```bash
git check-ignore -v .study/INDEX.md
git status --ignored -u
```

예상 출력 예:

```text
.git/info/exclude:10:.study/    .study/INDEX.md
```

## 이 레포에서는 (프로젝트에 대입)

| 항목 | 내용 |
|------|------|
| 팀 `.gitignore` | `.cursor/checkpoints/` 등 빌드·테스트 산출물 위주 ([`.gitignore`](../.gitignore)) |
| 로컬 `exclude` (예시) | `.cursor/`, `.study/` — [`.git/info/exclude`](../.git/info/exclude) (경로는 clone마다 동일, **내용은 PC마다 다를 수 있음**) |
| `core.excludesfile` | 이 환경에서는 미설정 (전역 파일 방식 미사용) |
| 확인 | `git check-ignore -v` → `.git/info/exclude` 줄 번호가 나오면 로컬 규칙 적용 중 |

**다른 PC에서 clone 후**: `.git/info/exclude`는 비어 있거나 예시 주석만 있다. 같은 무시가 필요하면 **그 PC에서 다시** 패턴을 적거나, 팀 합의가 있으면 `.gitignore`를 수정한다.

## 더 볼 것 (선택)

- [Git 공식 — gitignore](https://git-scm.com/docs/gitignore)
- [Git 공식 — git check-ignore](https://git-scm.com/docs/git-check-ignore)
- 이 레포 에이전트 규칙: [study-notes.mdc](../.cursor/rules/study-notes.mdc) (`.study/` 작성·INDEX 갱신)
