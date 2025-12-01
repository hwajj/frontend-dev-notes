# 🌲 세그먼트 트리 / 펜윅 트리 (Segment Tree / Fenwick Tree)

> 주제: 세그먼트 트리 & 펜윅 트리
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념        | 설명                                       |
| --------- | ---------------------------------------- |
| **세그먼트 트리**   | 구간 합/최소/최대 쿼리를 O(log n)에 처리하는 자료구조          |
| **펜윅 트리**  | 구간 합/갱신에 특화된 간단한 구현 (Binary Indexed Tree)             |
| **주요 연산**    | 구간 쿼리, 원소 갱신 (모두 O(log n))        |
| **시간복잡도** | 구간 쿼리: O(log n), 원소 갱신: O(log n) |
| **활용 분야** | 구간 합/최소/최대 쿼리, 역순 쌍 개수, 실시간 랭킹, 구간 업데이트 등 |

---

## 📘 **문제 1: LeetCode 307. Range Sum Query - Mutable**

> 배열의 구간 합을 구하고, 원소를 갱신할 수 있는 자료구조를 구현하라.

### 💬 **입출력 예시**

```js
let numArray = new NumArray([1, 3, 5]);
numArray.sumRange(0, 2); // 9
numArray.update(1, 2);   // [1, 2, 5]
numArray.sumRange(0, 2); // 8
```

---

## 📘 **펜윅 트리 (Fenwick Tree) 구현**

### 💻 **코드 + 주석**

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
  
  // 구간 [l, r]의 합
  rangeSum(l, r) {
    return this.query(r) - this.query(l - 1);
  }
}

// Range Sum Query - Mutable (펜윅 트리 사용)
class NumArray {
  constructor(nums) {
    this.nums = nums;
    this.n = nums.length;
    this.fenwick = new Fenwick(this.n);
    
    // 초기값 삽입
    for (let i = 0; i < this.n; i++) {
      this.fenwick.update(i + 1, nums[i]); // 1-based
    }
  }
  
  update(index, val) {
    let delta = val - this.nums[index];
    this.nums[index] = val;
    this.fenwick.update(index + 1, delta); // 1-based
  }
  
  sumRange(left, right) {
    return this.fenwick.rangeSum(left + 1, right + 1); // 1-based
  }
}
```

**핵심 포인트:**
- **1-based 인덱스** 사용 (0-based보다 구현이 간단)
- `i & -i` 연산으로 다음/이전 노드로 이동 (비트 연산)
- `update`: i번째 값 변경 시 영향받는 모든 노드 갱신
- `query`: 1~i까지의 누적합 계산

---

## 📘 **세그먼트 트리 (Segment Tree) 구현**

### 💻 **코드 + 주석**

```js
class SegmentTree {
  constructor(nums) {
    this.n = nums.length;
    this.tree = Array(4 * this.n).fill(0);
    this.build(nums, 0, 0, this.n - 1);
  }
  
  // 트리 구축
  build(nums, node, start, end) {
    if (start === end) {
      this.tree[node] = nums[start];
    } else {
      let mid = Math.floor((start + end) / 2);
      this.build(nums, 2 * node + 1, start, mid);
      this.build(nums, 2 * node + 2, mid + 1, end);
      this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
    }
  }
  
  // 구간 [l, r]의 합
  query(node, start, end, l, r) {
    if (r < start || end < l) return 0; // 범위 밖
    if (l <= start && end <= r) return this.tree[node]; // 완전히 포함
    
    let mid = Math.floor((start + end) / 2);
    return this.query(2 * node + 1, start, mid, l, r) +
           this.query(2 * node + 2, mid + 1, end, l, r);
  }
  
  // index 위치의 값을 val로 갱신
  update(node, start, end, index, val) {
    if (start === end) {
      this.tree[node] = val;
    } else {
      let mid = Math.floor((start + end) / 2);
      if (index <= mid) {
        this.update(2 * node + 1, start, mid, index, val);
      } else {
        this.update(2 * node + 2, mid + 1, end, index, val);
      }
      this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
    }
  }
}

