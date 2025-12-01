# 🔍 BFS (Breadth First Search, 너비 우선 탐색)

> 주제: BFS
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념        | 설명                                       |
| --------- | ---------------------------------------- |
| **BFS**   | 시작점에서 가까운 노드(이웃)부터 탐색해 나가는 알고리즘          |
| **자료구조**  | **큐(Queue)** 사용 — 선입선출(FIFO)             |
| **특징**    | 한 단계씩 확장하므로 "최단 거리(최소 단계)" 문제에 적합        |
| **방문 관리** | `visited` 집합을 써서 중복 탐색 방지                |
| **활용 분야** | 그래프 최단 경로, 미로 탐색, Word Ladder, 네트워크 탐색 등 |

---

## 📘 **문제: LeetCode 127. Word Ladder**

> 단어 beginWord → endWord로 변환할 때,
> 한 번에 한 글자만 바꿀 수 있고 각 단계 단어는 `wordList` 안에 있어야 한다.
> **최단 변환 단계 수**를 구하라.

### 💬 **입출력 예시**

| 입력                                                                                         | 출력  |
| ------------------------------------------------------------------------------------------ | --- |
| beginWord = `"hit"`, endWord = `"cog"`, wordList = `["hot","dot","dog","lot","log","cog"]` | `5` |
| beginWord = `"hit"`, endWord = `"cog"`, wordList = `["hot","dot","dog","lot","log"]`       | `0` |

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
  let queue = [[start, 1]];          // [단어, 거리]
  let visited = new Set([start]);    // 방문 기록 (중복 방지)

  while (queue.length) {
    let [word, dist] = queue.shift(); // 큐에서 하나 꺼냄
    if (word === end) return dist;    // 목적지 도착 → 거리 반환

    // 인접(한 글자 차이) 단어 순회
    for (let nei of graph[word] || []) {
      if (!visited.has(nei)) {
        visited.add(nei);             // 방문 표시
        queue.push([nei, dist + 1]);  // 거리 1 증가 후 큐에 추가
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

| 구분    | 내용                                          |
| ----- | ------------------------------------------- |
| 시간복잡도 | O(V + E)                                    |
| 자료구조  | 큐 (FIFO)                                    |
| 탐색방식  | 한 단계씩 확장 → 최단 거리 보장                         |
| 응용    | 미로 최단 거리, Graph Traversal, Friend Network 등 |

### ✅ **한 줄 요약**

> BFS는 "가까운 노드부터 탐색하는 최단 거리 알고리즘".
> **Queue + 방문 체크 = 최소 단계 탐색** 공식.

---

## 📝 스터디 문제 정리

<!-- 스터디에서 제공된 문제를 여기에 추가하세요 -->

---

