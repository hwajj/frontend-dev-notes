# ✅ 7주차: 고급 자료구조 & 그래프 알고리즘

이번 주는 실전 코딩테스트에서 자주 등장하는 고급 자료구조와 그래프 알고리즘을 익히는 것이 목표입니다.

---

## 1. 그래프 최단 경로 (Dijkstra, BFS 응용)

**핵심 개념:**

- 가중치 없는 그래프: BFS로 최단 경로
- 가중치 있는 양의 그래프: Dijkstra(다익스트라) 알고리즘

**대표 문제:**

- LeetCode 743. Network Delay Time
- LeetCode 1514. Path with Maximum Probability
- LeetCode 787. Cheapest Flights Within K Stops
- LeetCode 1631. Path With Minimum Effort
- LeetCode 1334. Find the City With the Smallest Number of Neighbors at a Threshold Distance

**예시 코드: Dijkstra's Algorithm**

```js
// times: [ [u, v, w], ... ]
// n: 노드 개수, k: 시작 노드
function networkDelayTime(times, n, k) {
  // 1. 그래프 인접 리스트 생성
  let graph = Array.from({ length: n + 1 }, () => []);
  for (let [u, v, w] of times) {
    graph[u].push([v, w]);
  }
  // 2. 거리 배열 초기화
  let dist = Array(n + 1).fill(Infinity);
  dist[k] = 0;
  // 3. 우선순위 큐(여기선 배열+sort, 실제로는 MinHeap 추천)
  let pq = [[0, k]]; // [cost, node]

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]); // 최소 비용 우선
    let [cost, node] = pq.shift();
    if (cost > dist[node]) continue; // 이미 더 짧은 경로가 있으면 skip
    for (let [nei, w] of graph[node]) {
      let newCost = cost + w;
      if (newCost < dist[nei]) {
        dist[nei] = newCost;
        pq.push([newCost, nei]);
      }
    }
  }
  let ans = Math.max(...dist.slice(1));
  return ans === Infinity ? -1 : ans;
}
```

**보충 설명:**

- 실제 대회/실무에서는 MinHeap(우선순위 큐)로 최적화 필요
- 가중치 없는 경우는 BFS로도 최단 경로 가능
- 음수 가중치가 있으면 Bellman-Ford, 음수 사이클 주의

**추가 예시:**

- 최단 경로 역추적, 경로 개수 세기, 최대 확률 경로(곱셈 log 변환 등)

---

## 2. 유니온 파인드 (Disjoint Set Union - DSU)

**핵심 개념:**

- 서로소 집합(Disjoint Set) 구조
- 연결 여부 확인, 그래프 사이클 탐지, MST(최소 신장 트리) 등에 활용

**대표 문제:**

- LeetCode 684. Redundant Connection
- LeetCode 1319. Number of Operations to Make Network Connected
- LeetCode 547. Number of Provinces
- LeetCode 990. Satisfiability of Equality Equations
- LeetCode 959. Regions Cut By Slashes

**예시 코드: DSU Implementation**

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
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  // Union by rank
  union(x, y) {
    let px = this.find(x),
      py = this.find(y);
    if (px === py) return false; // 이미 같은 집합
    if (this.rank[px] < this.rank[py]) [px, py] = [py, px];
    this.parent[py] = px;
    if (this.rank[px] === this.rank[py]) this.rank[px]++;
    return true;
  }
}
```

**보충 설명:**

- find, union 함수 패턴 암기
- 경로 압축, rank 최적화로 거의 O(1) 동작
- 사이클 탐지, 연결 요소 개수 세기 등에 활용

**추가 예시:**

- 크루스칼(Kruskal) MST, 친구 네트워크, 집합 분리 문제

---

## 3. 트라이 (Trie)

**핵심 개념:**

- 문자열 저장/탐색에 특화된 트리형 자료구조
- 자동완성, 접두사/전체 단어 검색, 사전 구현 등에 활용

**대표 문제:**

- LeetCode 208. Implement Trie
- LeetCode 720. Longest Word in Dictionary
- LeetCode 211. Design Add and Search Words Data Structure
- LeetCode 212. Word Search II
- LeetCode 472. Concatenated Words

**예시 코드: Trie 구현**

```js
// Trie 노드 정의
class TrieNode {
  constructor() {
    this.children = {}; // 자식 노드(문자: TrieNode)
    this.isWord = false; // 단어의 끝 표시
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  // 단어 삽입
  insert(word) {
    let node = this.root;
    for (let ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isWord = true;
  }
  // 단어 전체 검색
  search(word) {
    let node = this.root;
    for (let ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isWord;
  }
  // 접두사 검색
  startsWith(prefix) {
    let node = this.root;
    for (let ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true;
  }
}
```

**보충 설명:**

- insert, search, startsWith 패턴 암기
- 트라이 노드 구조(자식, isWord) 이해
- 자동완성, 사전, 접두사 문제에 자주 등장

**추가 예시:**

- 단어 추천, 금지어 필터, 문자열 집합 관리

---

## 4. 세그먼트 트리 (Segment Tree) / 펜윅 트리 (Fenwick Tree)

**핵심 개념:**

- 구간 합/최소/최대 쿼리를 O(log n)에 처리
- 세그먼트 트리: 범용적, 복잡하지만 강력
- 펜윅 트리(BIT): 구간 합/갱신에 특화, 구현 간단

**대표 문제:**

- LeetCode 307. Range Sum Query - Mutable
- LeetCode 315. Count of Smaller Numbers After Self
- LeetCode 327. Count of Range Sum
- LeetCode 493. Reverse Pairs
- LeetCode 218. The Skyline Problem

**예시 코드: Fenwick Tree for Prefix Sum**

```js
// 1-based 인덱스 사용
class Fenwick {
  constructor(n) {
    this.tree = Array(n + 1).fill(0);
  }
  // i번째 값에 delta만큼 더하기
  update(i, delta) {
    for (; i < this.tree.length; i += i & -i) {
      this.tree[i] += delta;
    }
  }
  // 1~i까지의 누적합
  query(i) {
    let sum = 0;
    for (; i > 0; i -= i & -i) {
      sum += this.tree[i];
    }
    return sum;
  }
}
```

**보충 설명:**

- 세그먼트 트리는 트리 배열로 구현, 구간 쿼리/갱신 모두 O(log n)
- 펜윅 트리는 누적합, 구간합, 카운팅 등에 자주 사용
- 1-based 인덱스 주의, update/query 패턴 암기

**추가 예시:**

- 구간 최대/최소, 구간 곱, inversion count, 실시간 랭킹 등

---

## 📅 7주차 학습 플랜

- **Day 1-2:** 그래프 최단 경로 (BFS/Dijkstra)
- **Day 3:** DSU(Union-Find) 기본 + 응용
- **Day 4-5:** Trie 구현 및 접두사 검색 문제
- **Day 6-7:** Segment Tree / Fenwick Tree로 구간 쿼리 문제

**실전 팁:**

- 고급 자료구조(Trie, Fenwick, Segment Tree)는 직접 구현해보는 연습이 중요
- 그래프/트리 문제는 노드/간선/구간의 의미와 패턴을 파악하는 것이 핵심
- 각 자료구조/알고리즘의 시간복잡도와 사용 목적을 명확히 구분하세요.
