# 🔍 이진 탐색 (Binary Search)

> 주제: 이진 탐색
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념                        | 설명                          |
| ------------------------- | --------------------------- |
| **Binary Search (이진 탐색)** | 정렬된 배열을 반으로 나누며 탐색하는 알고리즘   |
| **Lower Bound**           | **target 이상**이 처음 나타나는 인덱스  |
| **Upper Bound**           | **target 초과**가 처음 나타나는 인덱스  |
| **핵심 아이디어**               | mid 비교 결과로 탐색 범위를 절반씩 줄인다.  |
| **활용 분야**                 | 삽입 위치, 범위 찾기, LIS, K번째 원소 등 |

---

## 📘 **문제 1: LeetCode 704. Binary Search**

> 정렬된 배열에서 target 찾기

### 💬 **입출력 예시**

| 입력                    | 출력    |
| --------------------- | ----- |
| `nums = [-1,0,3,5,9,12], target = 9` | `4` |
| `nums = [-1,0,3,5,9,12], target = 2` | `-1` |

### 💻 **코드 + 주석**

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

---

## 📘 **문제 2: LeetCode 35. Search Insert Position**

> 정렬된 배열 `nums`에서 `target`의 인덱스를 찾고,
> 없으면 **삽입될 위치**를 반환하라.
> (즉, `Lower Bound` 문제.)

### 💬 **입출력 예시**

| 입력                             | 출력  |
| ------------------------------ | --- |
| nums = `[1,3,5,6]`, target = 5 | `2` |
| nums = `[1,3,5,6]`, target = 2 | `1` |
| nums = `[1,3,5,6]`, target = 7 | `4` |

### 💡 시각적 개념

```
nums = [1,3,5,6]
target = 4
          ↑
lowerBound = 2 (첫 번째 4 이상 위치)
```

### 💻 **코드 + 주석**

```js
// ✅ Lower Bound (첫 번째 target 이상 위치)
function lowerBound(nums, target) {
  let l = 0, r = nums.length;             // 탐색 구간 [l, r)
  while (l < r) {
    let mid = Math.floor((l + r) / 2);    // 중앙 인덱스
    if (nums[mid] < target) l = mid + 1;  // target보다 작으면 오른쪽으로 이동
    else r = mid;                         // target 이상이면 왼쪽 범위로 좁힘
  }
  return l;                               // 첫 번째 target 이상 인덱스 반환
}
```

### ⚙️ **로직 정리**

1. 정렬된 배열에서 중앙값(mid)을 비교
2. `nums[mid] < target`이면 왼쪽은 버리고 오른쪽 탐색
3. `nums[mid] >= target`이면 오른쪽 버리고 왼쪽 유지
4. l과 r이 만나는 지점이 **삽입 가능한 최소 위치**

---

## 📘 **문제 3: LeetCode 875. Koko Eating Bananas (Parametric Search)**

> 답의 범위를 이분탐색으로 줄여가며 조건 만족 여부 확인

### 💻 **코드 + 주석**

```js
// (예시 문제)
// - LeetCode 875. Koko Eating Bananas
// - LeetCode 1011. Capacity To Ship Packages Within D Days
// - LeetCode 410. Split Array Largest Sum
// - LeetCode 1283. Find the Smallest Divisor Given a Threshold
// - LeetCode 278. First Bad Version (조건 탐색)
function minEatingSpeed(piles, h) {
  let l = 1,
    r = Math.max(...piles);
  let res = r;

  function canEat(speed) {
    let hours = 0;
    for (let pile of piles) {
      hours += Math.ceil(pile / speed);
    }
    return hours <= h;
  }

  while (l <= r) {
    let mid = Math.floor((l + r) / 2);
    if (canEat(mid)) {
      res = mid;
      r = mid - 1;
    } else {
      l = mid + 1;
    }
  }
  return res;
}
```

**보충 설명:**
- 조건 함수(canEat, canShip 등)로 mid값의 가능 여부 판단
- Parametric Search(조건부 최적화) 문제에 자주 등장

---

## ⚡ **핵심 포인트**

| 구분    | 내용                                            |
| ----- | --------------------------------------------- |
| 시간복잡도 | O(log N)                                      |
| 탐색 대상 | 정렬된 배열                                        |
| 응용    | Search Insert, LIS, Range Counting, Median 찾기 |
| 주의    | 항상 **정렬 전제** 필요                               |

---

## ✅ **한 줄 요약**

> Binary Search는 "탐색 범위를 반으로 줄이는 사고법".
> **Lower Bound**는 "target 이상이 처음 나오는 위치"를 찾는 응용 패턴.

---

## 📝 스터디 문제 정리

<!-- 스터디에서 제공된 문제를 여기에 추가하세요 -->

---

