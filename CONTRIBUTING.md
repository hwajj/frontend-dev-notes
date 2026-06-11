## 커밋 메시지 규칙 (더 단순하게)

TS와 알고리즘은 같은 상위 레벨로 둡니다.

### 포맷
- `[도메인/세부?][문제?] type: subject`
  - 도메인: `ALGO | TS | SITE | APP | THREE | REPO`
  - 세부(선택): `DFS | BFS | DP | GRAPH | STRING | SEARCH | DS | ADV` 등
  - 문제(선택): `[PG-43165]`, `[LC-77]` 등
  - type: `feat | fix | docs | refactor | test | chore | build | ci`
  - scope는 쓰지 않음(필요 시 본문에 `Affects:`로 디렉터리 수준만 기재)

### 예시
- `[ALGO/DFS][PG-43165] docs: JS 풀이와 근거 추가`
- `[ALGO/DFS] docs: 문제 링크 4건 추가`
- `[SITE] chore: Prism JavaScript 하이라이트 추가`
- `[TS/ADV] docs: 조건부·분산·Key remap 정리`
- `[REPO] docs: 커밋 규칙 간소화`

### 규칙
1. 대괄호는 최대 2개(도메인/세부 1개 + 문제 1개)
2. 문제 기반 변경이면 문제 태그 포함
3. 한 커밋 = 한 의도
4. 파일명/경로는 subject(또는 scope)에 넣지 않기

---

## 커밋 템플릿(선택)
루트의 `.gitmessage.md` 템플릿 사용 가능
```
git config commit.template .gitmessage.md
```

