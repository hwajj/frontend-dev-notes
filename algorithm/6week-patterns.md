# ✅ 6주차: 그리디, 힙, DP 기초 & 1D 최적화

이번 주는 다양한 패턴(그리디, 힙, DP 등)을 구분하고, 실전에서 어떤 접근이 맞는지 빠르게 판단하는 연습이 목표입니다.

---

## 1. 그리디 알고리즘 (Greedy)

**핵심 개념:**

- 매 순간 최선의 선택이 전체적으로 최선의 결과를 만드는 경우
- "지금 당장 최선"이 항상 전체 최선이 되는지 문제 조건을 잘 파악해야 함

**대표 문제:**

- LeetCode 55. Jump Game
- LeetCode 45. Jump Game II
- LeetCode 134. Gas Station
- LeetCode 435. Non-overlapping Intervals
- LeetCode 253. Meeting Rooms II

**보충 설명:**

- "최적 부분 구조"와 "탐욕 선택 속성"이 모두 성립해야 그리디가 정답
- 반례가 없는지(최선의 선택이 전체 최선인지) 꼭 검증


----


**예시 코드: Jump Game**
문제 (LeetCode 55):

배열 nums의 각 원소는 현재 위치에서 최대로 점프할 수 있는 거리를 뜻함.
시작 위치에서 끝까지 도달할 수 있는지 true / false 반환.

```js


function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}
```
nums = [2, 3, 1, 1, 4] → true
// i=0 → maxReach=2
// i=1 → maxReach=4 (도착 가능)

nums = [3, 2, 1, 0, 4] → false
// i=3 이후 maxReach=3, 4번째로 못감

---------
LeetCode 45. Jump Game II
정수 배열 nums가 주어집니다.
nums[i]는 i번째 위치에서 점프할 수 있는 최대 거리를 의미합니다.

시작 위치(인덱스 0)에서
끝까지 도달하기 위한 최소 점프 횟수를 구하시오.

항상 끝까지 도달할 수 있다고 가정합니다.
```javascript

function jump(nums) {
  let jumps = 0;
  let currentEnd = 0;
  let maxReach = 0;

  for (let i = 0; i < nums.length - 1; i++) {
    maxReach = Math.max(maxReach, i + nums[i]);

    // 현재 점프의 끝에 도달했을 때 → 점프 횟수 1 증가
    if (i === currentEnd) {
      jumps++;
      currentEnd = maxReach; // 다음 점프 범위 설정
    }
  }

  return jumps;
}


```

-----

🏢 1️⃣ 회의실 배정 (Interval Scheduling Problem)

🧩 문제 설명

여러 개의 회의가 있고, 각 회의는 (시작시간, 종료시간) 으로 주어진다.

회의실은 한 개뿐이므로 겹치지 않게 최대한 많은 회의를 배정하고 싶다.

한 회의가 끝나는 순간 다음 회의를 바로 시작할 수 있다. (end <= next.start)

🎯 목표

겹치지 않게 배정할 수 있는 회의의 최대 개수 구하기


```javascript
function maxMeetings(intervals) {
  intervals.sort((a, b) => a[1] - b[1]); // 종료시간 기준 정렬
  let count = 0, endTime = 0;

  for (let [start, end] of intervals) {
    if (start >= endTime) {
      count++;
      endTime = end;
    }
  }
  return count;
}

console.log(maxMeetings([
  [1, 4], [2, 3], [3, 5], [0, 6], [5, 7], [5, 9], [8, 9]
])); // 👉 4

```
- 매 순간 가장 빨리 끝나는 회의부터 선택하면 전체적으로 최적해. 
- 이유: 빨리 끝낼수록 뒤의 회의 선택 기회가 많아짐.

---
💰 2️⃣ 동전 거스름돈 (Greedy Coin Change)

🧩 문제 설명

가지고 있는 동전 단위가 [500, 100, 50, 10] 이라 하자.

특정 금액 N원을 가장 적은 동전 수로 거슬러 주고 싶다.

