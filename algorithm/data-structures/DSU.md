# 🔗 유니온 파인드 (Disjoint Set Union, DSU)

> 주제: 유니온 파인드 (Union-Find)
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념        | 설명                                       |
| --------- | ---------------------------------------- |
| **유니온 파인드**   | 서로소 집합(Disjoint Set)을 효율적으로 관리하는 자료구조          |
| **주요 연산**  | `find(x)` - 루트 찾기, `union(x, y)` - 두 집합 합치기             |
| **최적화 기법**    | 경로 압축(Path Compression), Union by Rank        |
| **시간복잡도** | 거의 O(1) (경로 압축 + Union by Rank 사용 시) |
| **활용 분야** | 연결 여부 확인, 그래프 사이클 탐지, MST(최소 신장 트리), 연결 요소 개수 세기 등 |

---

## 📘 **문제 1: LeetCode 684. Redundant Connection**

> 그래프에서 사이클을 만드는 간선을 찾아라.

### 💬 **입출력 예시**

| 입력                    | 출력    |
| --------------------- | ----- |
| `edges = [[1,2],[1,3],[2,3]]` | `[2,3]` |
| `edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]` | `[1,4]` |

### 💻 **코드 + 주석**

```js
// Redundant Connection
function findRedundantConnection(edges) {
  let n = edges.length;
  let dsu = new DSU(n + 1);
  
  for (let [u, v] of edges) {
    if (!dsu.union(u, v)) {
      // 이미 같은 집합에 있으면 사이클 형성
      return [u, v];
    }
  }
  return [];
}
```

---

## 📘 **문제 2: LeetCode 547. Number of Provinces**

> 연결된 도시 그룹(프로빈스)의 개수를 구하라.

### 💬 **입출력 예시**

| 입력                    | 출력    |
| --------------------- | ----- |
| `isConnected = [[1,1,0],[1,1,0],[0,0,1]]` | `2` |
| `isConnected = [[1,0,0],[0,1,0],[0,0,1]]` | `3` |

### 💻 **코드 + 주석**

```js
// Number of Provinces
function findCircleNum(isConnected) {
  let n = isConnected.length;
  let dsu = new DSU(n);
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j] === 1) {
        dsu.union(i, j);
      }
    }
  }
  
  // 서로 다른 루트의 개수 = 프로빈스 개수
  let provinces = new Set();
  for (let i = 0; i < n; i++) {
    provinces.add(dsu.find(i));
  }
  return provinces.size;
}
```

---

## 📘 **DSU 구현**

### 💻 **코드 + 주석**

```js
// n: 노드 개수
class DSU {
  constructor(n) {
    // 각 노드의 부모를 자기 자신으로 초기화
    this.parent = Array(n)
      .fill(0)
      .map((_, i) => i);
    this.rank = Array(n).fill(1); // 트리의 높이(최적화용)
  }
  
  // 경로 압축(Find with path compression)
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // 경로 압축
    }
    return this.parent[x];
  }
  
  // Union by rank
  union(x, y) {
    let px = this.find(x),
      py = this.find(y);
    if (px === py) return false; // 이미 같은 집합
    
    // rank가 작은 트리를 큰 트리에 붙임
    if (this.rank[px] < this.rank[py]) {
      [px, py] = [py, px];
    }
    this.parent[py] = px;
    if (this.rank[px] === this.rank[py]) {
      this.rank[px]++;
    }
    return true;
  }
}
```

**핵심 포인트:**
- **경로 압축**: find 연산 시 모든 노드를 루트에 직접 연결
- **Union by Rank**: 작은 트리를 큰 트리에 붙여서 균형 유지
- 두 최적화를 함께 사용하면 거의 O(1) 시간복잡도

---

## 📘 **문제 3: LeetCode 1319. Number of Operations to Make Network Connected**

> 모든 컴퓨터를 연결하기 위해 필요한 최소 케이블 이동 횟수를 구하라.

### 💬 **입출력 예시**

| 입력                    | 출력    |
| --------------------- | ----- |
| `n = 4, connections = [[0,1],[0,2],[1,2]]` | `1` |
| `n = 6, connections = [[0,1],[0,2],[0,3],[1,2],[1,3]]` | `2` |

### 💻 **코드 + 주석**

```js
// Number of Operations to Make Network Connected
function makeConnected(n, connections) {
  if (connections.length < n - 1) return -1; // 케이블 부족
  
  let dsu = new DSU(n);
  let redundant = 0;
  
  for (let [u, v] of connections) {
    if (!dsu.union(u, v)) {
      redundant++; // 이미 연결되어 있으면 중복 케이블
    }
  }
  
  let components = 0;
  for (let i = 0; i < n; i++) {
    if (dsu.find(i) === i) components++;
  }
  
  // 필요한 연결 = 컴포넌트 개수 - 1
  let needed = components - 1;
  return redundant >= needed ? needed : -1;
}
```

---

## ⚡ **핵심 포인트**

| 구분    | 내용                                          |
| ----- | ------------------------------------------- |
| 시간복잡도 | 거의 O(1) (경로 압축 + Union by Rank)                                    |
| 공간복잡도  | O(n)                                    |
| 핵심 패턴  | find (경로 압축), union (Union by Rank)                         |
| 응용    | 사이클 탐지, 연결 요소 개수, 크루스칼 MST, 친구 네트워크 등 |

---

## 📝 스터디 문제 정리

<!-- 스터디에서 제공된 문제를 여기에 추가하세요 -->

---

