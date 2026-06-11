# 🔍 DFS (Depth First Search, 깊이 우선 탐색)

> 주제: DFS / 백트래킹
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념                        | 설명                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| **DFS (깊이 우선 탐색)**    | 모든 가능한 경로를 끝까지 탐색한 뒤 되돌아오는 탐색 방식                      |
| **Backtracking (백트래킹)** | 유망하지 않은 경로는 조기에 "가지치기(pruning)"하며 되돌아옴                  |
| **구조 패턴**               | `push → dfs(재귀) → pop` 형태로 탐색 경로를 조립                              |
| **종료 조건 (base case)**   | 현재 경로(path)가 원하는 길이나 조건을 만족하면 결과에 추가                   |
| **활용 분야**               | 조합(Combinations), 순열(Permutations), 부분집합(Subsets), N-Queen, Sudoku 등 |

---

## 🌰 예시 1: **LeetCode 77. Combinations**

> 1부터 n까지의 수 중에서 **서로 다른 k개를 선택**하는 모든 조합을 구하라.

### 💬 입출력 예시

| 입력         | 출력                                    |
| ------------ | --------------------------------------- |
| n = 4, k = 2 | `[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]` |
| n = 3, k = 1 | `[[1],[2],[3]]`                         |

### 💻 코드 + 단계별 주석

```js
// ✅ 모든 조합 생성 (DFS + 백트래킹)
function combine(n, k) {
  let res = []; // 결과 저장용 배열
  let path = []; // 현재 조합을 담는 배열 (현재 상태)

  // 재귀 함수 정의
  function dfs(start) {
    // (1) 종료 조건: path의 길이가 k이면 완성된 조합이므로 결과에 추가
    if (path.length === k) {
      res.push([...path]); // 깊은 복사로 결과 저장
      return;
    }

    // (2) 현재 start부터 n까지 숫자를 하나씩 선택
    for (let i = start; i <= n; i++) {
      path.push(i); // 선택
      dfs(i + 1); // 다음 숫자부터 탐색 (중복 방지)
      path.pop(); // 선택 해제 → 백트래킹
    }
  }

  dfs(1); // 시작값 1부터 탐색
  return res;
}
```

### 🧭 탐색 흐름 예시 (n=4, k=2)

```
start=1
 ├─ 1 선택 → dfs(2)
 │   ├─ 2 선택 → [1,2] 저장
 │   ├─ 3 선택 → [1,3] 저장
 │   └─ 4 선택 → [1,4] 저장
 ├─ 2 선택 → dfs(3)
 │   ├─ 3 선택 → [2,3] 저장
 │   └─ 4 선택 → [2,4] 저장
 └─ 3 선택 → dfs(4)
     └─ 4 선택 → [3,4] 저장
```

결과: `[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]`

---

## 🌰 예시 2: **LeetCode 46. Permutations**

> 모든 순열(Permutations) 생성

### 💻 코드 + 주석

```js
// (예시 문제)
// - LeetCode 46. Permutations
// - LeetCode 78. Subsets
// - LeetCode 39. Combination Sum
// - LeetCode 90. Subsets II
// - LeetCode 131. Palindrome Partitioning
function permute(nums) {
  let res = [];
  function dfs(path, used) {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      dfs(path, used);
      path.pop();
      used[i] = false;
    }
  }
  dfs([], Array(nums.length).fill(false));
  return res;
}
```





**보충 설명:**

- 부분집합(LeetCode 78. Subsets), 조합의 합(LeetCode 39. Combination Sum) 등도 유사 패턴
- path.push/pop, used/visited 관리가 핵심
- 재귀 호출의 깊이와 상태 복구에 주의

---

## 🌰 예시 3: **LeetCode 200. Number of Islands**

> 연결된 노드(셀) 그룹 찾기 - 2차원 배열(그래프, 지도)에서 영역/섬/구역 개수 세기

### 💻 코드 + 주석

