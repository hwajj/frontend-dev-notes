# 🔍 BFS (Breadth First Search, 너비 우선 탐색)

> 주제: BFS
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념          | 설명                                                       |
| ------------- | ---------------------------------------------------------- |
| **BFS**       | 시작점에서 가까운 노드(이웃)부터 탐색해 나가는 알고리즘    |
| **자료구조**  | **큐(Queue)** 사용 — 선입선출(FIFO)                        |
| **특징**      | 한 단계씩 확장하므로 "최단 거리(최소 단계)" 문제에 적합    |
| **방문 관리** | `visited` 집합을 써서 중복 탐색 방지                       |
| **활용 분야** | 그래프 최단 경로, 미로 탐색, Word Ladder, 네트워크 탐색 등 |

---

## 📘 **문제: LeetCode 127. Word Ladder**

> 단어 beginWord → endWord로 변환할 때,
> 한 번에 한 글자만 바꿀 수 있고 각 단계 단어는 `wordList` 안에 있어야 한다.
> **최단 변환 단계 수**를 구하라.

### 💬 **입출력 예시**

| 입력                                                                                       | 출력 |
| ------------------------------------------------------------------------------------------ | ---- |
| beginWord = `"hit"`, endWord = `"cog"`, wordList = `["hot","dot","dog","lot","log","cog"]` | `5`  |
| beginWord = `"hit"`, endWord = `"cog"`, wordList = `["hot","dot","dog","lot","log"]`       | `0`  |

변환 경로 예시

```
hit → hot → dot → dog → cog → (총 5단계)
```

### 💡 개념 흐름 시각화

```
Level 0: hit
Level 1: hot
Level 2: dot, lot
Level 3: dog, log
Level 4: cog
=> 총 5단계
```

### 💻 **코드 + 주석**

```js
// ✅ BFS 최단 거리 탐색 (Word Ladder)
function bfsShortestPath(start, end, graph) {
  let queue = [[start, 1]]; // [단어, 거리]
  let visited = new Set([start]); // 방문 기록 (중복 방지)

  while (queue.length) {
    let [word, dist] = queue.shift(); // 큐에서 하나 꺼냄
    if (word === end) return dist; // 목적지 도착 → 거리 반환

    // 인접(한 글자 차이) 단어 순회
    for (let nei of graph[word] || []) {
      if (!visited.has(nei)) {
        visited.add(nei); // 방문 표시
        queue.push([nei, dist + 1]); // 거리 1 증가 후 큐에 추가
      }
    }
  }

  return 0; // endWord로 변환 불가능
}
```

### ⚙️ **로직 정리**

1. 큐에 시작 단어와 거리(1)를 넣음
2. 큐에서 하나씩 꺼내면서 인접 단어 탐색
3. 아직 방문하지 않았다면 큐에 추가 (거리 +1)
4. 목표 단어를 만나면 그때의 거리 반환
5. 큐가 비면 변환 불가 → 0 반환

### ⚡ **핵심 포인트**

| 구분       | 내용                                               |
| ---------- | -------------------------------------------------- |
| 시간복잡도 | O(V + E)                                           |
| 자료구조   | 큐 (FIFO)                                          |
| 탐색방식   | 한 단계씩 확장 → 최단 거리 보장                    |
| 응용       | 미로 최단 거리, Graph Traversal, Friend Network 등 |

### ✅ **한 줄 요약**

> BFS는 "가까운 노드부터 탐색하는 최단 거리 알고리즘".
> **Queue + 방문 체크 = 최소 단계 탐색** 공식.

---

## 📝 스터디 문제 정리

### [2-3] Keys and Rooms

