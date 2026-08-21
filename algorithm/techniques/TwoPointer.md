# 👆👆 투 포인터 (Two Pointers)

> 주제: 투 포인터
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념          | 설명                                                                 |
| ------------- | -------------------------------------------------------------------- |
| **투 포인터** | 두 개의 포인터를 사용하여 배열이나 문자열을 효율적으로 탐색하는 기법 |
| **주요 패턴** | 양끝에서 좁혀오기, 같은 방향 이동, 빠른/느린 포인터                  |
| **활용 분야** | 정렬된 배열의 합 찾기, 회문 검사, 중복 제거, 구간 탐색 등            |

---

## 📘 **문제: LeetCode 167. Two Sum II - Input Array Is Sorted**

> 정렬된 배열에서 합이 target이 되는 두 수의 1-based 인덱스를 찾는 문제

### 💬 **입출력 예시**

| 입력                                | 출력    | 설명        |
| ----------------------------------- | ------- | ----------- |
| `numbers = [2,7,11,15], target = 9` | `[1,2]` | 2 + 7 = 9   |
| `numbers = [2,3,4], target = 6`     | `[1,3]` | 2 + 4 = 6   |
| `numbers = [-1,0], target = -1`     | `[1,2]` | -1 + 0 = -1 |

### 💻 **코드 + 주석**

```ts
//정렬된 배열에서 합이 target이 되는 두 수의 1-based 인덱스를 찾는 문제 풀이 (투 포인터)
// (예시 문제)
// - LeetCode 167. Two Sum II (Input Array Is Sorted)
// - LeetCode 125. Valid Palindrome (양끝 포인터 응용)
// - LeetCode 344. Reverse String (양끝 스왑)
// - HackerRank: Pairs (정렬 후 투 포인터/이분탐색 응용)
// - LeetCode 11. Container With Most Water (양끝 좁혀오기)
function twoSum(numbers: number[], target: number): number {
  //left , right 가 양끝
  let left = 0,
    right = numbers.length - 1;

  while (left < right) {
    let sum = numbers[left] + numbers[right];
    if (sum === target)
      return [left + 1, right + 1]; // 1-based index
    // 합이 너무 작으면 left를 오른쪽으로 옮기고,
    else if (sum < target) left++;
    //    합이 너무 크면 right를 왼쪽으로 옮김
    else right--;
  }
  return [];
}
```

**핵심 포인트:**

- 배열이 정렬되어 있으므로,
  합이 너무 작으면 left를 오른쪽으로 옮기고,
  합이 너무 크면 right를 왼쪽으로 옮김.
- 조건에 맞는 두 수를 찾으면 그 인덱스를 반환.

---

## 📘 **문제: LeetCode 15. 3Sum**

> 세 수의 합이 0이 되는 모든 조합 찾기

### 💬 **입출력 예시**

| 입력                      | 출력                   |
| ------------------------- | ---------------------- |
| `nums = [-1,0,1,2,-1,-4]` | `[[-1,-1,2],[-1,0,1]]` |

### 💻 **코드 + 주석**

```js
// (예시 문제)
// - LeetCode 15. 3Sum
// - LeetCode 16. 3Sum Closest
// - LeetCode 18. 4Sum
// - LeetCode 167. Two Sum II - Input Array Is Sorted
// - LeetCode 42. Trapping Rain Water
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // 고정숫자 같은 값 건너뛴다.
    let l = i + 1,
      r = nums.length - 1;
    while (l < r) {
      let sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l + 1]) l++; // left 중복제거
        while (l < r && nums[r] === nums[r - 1]) r--; // right 중복제거
        l++;
        r--;
      } else if (sum < 0) {
        l++;
      } else {
        r--;
      }
    }
  }
  return res;
}
```

**보충 설명:**

- 정렬 후 투 포인터는 다양한 문제(쌍, 삼중합, 구간 등)에 응용 가능
- 중복 제거 패턴(while로 l/r 이동)도 암기

---

## ⚡ **핵심 포인트**

| 구분       | 내용                                                    |
| ---------- | ------------------------------------------------------- |
| 시간복잡도 | O(n) ~ O(n²)                                            |
| 주요 패턴  | 양끝 좁혀오기, 같은 방향 이동, 빠른/느린 포인터         |
| 응용       | 정렬된 배열 합 찾기, 회문 검사, 중복 제거, 구간 탐색 등 |

---

## 📝 스터디 문제 정리

### [2-5] Trapping Rain Water

- 문제 링크: [LeetCode 42. Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/description/)

- **핵심 개념**: 물 높이 = `min(leftMax, rightMax) - height[i]` (음수면 0)
- **이유**: 더 낮은 쪽의 최대 높이는 반대편이 더 높을 때 확정되므로, 낮은 쪽 포인터를 이동하며 누적 계산

```js
function trap(height) {
  // 투 포인터 + 누적 최대 높이로 O(n) / O(1) 풀이
  let l = 0, // 왼쪽 포인터
    r = height.length - 1; // 오른쪽 포인터
  let leftMax = 0, // 왼쪽에서 지금까지 본 최대 벽 높이
    rightMax = 0, // 오른쪽에서 지금까지 본 최대 벽 높이
    water = 0; // 누적 물의 양

  while (l < r) {
    if (height[l] < height[r]) {
      // 왼쪽이 더 낮음 → 왼쪽 기준 물 높이 확정
      if (height[l] >= leftMax) {
        leftMax = height[l]; // 새 최대 갱신(이 칸은 물이 안 참)
      } else {
        water += leftMax - height[l]; // leftMax가 더 높으면 그 차이만큼 물이 참
      }
      l++; // 낮은 쪽을 한 칸 이동
    } else {
      if (height[r] >= rightMax) {
        rightMax = height[r]; // 오른쪽 최대 갱신
      } else {
        water += rightMax - height[r]; // rightMax 기준으로 물을 더함
      }
      r--; // 낮은 쪽을 한 칸 이동
    }
  }
  return water; // 총 물의 양
}
```

---