```js
// (예시 문제)
// - LeetCode 200. Number of Islands
// - LeetCode 695. Max Area of Island
// - LeetCode 130. Surrounded Regions
// - LeetCode 417. Pacific Atlantic Water Flow
// - LeetCode 286. Walls and Gates
function numIslands(grid) {
  let count = 0;
  let rows = grid.length,
    cols = grid[0].length;

  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === "0") return;
    grid[r][c] = "0";
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}
```

**보충 설명:**

- BFS로도 풀이 가능(큐 사용)
- 2차원 배열에서 visited 배열을 따로 두거나, 원본을 변경(grid[r][c]='0')하는 방식 모두 가능
- LeetCode 695. Max Area of Island: 영역의 최대 크기 구하기 등도 유사

---

## 💡 핵심 포인트 요약

| 항목          | 설명                                                |
| ------------- | --------------------------------------------------- |
| 탐색 구조     | DFS로 가능한 모든 경로를 끝까지 탐색                |
| 백트래킹 역할 | 현재 경로가 조건을 만족하거나 넘치면 "되돌아감"     |
| 시간복잡도    | O(2ⁿ) (모든 부분집합 탐색 수준)                     |
| 코드 패턴     | `path.push()` → `dfs()` → `path.pop()`              |
| 응용          | Subsets / Permutations / Combination Sum / N-Queens |

---

> **👉 핵심 문장 요약:**
> DFS는 "모든 경우를 끝까지 내려가 본다",
> 백트래킹은 "필요 없는 길은 빨리 돌아온다".

---

## 📝 스터디 문제 정리

### [2-3] Keys and Rooms (DFS)

