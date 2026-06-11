# ➕ 부분합 (Prefix Sum)

> 주제: 부분합 / 누적합
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념                    | 설명                                                    |
| ----------------------- | ------------------------------------------------------- |
| **부분합 (Prefix Sum)** | 배열의 각 위치까지의 누적합을 미리 계산해 저장하는 기법 |
| **핵심 아이디어**       | 구간 [l, r]의 합 = prefix[r] - prefix[l-1]              |
| **시간복잡도**          | 구축: O(n), 쿼리: O(1)                                  |
| **활용 분야**           | 구간 합 쿼리, 부분 배열 합 문제, 카운팅 문제 등         |

---

## 📘 **문제: LeetCode 303. Range Sum Query - Immutable**

> 배열에서 특정 구간 [l, r] 합을 O(1)에 구하기

### 💬 **입출력 예시**

| 입력                                       | 출력 |
| ------------------------------------------ | ---- |
| `nums = [-2,0,3,-5,2,-1]`, `sumRange(0,2)` | `1`  |
| `sumRange(2,5)`                            | `-1` |

### 💻 **코드 + 주석**

```ts
// Range Sum Query (prefix sum 활용)
// 배열에서 특정 구간 [l, r) 합을 O(1)에 구하기 위한 Prefix Sum 구축
// (예시 문제)
// - LeetCode 303. Range Sum Query - Immutable
// - LeetCode 325. Maximum Size Subarray Sum Equals k (prefix+hash 응용)
// - LeetCode 560. Subarray Sum Equals K (prefix+hash 응용)
// - HackerRank: Subarray Division (Birthday Chocolate)
// - LeetCode 238. Product of Array Except Self (합이 아닌 곱의 누적 응용)
function buildPrefixSum(nums: number[]): number[] {
  let prefix = [0];
  for (let num of nums) {
    prefix.push(prefix[prefix.length - 1] + num);
  }
  return prefix;
}

function rangeSum(prefix: number[], l: number, r: number): number {
  return prefix[r] - prefix[l];
}
```

**핵심 포인트:**

- prefix[0] = 0으로 시작하여 인덱스 처리를 간단하게
- 구간 [l, r]의 합 = prefix[r+1] - prefix[l] (0-based 인덱스 기준)

---

## 📘 **문제: LeetCode 560. Subarray Sum Equals K**

> 부분 배열의 합이 K가 되는 개수 구하기 (Prefix Sum + HashMap)

### 💻 **코드 + 주석**

```js
// Prefix Sum + HashMap으로 O(n) 해결
function subarraySum(nums, k) {
  let map = new Map();
  map.set(0, 1); // prefix sum이 0인 경우 1개
  let prefixSum = 0;
  let count = 0;

  for (let num of nums) {
    prefixSum += num;
    // prefixSum - k가 이전에 나왔다면 → 그 구간의 합이 k
    if (map.has(prefixSum - k)) {
      count += map.get(prefixSum - k);
    }
    map.set(prefixSum, (map.get(prefixSum) || 0) + 1);
  }

  return count;
}
```

**핵심 포인트:**

- prefixSum[i] - prefixSum[j] = k → 구간 [j+1, i]의 합이 k
- HashMap으로 이전 prefixSum의 빈도수를 저장

---

## ⚡ **핵심 포인트**

| 구분          | 내용                                            |
| ------------- | ----------------------------------------------- |
| 시간복잡도    | 구축: O(n), 쿼리: O(1)                          |
| 핵심 아이디어 | prefix[r] - prefix[l] = 구간 [l, r]의 합        |
| 응용          | 구간 합 쿼리, 부분 배열 합 문제, 카운팅 문제 등 |

---

## 📝 스터디 문제 정리

<!-- 스터디에서 제공된 문제를 여기에 추가하세요 -->

---
