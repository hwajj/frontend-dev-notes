# ✅ 3주차: 많이 쓰이는 테크닉 & 기본 패턴

이번 주는 실전에서 자주 등장하는 핵심 테크닉을 익히는 것이 목표입니다.
HashMap / Stack / Sorting+Two Pointers(3Sum) / Binary Search
---

## 1. 해시맵 / 딕셔너리 활용 (Hashing)

**등장 패턴:**

- 원소의 등장 횟수 세기
- 빠른 조회 (O(1) 평균 시간)

**암기할 가치 있는 개념:**

- JS의 `Map`, `Object`로 빈도수/존재 여부 체크
- 해시맵은 중복/빠른 조회/카운팅에 매우 유용

**예시 코드: 배열에서 각 원소의 빈도수 세기**
(예: LeetCode 1. Two Sum, 387. First Unique Character in a String)

```js
// (예시 문제)
// - LeetCode 1. Two Sum
// - LeetCode 387. First Unique Character in a String
// - LeetCode 49. Group Anagrams
// - LeetCode 242. Valid Anagram
// - HackerRank: Sherlock and the Valid String
function countFrequencies(nums) {
  let map = new Map();
  for (let num of nums) {
    map.set(num, (map.get(num) || 0) + 1);
  }
  return map;
}
```

**보충 설명:**

- `map.get(num) || 0` 패턴은 자주 쓰임
- Object도 가능하지만, Map이 더 안전(키 타입 제한 없음)

---

## 2. 스택 (Stack) 활용

**등장 패턴:**

- 괄호 검사 (Valid Parentheses)
- 최근 원소 추적 (Undo, Back 기능)
- Monotonic Stack (오큰수, Next Greater Element)

**암기할 가치 있는 개념:**

- LIFO(Last-In-First-Out) 구조
- 괄호 짝 맞추기, 수식 계산, 오큰수 등에서 자주 등장

**예시 코드: 괄호 유효성 검사**
(예: LeetCode 20. Valid Parentheses)

```js
// (예시 문제)
// - LeetCode 20. Valid Parentheses
// - LeetCode 150. Evaluate Reverse Polish Notation
// - LeetCode 155. Min Stack
// - LeetCode 739. Daily Temperatures (Monotonic Stack)
// - LeetCode 496. Next Greater Element I
function isValid(s) {
  const stack = [];
  const map = { ")": "(", "}": "{", "]": "[" };

  for (let ch of s) {
    if (ch in map) {
      if (stack.length === 0 || stack.pop() !== map[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}
```

**보충 설명:**

- stack.push, stack.pop 패턴을 익혀두기
- Monotonic Stack(단조 스택)은 오큰수, 주식 가격 등에서 활용

---

## 3. 정렬 (Sorting) + 투 포인터 확장

**등장 패턴:**

- 배열 정렬 후, 특정 조건을 만족하는 쌍/삼중합 찾기
- 중복 제거, 구간 합, 최적 쌍 찾기 등

**암기할 가치 있는 개념:**

- Two Sum → Three Sum으로 확장
- 정렬 후 투 포인터(l, r)로 탐색

**예시 코드: 세 수의 합이 0이 되는 모든 조합 찾기**
(예: LeetCode 15. 3Sum)

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
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1,
      r = nums.length - 1;
    while (l < r) {
      let sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l + 1]) l++;
        while (l < r && nums[r] === nums[r - 1]) r--;
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

## 4. 이진 탐색 (Binary Search)

**등장 패턴:**

- 정렬된 배열에서 값 찾기
- 조건을 만족하는 최소/최대값 찾기 (Parametric Search)

**암기할 가치 있는 개념:**

- `mid = Math.floor((l+r)/2)`
- `while (l <= r)` 패턴
- lower/upper bound, 조건부 탐색 등

**예시 코드: 정렬된 배열에서 target 찾기**
(예: LeetCode 704. Binary Search)

```js
// (예시 문제)
// - LeetCode 704. Binary Search
// - LeetCode 34. Find First and Last Position of Element in Sorted Array
// - LeetCode 35. Search Insert Position
// - LeetCode 278. First Bad Version
// - LeetCode 153. Find Minimum in Rotated Sorted Array
function binarySearch(nums, target) {
  let l = 0,
    r = nums.length - 1;
  while (l <= r) {
    let mid = Math.floor((l + r) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) l = mid + 1;
    else r = mid - 1;
  }
  return -1;
}
```

**보충 설명:**

- 이진 탐색은 lower/upper bound, 최적화 문제(Parametric Search)에도 활용
- 무한 루프 방지: `while (l <= r)` 조건, mid 계산법 숙지