- 문제 링크: [LeetCode 841. Keys and Rooms](https://leetcode.com/problems/keys-and-rooms/description/)

- **핵심 개념**: 재귀 DFS로 방(노드)에서 열쇠(간선)를 따라 깊게 탐색
- **이유**: `visited`로 중복 방지하며 0번에서 시작해 전체 방문 여부 확인

```js
function canVisitAllRooms(rooms) {
  const visited = new Set(); // 방문한 방 기록 (중복 방지)
  function dfs(room) {
    // 현재 방에서 깊이 우선 탐색
    visited.add(room); // 현재 방 방문 처리
    for (const key of rooms[room]) {
      // 현재 방에서 얻는 열쇠들 순회
      if (!visited.has(key)) dfs(key); // 아직 방문 안했으면 해당 방으로 계속 탐색
    }
  }
  dfs(0); // 0번 방에서 시작
  return visited.size === rooms.length; // 전부 방문했는지 확인
}
```

---

### [2-7] 양과 늑대 (Programmers)

- 문제 링크: [프로그래머스 92343. 양과 늑대](https://school.programmers.co.kr/learn/courses/30/lessons/92343)

- **핵심 개념**: DFS + 백트래킹, 현재 위치에서 이동 가능한 노드 집합을 상태로 유지
- **이유**: 어느 순서로 방문하느냐에 따라 양/늑대 누적이 달라짐 → 분기 탐색 필요, `늑대 ≥ 양` 가지치기

```js
function solution(info, edges) {
  const graph = Array.from({ length: info.length }, () => []); // 인접 리스트
  // 트리 형태로 연결 그래프 구성
  for (const [parent, child] of edges) {
    graph[parent].push(child);
  }
  let answer = 0; // 최대 양 수 결과

  function dfs(node, sheep, wolf, candidates) {
    // candidates: 다음에 갈 수 있는 노드 집합
    const isWolf = info[node] === 1; // 현재 노드가 늑대인지
    const ns = sheep + (isWolf ? 0 : 1); // 양/늑대 누적 갱신
    const nw = wolf + (isWolf ? 1 : 0);
    if (nw >= ns) return; // 늑대 수가 양 이상이면 종료(가지치기)
    answer = Math.max(answer, ns); // 최대 양 갱신

    // 다음 후보 갱신: (현재 후보들 - 현재 노드) ∪ (현재 노드 자식들)
    const next = new Set(candidates);
    next.delete(node);
    for (const child of graph[node]) next.add(child);

    for (const nxt of next) {
      // 후보 중 하나를 선택해 분기 탐색
      dfs(nxt, ns, nw, next);
    }
  }

  dfs(0, 0, 0, new Set([0])); // 시작: 노드 0, 양/늑대 0, 후보 {0}
  return answer; // 최대 양 반환
}
```

---

## 📦 프로그래머스 DFS 4대장 

> 코테 실전에서 바로 제출 가능한 깔끔한 버전 + “왜 이렇게 짰는지” 근거 포함

### 1️⃣ 타겟 넘버 — 이진 선택 DFS (O(2^N))

- 문제 링크: [프로그래머스 43165. 타겟 넘버](https://school.programmers.co.kr/learn/courses/30/lessons/43165)

```js
function solution(numbers, target) {
  // count: 정답 개수
  let count = 0;

  /**
   * dfs(index, total)
   * - index: 현재 고려 중인 numbers의 인덱스
   * - total: index 이전까지 부호(+/-)를 붙여 누적한 합
   *
   * 구조적으로:
   *   for (각 수에 + 또는 - 부호 선택)  ← 이진 선택
   *     dfs(next)
   */
  function dfs(index, total) {
    // 모든 숫자를 사용했을 때 결과 확인
    if (index === numbers.length) {
      if (total === target) count++;
      return;
    }

    // 현재 숫자를 더하는 경우
    dfs(index + 1, total + numbers[index]);

    // 현재 숫자를 빼는 경우
    dfs(index + 1, total - numbers[index]);
  }

  // 초기 상태에서 시작
  dfs(0, 0);
  return count;
}
```

- 왜 이렇게 짰나: 각 숫자마다 (+/-) 두 갈래로 뻗는 완전탐색이므로 DFS가 자연스럽고 구현이 단순함.
- 대안: BFS도 가능하지만 상태가 단순해 DFS가 더 직관적.

---

### 2️⃣ 네트워크 — 그래프 연결요소 개수 (인접행렬 + DFS)

- 문제 링크: [프로그래머스 43162. 네트워크](https://school.programmers.co.kr/learn/courses/30/lessons/43162)

```js
function solution(n, computers) {
  // visited[i]: i번 컴퓨터 방문 여부
  const visited = Array(n).fill(false);

  /**
   * dfs(node)
   * - node에 연결된 모든 컴퓨터를 방문처리 (같은 연결요소)
   */
  function dfs(node) {
    visited[node] = true;

    // 인접행렬 한 행을 순회하며 연결된 노드를 확장
    for (let next = 0; next < n; next++) {
      if (computers[node][next] === 1 && !visited[next]) {
        dfs(next);
      }
    }
  }

  // 각 노드를 시작점으로 보며, 새 방문이면 새로운 네트워크 발견
  let networkCount = 0;

  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      dfs(i);
      networkCount++;
    }
  }

  return networkCount;
}
```

- 왜 이렇게 짰나: “연결요소 개수”는 전형적인 DFS/BFS 주제. 방문 배열만으로 간단히 해결.

---

### 3️⃣ 피로도 — 순열 + 백트래킹 + 가지치기 (핵심)

- 문제 링크: [프로그래머스 87946. 피로도](https://school.programmers.co.kr/learn/courses/30/lessons/87946)

```js
function solution(k, dungeons) {
  const n = dungeons.length;

  // 각 던전을 이미 사용했는지 체크 (순열용 visited)
  const visited = Array(n).fill(false);

  // 최대 탐험 개수 (전역 최댓값)
  let maxCount = 0;

  /**
   * dfs(currentK, count)
   * currentK: 현재 남은 피로도
   * count: 지금까지 탐험한 던전 수
   *
   * 구조적으로:
   * for (첫 번째 던전 선택)
   *   for (두 번째 던전 선택)
   *     for (세 번째 던전 선택)
   *       ...
   * → DFS가 "가변 길이 중첩 for문 생성기" 역할
   */
  function dfs(currentK, count) {
    // 지금 상태에서의 결과로 최대값 갱신
    maxCount = Math.max(maxCount, count);

    // === 이 for문이 "현재 깊이의 for문" ===
    for (let i = 0; i < n; i++) {
      // 이미 사용한 던전이면 스킵 (순열 중복 방지)
      if (visited[i]) continue;

      const [need, cost] = dungeons[i];

      // 입장 가능하면만 진행 (가지치기)
      if (currentK >= need) {
        // 이 던전 사용 처리
        visited[i] = true;

        // 다음 깊이 (다음 for문 레벨)
        dfs(currentK - cost, count + 1);

        // 백트래킹: 사용 취소 (다른 순서 탐색용)
        visited[i] = false;
      }
    }
  }

  // 초기 상태: 최초 피로도 들고 출발
  dfs(k, 0);

  return maxCount;
}
```

- 왜 이렇게 짰나: “순서를 고려해 모두 시도”는 순열 탐색이며, 피로도 불만족 시 가지치기로 큰 성능 차이.
- 스터디용 핵심 멘트: “DFS로 ‘던전 수만큼 중첩된 for문’을 일반화했고, visited로 중복을 막고, currentK로 각 경로 상태를 시뮬레이션합니다.”

---

### 4️⃣ 여행경로 — 경로 순열 + 사전순 + 조기 종료

- 문제 링크: [프로그래머스 43164. 여행경로](https://school.programmers.co.kr/learn/courses/30/lessons/43164)

```js
function solution(tickets) {
  // 사전순으로 가장 앞서는 경로를 위해 정렬
  tickets.sort();

  const n = tickets.length;

  // 각 티켓 사용 여부 (순열용 visited)
  const visited = Array(n).fill(false);

  // 현재 경로 (경로 시뮬레이션 상태)
  const route = ["ICN"];

  let answer = [];

  /**
   * dfs(current, usedCount)
   * current: 현재 공항
   * usedCount: 사용한 티켓 수
   *
   * 구조적으로:
   * for (첫 번째 티켓 선택)
   *   for (두 번째 티켓 선택)
   *     for (세 번째 티켓 선택)
   *       ...
   * 사전순 정렬 + 첫 해답 즉시 종료(조기 종료)
   */
  function dfs(current, usedCount) {
    // 모든 티켓을 다 사용했으면 경로 완성
    if (usedCount === n) {
      // 현재 경로를 정답으로 저장
      answer = route.slice();
      return true; // 가장 빠른 경로 찾았으니 종료
    }

    // === 현재 깊이의 for문 ===
    for (let i = 0; i < n; i++) {
      // 아직 안 쓴 티켓이고, 출발지가 현재 공항이면
      if (!visited[i] && tickets[i][0] === current) {
        visited[i] = true;
        route.push(tickets[i][1]);

        // 다음 티켓 선택 (다음 for문 깊이)
        if (dfs(tickets[i][1], usedCount + 1)) {
          return true; // 사전순으로 가장 빠른 답 → 바로 종료
        }

        // 백트래킹
        route.pop();
        visited[i] = false;
      }
    }

    return false;
  }

  // 항상 ICN에서 출발
  dfs("ICN", 0);

  return answer;
}
```

- 왜 이렇게 짰나: “모든 티켓을 정확히 한 번 사용”은 경로 순열. 사전순 요구가 있어 정렬 후 DFS로 첫 해답에서 종료.

---

### 💡 5주차 DFS 공통 패턴 요약 

- **타겟 넘버**: 이진 선택 DFS (O(2^N))
- **네트워크**: 그래프 연결요소 개수
- **피로도**: 순열 + 백트래킹(+ 가지치기)
- **여행경로**: 경로 구성 + 사전순 + 조기 종료

> DFS는 “가변 길이 중첩 for문 생성기”다. 입력 크기가 늘어나도 코드 구조가 그대로 유지되고, 조건 불만족 브랜치를 “조기 컷(가지치기)” 하며 탐색 공간을 줄인다.