```javascript
function greedyCoinChange(n, coins) {
  let count = 0;
  for (let coin of coins) {
    count += Math.floor(n / coin);
    n %= coin;
  }
  return count;
}

console.log(greedyCoinChange(1260, [500, 100, 50, 10])); // 👉 6

```
- 500 × 2 = 1000
  100 × 2 = 200
  50 × 1 = 50
  10 × 1 = 10
  총 6개

⚠️ 주의: 항상 정답은 아니다!

동전 단위가 “서로 배수 관계”일 때만 항상 최적해.

예를 들어 coins = [500, 400, 100], N=800이면

Greedy → 500+100+100+100 = 4개 ❌

최적해 → 400+400 = 2개 ✅
→ 이때는 Dynamic Programming (DP) 방식이 필요합니다.


---

## 2. 우선순위 큐 / 힙 (Priority Queue / Heap)

**핵심 개념:**

- 최소값/최대값을 빠르게 꺼내야 할 때 O(log n)에 동작
- JS에는 내장 힙이 없으므로 배열+정렬, 또는 커스텀 힙 구현 사용

**대표 문제:**

- LeetCode 215. Kth Largest Element in an Array
- LeetCode 347. Top K Frequent Elements

**예시 코드: Top K Frequent Elements**

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

## 3. 동적 계획법 (DP) 기초

**핵심 개념:**

- 큰 문제를 작은 문제로 나누어 저장하고 재활용
- 점화식(이전 상태 → 현재 상태) 세우기

**대표 문제:**

- LeetCode 70. Climbing Stairs
- LeetCode 198. House Robber

**예시 코드: Climbing Stairs**

```js
// (예시 문제)
// - LeetCode 70. Climbing Stairs
// - LeetCode 198. House Robber
// - LeetCode 746. Min Cost Climbing Stairs
// - LeetCode 213. House Robber II
// - LeetCode 53. Maximum Subarray
function climbStairs(n) {
  let dp = [1, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}
```

**보충 설명:**

- "dp[i] = dp[i-1] + dp[i-2]"처럼 점화식 세우는 연습
- 중복 계산 방지(메모이제이션, Tabulation)

**추가 예시:**

- 피보나치 수열, 계단 오르기, 최대 부분합(Subarray Sum)

---

## 4. DP + 1D 최적화

**핵심 개념:**

- 2D DP를 1D 배열로 줄여 메모리/속도 최적화
- 이전 상태만 기억하면 되는 경우 1D로 가능

**대표 문제:**

- LeetCode 322. Coin Change
- LeetCode 300. Longest Increasing Subsequence (부분 DP + 이분탐색)

**예시 코드: Coin Change**

```js
// (예시 문제)
// - LeetCode 322. Coin Change
// - LeetCode 300. Longest Increasing Subsequence
// - LeetCode 1143. Longest Common Subsequence
// - LeetCode 139. Word Break
// - LeetCode 518. Coin Change 2
function coinChange(coins, amount) {
  let dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

**보충 설명:**

- 2차원 DP(예: 배낭 문제, 편집 거리 등)도 1D로 최적화 가능
- LIS(최장 증가 부분수열)는 DP+이분탐색으로 O(N log N) 풀이 가능

**추가 예시:**

- LeetCode 300. Longest Increasing Subsequence
- LeetCode 1143. Longest Common Subsequence (LCS)

---

## 📅 6주차 학습 플랜

- **Day 1-2:** 그리디 알고리즘 문제 (Jump Game, Interval Scheduling)
- **Day 3-4:** 힙/우선순위 큐 문제 (Kth Largest, Top K Frequent Elements)
- **Day 5:** DP 기초 (Climbing Stairs, House Robber)
- **Day 6-7:** DP 1D 최적화 문제 (Coin Change, LIS)

**실전 팁:**

- "이건 그리디인가? DP인가? BFS인가?" 패턴 분류 연습이 중요
- 문제를 풀기 전에 접근법(탐욕, DP, 탐색 등)부터 먼저 고민
- 여러 패턴이 섞인 문제도 많으니, 각 패턴의 핵심 조건을 빠르게 파악하는 연습을 하세요.
