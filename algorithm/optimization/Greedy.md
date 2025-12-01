# 💰 그리디 (Greedy Algorithm)

> 주제: 그리디 알고리즘
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념                | 설명                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| **그리디 알고리즘** | 매 순간 최선의 선택이 전체적으로 최선의 결과를 만드는 경우                         |
| **핵심 원칙**       | "지금 당장 최선"이 항상 전체 최선이 되는지 문제 조건을 잘 파악해야 함              |
| **필수 조건**       | "최적 부분 구조"와 "탐욕 선택 속성"이 모두 성립해야 그리디가 정답                  |
| **활용 분야**       | 최소/최대 문제, 구간 스케줄링, 동전 거스름돈(특정 조건), 최단 경로(특정 그래프) 등 |

---

## 📘 **문제 1: LeetCode 55. Jump Game**

> 배열 nums의 각 원소는 현재 위치에서 최대로 점프할 수 있는 거리를 뜻함.
> 시작 위치에서 끝까지 도달할 수 있는지 true / false 반환.

### 💬 **입출력 예시**

| 입력                 | 출력    |
| -------------------- | ------- |
| `nums = [2,3,1,1,4]` | `true`  |
| `nums = [3,2,1,0,4]` | `false` |

### 💻 **코드 + 주석**

```js
// - LeetCode 55. Jump Game
// - LeetCode 45. Jump Game II
// - LeetCode 134. Gas Station
// - LeetCode 435. Non-overlapping Intervals
// - LeetCode 253. Meeting Rooms II
function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}
```

**설명:**

- nums = [2, 3, 1, 1, 4] → true
  - i=0 → maxReach=2
  - i=1 → maxReach=4 (도착 가능)
- nums = [3, 2, 1, 0, 4] → false
  - i=3 이후 maxReach=3, 4번째로 못감

---

## 📘 **문제 2: LeetCode 45. Jump Game II**

> 시작 위치(인덱스 0)에서 끝까지 도달하기 위한 최소 점프 횟수를 구하시오.
> 항상 끝까지 도달할 수 있다고 가정합니다.

### 💻 **코드 + 주석**

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

---

## 📘 **문제 3: 회의실 배정 (Interval Scheduling Problem)**

> 여러 개의 회의가 있고, 각 회의는 (시작시간, 종료시간) 으로 주어진다.
> 회의실은 한 개뿐이므로 겹치지 않게 최대한 많은 회의를 배정하고 싶다.
> 한 회의가 끝나는 순간 다음 회의를 바로 시작할 수 있다. (end <= next.start)

### 💻 **코드 + 주석**

```javascript
function maxMeetings(intervals) {
  intervals.sort((a, b) => a[1] - b[1]); // 종료시간 기준 정렬
  let count = 0,
    endTime = 0;

  for (let [start, end] of intervals) {
    if (start >= endTime) {
      count++;
      endTime = end;
    }
  }
  return count;
}

console.log(
  maxMeetings([
    [1, 4],
    [2, 3],
    [3, 5],
    [0, 6],
    [5, 7],
    [5, 9],
    [8, 9],
  ])
); // 👉 4
```

**핵심 포인트:**

- 매 순간 가장 빨리 끝나는 회의부터 선택하면 전체적으로 최적해.
- 이유: 빨리 끝낼수록 뒤의 회의 선택 기회가 많아짐.

---

## 📘 **문제 4: 동전 거스름돈 (Greedy Coin Change)**

> 가지고 있는 동전 단위가 [500, 100, 50, 10] 이라 하자.
> 특정 금액 N원을 가장 적은 동전 수로 거슬러 주고 싶다.

### 💻 **코드 + 주석**

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

**설명:**

- 500 × 2 = 1000
- 100 × 2 = 200
- 50 × 1 = 50
- 10 × 1 = 10
- 총 6개

**⚠️ 주의: 항상 정답은 아니다!**

- 동전 단위가 "서로 배수 관계"일 때만 항상 최적해.
- 예를 들어 coins = [500, 400, 100], N=800이면
  - Greedy → 500+100+100+100 = 4개 ❌
  - 최적해 → 400+400 = 2개 ✅
  - → 이때는 Dynamic Programming (DP) 방식이 필요합니다.

---

## ⚡ **핵심 포인트**

| 구분       | 내용                                                               |
| ---------- | ------------------------------------------------------------------ |
| 시간복잡도 | 대부분 O(n log n) - 정렬 포함                                      |
| 핵심 원칙  | 매 순간 최선의 선택이 전체 최선인지 검증 필요                      |
| 필수 조건  | 최적 부분 구조 + 탐욕 선택 속성                                    |
| 응용       | 구간 스케줄링, 동전 거스름돈(특정 조건), 최단 경로(특정 그래프) 등 |

---

## 📝 스터디 문제 정리

<!-- 스터디에서 제공된 문제를 여기에 추가하세요 -->

---