// Range Sum Query - Mutable (세그먼트 트리 사용)
class NumArray {
  constructor(nums) {
    this.segTree = new SegmentTree(nums);
    this.n = nums.length;
  }
  
  update(index, val) {
    this.segTree.update(0, 0, this.n - 1, index, val);
  }
  
  sumRange(left, right) {
    return this.segTree.query(0, 0, this.n - 1, left, right);
  }
}
```

**핵심 포인트:**
- 완전 이진 트리 구조 (배열로 구현)
- 각 노드는 구간 [start, end]의 합을 저장
- `query`: 구간이 완전히 포함되면 바로 반환, 아니면 분할하여 재귀 호출
- `update`: 리프 노드부터 루트까지 갱신

---

## 📘 **문제 2: LeetCode 315. Count of Smaller Numbers After Self**

> 각 원소의 오른쪽에 있는 더 작은 원소의 개수를 구하라.

### 💬 **입출력 예시**

| 입력                    | 출력    |
| --------------------- | ----- |
| `nums = [5,2,6,1]` | `[2,1,1,0]` |
| `nums = [-1]` | `[0]` |

### 💻 **코드 + 주석 (펜윅 트리 사용)**

```js
// Count of Smaller Numbers After Self
function countSmaller(nums) {
  // 좌표 압축 (좌표 압축: 큰 범위를 작은 범위로 매핑)
  let sorted = [...new Set(nums)].sort((a, b) => a - b);
  let map = new Map();
  for (let i = 0; i < sorted.length; i++) {
    map.set(sorted[i], i + 1); // 1-based
  }
  
  let fenwick = new Fenwick(sorted.length);
  let result = [];
  
  // 오른쪽부터 왼쪽으로 순회
  for (let i = nums.length - 1; i >= 0; i--) {
    let index = map.get(nums[i]);
    result[i] = fenwick.query(index - 1); // index보다 작은 값들의 개수
    fenwick.update(index, 1); // 현재 값 카운트 증가
  }
  
  return result;
}
```

---

## 📘 **문제 3: LeetCode 493. Reverse Pairs**

> nums[i] > 2 * nums[j] (i < j)인 쌍의 개수를 구하라.

### 💻 **코드 + 주석 (펜윅 트리 사용)**

```js
// Reverse Pairs
function reversePairs(nums) {
  // 좌표 압축: 2 * nums[j] 값도 포함
  let allNums = [];
  for (let num of nums) {
    allNums.push(num);
    allNums.push(2 * num);
  }
  let sorted = [...new Set(allNums)].sort((a, b) => a - b);
  let map = new Map();
  for (let i = 0; i < sorted.length; i++) {
    map.set(sorted[i], i + 1);
  }
  
  let fenwick = new Fenwick(sorted.length);
  let count = 0;
  
  // 오른쪽부터 왼쪽으로 순회
  for (let i = nums.length - 1; i >= 0; i--) {
    let target = 2 * nums[i];
    // target보다 작은 값의 개수 찾기
    let index = map.get(target);
    count += fenwick.query(index - 1);
    
    // 현재 값 추가
    let numIndex = map.get(nums[i]);
    fenwick.update(numIndex, 1);
  }
  
  return count;
}
```

---

## ⚡ **핵심 포인트**

| 구분    | 내용                                          |
| ----- | ------------------------------------------- |
| 시간복잡도 | 구간 쿼리: O(log n), 원소 갱신: O(log n)                                    |
| 공간복잡도  | 펜윅: O(n), 세그먼트: O(4n)                                    |
| 선택 기준  | 펜윅: 구간 합에 특화, 구현 간단 / 세그먼트: 범용적, 복잡하지만 강력                         |
| 응용    | 구간 합/최소/최대, 역순 쌍 개수, 실시간 랭킹, 구간 업데이트 등 |

---

## 📝 스터디 문제 정리

<!-- 스터디에서 제공된 문제를 여기에 추가하세요 -->

---

