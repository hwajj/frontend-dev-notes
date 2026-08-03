# 스터디 일정별 파일

> 경로는 `algorithm/` 기준. 주차는 **기초 → 심화** 순으로 잡았다.

---

## 1주차 — 배열 · 완전탐색 · 해시

| 파일 | 주제 | 대표 문제 |
|------|------|-----------|
| `data-structures/Array.md` | 배열 순회 | 같은 숫자는 싫어 |
| `techniques/BruteForce.md` | 완전탐색 | 두 개 뽑아서 더하기 |
| `data-structures/HashMap.md` | 해시맵 | Two Sum, 빈도수 |

**목표:** 한 번 순회, 이중 for, Set/Map 기본 패턴 익히기

---

## 2주차 — 스택 · 투포인터 · 슬라이딩 윈도우

| 파일 | 주제 |
|------|------|
| `data-structures/Stack.md` | 스택, Monotonic Stack |
| `techniques/TwoPointer.md` | 투 포인터 |
| `techniques/SlidingWindow.md` | 슬라이딩 윈도우 |

**목표:** LIFO, 구간·인덱스 두 개로 줄이는 기법

---

## 3주차 — DFS · BFS

| 파일 | 주제 |
|------|------|
| `search/DFS.md` | DFS / 백트래킹 |
| `search/BFS.md` | BFS |
| `search/DFS_BFS_Comparison.md` | DFS vs BFS 정리 |

**목표:** 재귀·스택 DFS, 큐 BFS, 방문 처리

---

## 4주차 — 그리디 · 이진 탐색

| 파일 | 주제 | 대표 문제 |
|------|------|-----------|
| `optimization/Greedy.md` | 그리디 | 최소직사각형 |
| `search/BinarySearch.md` | 이진 탐색 | 정렬 배열 탐색 |

**목표:** 매 순간 최선 선택 vs 정렬 후 범위 줄이기

---

## 5주차 — 문자열

| 파일 | 주제 | 대표 문제 |
|------|------|-----------|
| `string/String.md` | 문자열 처리 | 숫자 문자열과 영단어 |

**목표:** 치환, 파싱, 빈도수, 패턴 매칭

---

## 6주차 — 누적합 · 그래프 기초

| 파일 | 주제 |
|------|------|
| `techniques/PrefixSum.md` | 부분합 / 누적합 |
| `graph/TopologicalSort.md` | 위상 정렬 |

**목표:** 구간 합 O(1), DAG 순서

---

## 7주차 — 힙 · 최단 경로

| 파일 | 주제 |
|------|------|
| `data-structures/Heap.md` | 힙 / 우선순위 큐 |
| `search/Dijkstra.md` | 다익스트라 |

**목표:** 최소값 꺼내기, 가중치 그래프 최단 거리

---

## 8주차+ — 심화 (여유 있을 때)

| 파일 | 주제 |
|------|------|
| `optimization/DP.md` | 동적 프로그래밍 |
| `data-structures/DSU.md` | Union-Find |
| `search/Trie.md` | 트라이 |
| `data-structures/SegmentTree.md` | 세그먼트 트리 |

---

## 폴더 구조 한눈에

```
algorithm/
├── data-structures/   Array, HashMap, Stack, Heap, DSU, SegmentTree
├── techniques/        BruteForce, TwoPointer, SlidingWindow, PrefixSum
├── search/            DFS, BFS, BinarySearch, Dijkstra, Trie
├── optimization/      Greedy, DP
├── string/            String
└── graph/             TopologicalSort
```