- 문제 링크: [LeetCode 841. Keys and Rooms](https://leetcode.com/problems/keys-and-rooms/description/)

- **핵심 개념**: 그래프 탐색(방 = 노드, 열쇠 = 간선). 큐로 BFS하며 방문 가능 방을 확장
- **이유**: 중복 방문 방지를 위해 `visited` 관리, 0번 방에서 시작해 모든 방을 방문 가능한지 확인

```js
function canVisitAllRooms(rooms) {
  const visited = new Set([0]); // 0번 방 방문 처리
  const queue = [0]; // BFS 큐 초기화(0번 방부터)

  while (queue.length) {
    const room = queue.shift(); // 큐에서 하나 꺼냄(현재 방)
    for (const key of rooms[room]) {
      // 현재 방의 열쇠들 순회
      if (!visited.has(key)) {
        // 아직 방문하지 않은 방이면
        visited.add(key); // 방문 처리
        queue.push(key); // 다음 탐색 대상으로 큐에 추가
      }
    }
  }
  return visited.size === rooms.length; // 모든 방 방문 여부
}
```

> 참고: DFS(재귀/스택)로도 동일하게 풀이 가능. 자세한 DFS 버전은 `algorithm/search/DFS.md` 참조.

---

## 📦 BFS 최단거리 대표 문제

> 격자/그래프 BFS 최단거리 유형 — 문제 설명, 제한사항, 입출력 예, JS 풀이

| 문제             | 유형           | 핵심 포인트                                      |
| ---------------- | -------------- | ------------------------------------------------ |
| 게임 맵 최단거리 | 격자 BFS       | (0,0)→(n-1,m-1) 4방향, 지나가는 칸 수 최소       |
| 미로 탈출        | 격자 BFS × 2   | S→L 최단거리 + L→E 최단거리                      |
| 단어 변환        | 그래프 BFS     | 한 글자 차이 = 간선, begin→target 최소 단계      |
| 석유 시추        | BFS + 열별 합  | 덩어리 탐색 후 열별로 지나는 덩어리 크기 합 최대 |

---

### 1️⃣ 게임 맵 최단거리 (Lv2)

- **링크**: [게임 맵 최단거리](https://school.programmers.co.kr/learn/courses/30/lessons/1844)
- (0,0)→(n-1,m-1) 지나가는 **칸 수 최솟값**. 도착 불가 시 -1.

**접근 방법**

- BFS는 **같은 거리(레벨)**를 먼저 다 보기 때문에, 목적지에 **처음 도달한 시점의 거리**가 곧 최단 칸 수.
- 큐에 `[r, c, 지금까지 칸 수]`를 넣고, 4방향으로 확장. 벽(0)과 이미 방문한 칸은 스킵.
- 도착지 `(n-1, m-1)`에 도달하면 그때의 `dist` 반환, 큐가 비면 -1.

```js
function solution(maps) {
  const n = maps.length, m = maps[0].length;
  const dr = [0, 1, 0, -1], dc = [1, 0, -1, 0]; // 동남서북 4방향
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const queue = [[0, 0, 1]]; // [행, 열, 지나온 칸 수] — 시작 칸 포함해서 1
  visited[0][0] = true;

  while (queue.length) {
    const [r, c, dist] = queue.shift();
    if (r === n - 1 && c === m - 1) return dist; // 도착 시 그때의 칸 수가 최단

    for (let i = 0; i < 4; i++) {
      const nr = r + dr[i], nc = c + dc[i];
      if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue; // 맵 밖
      if (maps[nr][nc] === 0 || visited[nr][nc]) continue;   // 벽이거나 이미 방문
      visited[nr][nc] = true;
      queue.push([nr, nc, dist + 1]);
    }
  }
  return -1; // 도달 불가
}
```

---

### 2️⃣ 미로 탈출 (Lv2)

- **링크**: [미로 탈출](https://school.programmers.co.kr/learn/courses/30/lessons/159993)
- S(시작) → L(레버) → E(출구) 순서. 탈출 불가 시 -1.

**접근 방법**

- 문은 레버를 당긴 뒤에만 열리므로, 경로가 **S → L → E**로 고정됨.
- **S→L** 최단거리와 **L→E** 최단거리를 각각 BFS로 구한 뒤 더하면 총 최소 시간.
- S, L, E 위치를 한 번씩 찾고, 공통 `bfs(start, end)`로 두 구간을 따로 계산. 하나라도 -1이면 탈출 불가.

```js
function solution(maps) {
  const R = maps.length, C = maps[0].length;
  const dr = [0, 1, 0, -1], dc = [1, 0, -1, 0];

  // 문자 ch인 칸의 [행, 열] 반환
  function findChar(ch) {
    for (let r = 0; r < R; r++)
      for (let c = 0; c < C; c++)
        if (maps[r][c] === ch) return [r, c];
    return null;
  }

  // start → end 최단 이동 거리(초). 벽(X) 제외하고 4방향 BFS
  function bfs(start, end) {
    const [sr, sc] = start, [er, ec] = end;
    const visited = Array.from({ length: R }, () => Array(C).fill(false));
    const queue = [[sr, sc, 0]];
    visited[sr][sc] = true;
    while (queue.length) {
      const [r, c, dist] = queue.shift();
      if (r === er && c === ec) return dist;
      for (let i = 0; i < 4; i++) {
        const nr = r + dr[i], nc = c + dc[i];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
        if (maps[nr][nc] === "X" || visited[nr][nc]) continue;
        visited[nr][nc] = true;
        queue.push([nr, nc, dist + 1]);
      }
    }
    return -1;
  }

  const S = findChar("S"), L = findChar("L"), E = findChar("E");
  if (!S || !L || !E) return -1;
  const toLever = bfs(S, L), toExit = bfs(L, E);
  if (toLever === -1 || toExit === -1) return -1;
  return toLever + toExit;
}
```

---

### 3️⃣ 단어 변환 (Lv3)

- **링크**: [단어 변환](https://school.programmers.co.kr/learn/courses/30/lessons/43163)
- begin → target, 한 글자만 바꿀 수 있고 `words`에 있는 단어로만. **최소 변환 단계 수**. 불가 시 0.

**접근 방법**

- 단어를 노드로 보고, **한 글자만 다른 단어**끼리 간선으로 연결된 그래프로 취급.
- BFS로 begin에서 확장할 때, **레벨(step)**이 곧 변환 횟수이므로 target에 처음 도달한 step이 최소 단계.
- target이 words에 없으면 애초에 불가이므로 0. 방문 집합으로 중복 방문만 막으면 됨.

```js
function solution(begin, target, words) {
  if (!words.includes(target)) return 0;

  const visited = new Set();
  const queue = [[begin, 0]]; // [현재 단어, 변환 횟수]
  visited.add(begin);

  while (queue.length) {
    const [word, step] = queue.shift();
    if (word === target) return step;

    // 한 글자만 다른 words 단어를 다음 단계로 추가
    for (const next of words) {
      if (visited.has(next)) continue;
      let diff = 0;
      for (let i = 0; i < word.length; i++) if (word[i] !== next[i]) diff++;
      if (diff === 1) {
        visited.add(next);
        queue.push([next, step + 1]);
      }
    }
  }
  return 0;
}
```

---

### 4️⃣ 석유 시추 (선택)

- **링크**: [석유 시추](https://school.programmers.co.kr/learn/courses/30/lessons/250136)
- 격자에서 상하좌우 연결된 1 = 한 덩어리. 시추관을 **한 열**에 뚫었을 때 그 열을 지나는 덩어리들의 **크기 합**이 석유량. **최대 석유량** return.

**접근 방법**

- 1단계: BFS로 **연결 요소(덩어리)**를 찾으며, 덩어리마다 **id**, **크기**, 그 덩어리가 **걸쳐 있는 열들**을 기록.
- 2단계: 열 j마다 “j를 지나는 덩어리 id 집합”에 대해 해당 덩어리 크기를 더한 값이 그 열에서 뽑는 석유량.
- 3단계: 열별 석유량 중 최댓값을 return. (같은 덩어리는 한 열에 한 번만 더해야 하므로 열별로 덩어리 id Set 사용.)

```js
function solution(land) {
  const n = land.length, m = land[0].length;
  const dr = [0, 1, 0, -1], dc = [1, 0, -1, 0];
  // colIds[j] = 열 j를 지나는 덩어리 id 집합 (같은 덩어리 중복 합 방지)
  const colIds = Array(m).fill(null).map(() => new Set());
  let id = 0;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const idToSize = new Map(); // 덩어리 id → 칸 수(크기)

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < m; c++) {
      if (land[r][c] === 0 || visited[r][c]) continue;

      id++;
      const queue = [[r, c]];
      visited[r][c] = true;
      const colsInGroup = new Set([c]); // 이 덩어리가 걸친 열들
      let size = 1;

      while (queue.length) {
        const [i, j] = queue.shift();
        for (let d = 0; d < 4; d++) {
          const ni = i + dr[d], nj = j + dc[d];
          if (ni < 0 || ni >= n || nj < 0 || nj >= m) continue;
          if (land[ni][nj] === 0 || visited[ni][nj]) continue;
          visited[ni][nj] = true;
          queue.push([ni, nj]);
          colsInGroup.add(nj);
          size++;
        }
      }

      idToSize.set(id, size);
      for (const j of colsInGroup) colIds[j].add(id);
    }
  }

  // 열별로 지나는 덩어리 크기 합 중 최대
  let maxOil = 0;
  for (let j = 0; j < m; j++) {
    let sum = 0;
    for (const gid of colIds[j]) sum += idToSize.get(gid);
    maxOil = Math.max(maxOil, sum);
  }
  return maxOil;
}
```

---

### 📎 BFS 최단거리 링크

- [게임 맵 최단거리](https://school.programmers.co.kr/learn/courses/30/lessons/1844) · [미로 탈출](https://school.programmers.co.kr/learn/courses/30/lessons/159993) · [단어 변환](https://school.programmers.co.kr/learn/courses/30/lessons/43163) · [석유 시추](https://school.programmers.co.kr/learn/courses/30/lessons/250136)

---
