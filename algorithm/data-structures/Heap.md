# ⛰️ 힙 (Heap) / 우선순위 큐 (Priority Queue)

> 주제: 힙 / 우선순위 큐
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념        | 설명                                       |
| --------- | ---------------------------------------- |
| **힙**   | 완전 이진 트리 기반 자료구조 - 부모 노드가 자식 노드보다 항상 크거나(최대 힙) 작은(최소 힙) 구조          |
| **우선순위 큐**  | 힙을 이용한 자료구조 - 우선순위가 높은 원소를 먼저 꺼냄             |
| **주요 연산**    | `insert()` O(log n), `extractMin/Max()` O(log n), `peek()` O(1)        |
| **활용 분야** | K번째 큰/작은 원소, Top K 문제, 다익스트라 알고리즘, 힙 정렬 등 |

---

## 📘 **문제: LeetCode 347. Top K Frequent Elements**

> 가장 빈도가 높은 K개의 원소를 구하라.

### 💬 **입출력 예시**

| 입력                    | 출력      |
| --------------------- | ------- |
| `nums = [1,1,1,2,2,3], k = 2` | `[1,2]` |

### 💻 **코드 + 주석**

```js
// (예시 문제)
// - LeetCode 215. Kth Largest Element in an Array
// - LeetCode 347. Top K Frequent Elements
// - LeetCode 703. Kth Largest Element in a Stream
// - LeetCode 295. Find Median from Data Stream
// - LeetCode 23. Merge k Sorted Lists
function topKFrequent(nums, k) {
  let map = new Map();
  for (let num of nums) {
    map.set(num, (map.get(num) || 0) + 1);
  }
  let bucket = [];
  for (let [num, freq] of map) {
    bucket.push([num, freq]);
  }
  bucket.sort((a, b) => b[1] - a[1]);
  return bucket.slice(0, k).map((x) => x[0]);
}
```

**보충 설명:**
- JS에서 진짜 힙이 필요하면 MinHeap/MaxHeap 클래스를 직접 구현하거나, 우선순위 큐 라이브러리 사용
- 빈도수, K번째 큰/작은 값, 실시간 정렬 등에서 자주 등장

**추가 예시:**
- "가장 가까운 K개 점 찾기", "작업 스케줄링" 등

---

## 📘 **문제: LeetCode 215. Kth Largest Element in an Array**

> 배열에서 K번째로 큰 원소를 구하라.

### 💻 **코드 + 주석**

```js
// 힙을 사용한 풀이 (실제로는 Quick Select로 O(n) 가능)
function findKthLargest(nums, k) {
  // 최소 힙 사용 (크기 k 유지)
  let heap = [];
  
  for (let num of nums) {
    if (heap.length < k) {
      heap.push(num);
      heap.sort((a, b) => a - b); // 최소 힙 유지
    } else if (num > heap[0]) {
      heap[0] = num;
      heap.sort((a, b) => a - b);
    }
  }
  
  return heap[0];
}
```

---

## ⚡ **핵심 포인트**

| 구분    | 내용                                          |
| ----- | ------------------------------------------- |
| 시간복잡도 | 삽입/삭제: O(log n), 최소/최대값 조회: O(1)                                    |
| 자료구조  | 완전 이진 트리 (배열로 구현)                                    |
| 주요 패턴  | K번째 원소 찾기, Top K 문제, 우선순위 기반 처리                         |
| 응용    | 다익스트라, 힙 정렬, 중앙값 찾기, 작업 스케줄링 등 |

---

## 📝 스터디 문제 정리

<!-- 스터디에서 제공된 문제를 여기에 추가하세요 -->

---

