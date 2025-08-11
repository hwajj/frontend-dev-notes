# ✅ 6주차: 그리디, 힙, DP 기초 & 1D 최적화

이번 주는 다양한 패턴(그리디, 힙, DP 등)을 구분하고, 실전에서 어떤 접근이 맞는지 빠르게 판단하는 연습이 목표입니다.

---

## 1. 그리디 알고리즘 (Greedy)

**핵심 개념:**

- 매 순간 최선의 선택이 전체적으로 최선의 결과를 만드는 경우
- "지금 당장 최선"이 항상 전체 최선이 되는지 문제 조건을 잘 파악해야 함

**대표 문제:**

- LeetCode 55. Jump Game
- LeetCode 435. Non-overlapping Intervals

**예시 코드: Jump Game**

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

**보충 설명:**

- "최적 부분 구조"와 "탐욕 선택 속성"이 모두 성립해야 그리디가 정답
- 반례가 없는지(최선의 선택이 전체 최선인지) 꼭 검증

**추가 예시:**

- 회의실 배정(Interval Scheduling), 동전 거스름돈(Greedy Coin Change)

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
