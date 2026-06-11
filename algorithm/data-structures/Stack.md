# 📚 스택·큐 (Stack / Queue)

> 주제: 스택, 큐  
> 목표: 스택·큐 개념과 대표 문제(LeetCode, 스터디, 스택·큐 유형)를 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념          | 설명                                                                               |
| ------------- | ---------------------------------------------------------------------------------- |
| **스택**      | LIFO(Last-In-First-Out) — 마지막에 넣은 것이 먼저 나옴                             |
| **큐**        | FIFO(First-In-First-Out) — 먼저 넣은 것이 먼저 나옴 (순서 유지, 대기열)           |
| **자료구조**  | 배열 또는 연결 리스트로 구현                                                       |
| **주요 연산** | 스택: `push()` / `pop()` / `peek()` · 큐: `enqueue()` / `dequeue()`                |
| **활용 분야** | 스택: 괄호 검사, 수식 계산, Monotonic Stack · 큐: BFS, 순서 유지, 대기 시뮬레이션  |

---

## 📘 **문제: LeetCode 20. Valid Parentheses**

> 괄호 유효성 검사

### 💬 **입출력 예시**

| 입력       | 출력    |
| ---------- | ------- |
| `"()"`     | `true`  |
| `"()[]{}"` | `true`  |
| `"(]"`     | `false` |
| `"([)]"`   | `false` |

### 💻 **코드 + 주석**

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

## 📘 **문제: Monotonic Stack - LeetCode 739. Daily Temperatures**

> 매일의 온도가 주어질 때, 각 날짜에서 더 따뜻한 날까지의 일수를 구하라.

### 💬 **입출력 예시**

| 입력                        | 출력                |
| --------------------------- | ------------------- |
| `[73,74,75,71,69,72,76,73]` | `[1,1,4,2,1,1,0,0]` |

### 💻 **코드 + 주석**

```js
// Monotonic Stack 패턴
function dailyTemperatures(temperatures) {
  const stack = []; // [인덱스]
  const result = new Array(temperatures.length).fill(0);

  for (let i = 0; i < temperatures.length; i++) {
    // 현재 온도가 스택의 top보다 높으면 → 오큰수 발견
    while (
      stack.length &&
      temperatures[i] > temperatures[stack[stack.length - 1]]
    ) {
      const prevIndex = stack.pop();
      result[prevIndex] = i - prevIndex;
    }
    stack.push(i);
  }

  return result;
}
```

**핵심 포인트:**

- 스택에 인덱스를 저장
- 현재 값이 스택 top보다 크면 → 오큰수 발견, 차이 계산
- Monotonic Stack은 "오큰수", "Next Greater Element" 문제에 자주 등장

---

## ⚡ **핵심 포인트**

| 구분       | 내용                                                    |
| ---------- | ------------------------------------------------------- |
| 시간복잡도 | O(N)                                                    |
| 자료구조   | 배열 (push/pop)                                         |
| 주요 패턴  | 괄호 매칭, 역순 처리, Monotonic Stack                   |
| 응용       | 수식 계산, 역순 문자열, Next Greater Element, 오큰수 등 |

---

## 📝 스터디 문제 정리

### [2-1] Valid Parentheses

- 문제 링크: [LeetCode 20. Valid Parentheses](https://leetcode.com/problems/valid-parentheses/description/)

- **핵심 개념**: 여는 괄호는 push, 닫는 괄호는 스택 top과 짝이 맞으면 pop. 비었거나 불일치 시 즉시 `false`
- **이유**: LIFO 구조로 가장 최근의 여는 괄호와만 짝이 맞아야 올바른 중첩을 보장

```js
function isValid(s) {
  const stack = [];
  const pairs = { ")": "(", "}": "{", "]": "[" };

  for (const ch of s) {
    // 1) 여는 괄호면 stack에 push
    if (ch === "(" || ch === "{" || ch === "[") {
      stack.push(ch);
    }
    // 2) 닫는 괄호면 stack top과 짝 비교
    else {
      // 스택이 비었거나 짝이 안 맞으면 실패
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[ch]) {
        return false;
      }
      // 짝이 맞으면 pop으로 제거
      stack.pop();
    }
  }
  // 스택이 다 비어 있어야 완성
  return stack.length === 0;
}
```

---

## 📦 스택·큐 대표 문제

> 스택·큐 유형 대표 4문제 — 문제 설명, 제한사항, 입출력 예, JS 풀이

### 1️⃣ 올바른 괄호 (Lv2)

- **링크**: [올바른 괄호](https://school.programmers.co.kr/learn/courses/30/lessons/12909)
- 괄호 `'('` / `')'`만 있을 때 올바른 짝이면 `true`. **스택**: 여는 괄호 push, 닫는 괄호 시 top과 짝 맞으면 pop.

```js
function solution(s) {
  const stack = [];
  for (const ch of s) {
    if (ch === "(") stack.push(ch);
    else {
      if (stack.length === 0) return false;
      stack.pop();
    }
  }
  return stack.length === 0;
}
```

---

### 2️⃣ 기능개발 (Lv2)

- **링크**: [기능개발](https://school.programmers.co.kr/learn/courses/30/lessons/42586)
- 앞 기능이 배포될 때 함께 배포. 남은 일수 `Math.ceil((100-p)/speed)` 계산 후, 연속된 완료 개수씩 묶어서 return.

```js
function solution(progresses, speeds) {
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));
  const answer = [];
  let maxDay = days[0], count = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] <= maxDay) count++;
    else { answer.push(count); count = 1; maxDay = days[i]; }
  }
  answer.push(count);
  return answer;
}
```

---

### 3️⃣ 프로세스 (프린터) (Lv2)

- **링크**: [프린터](https://school.programmers.co.kr/learn/courses/30/lessons/42587)
- 큐에서 맨 앞을 꺼냈을 때 더 높은 우선순위가 있으면 다시 맨 뒤에 넣기. 실행 순서로 `location` 번째일 때의 순서 return.

```js
function solution(priorities, location) {
  const queue = priorities.map((p, i) => [p, i]);
  let order = 0;
  while (queue.length) {
    const [priority, index] = queue.shift();
    const hasHigher = queue.some(([p]) => p > priority);
    if (hasHigher) queue.push([priority, index]);
    else { order++; if (index === location) return order; }
  }
}
```

---

### 4️⃣ 다리를 지나는 트럭 (Lv2)

- **링크**: [다리를 지나는 트럭](https://school.programmers.co.kr/learn/courses/30/lessons/42583)
- 다리 위 무게·대수 제한 안에서 시간 축 시뮬레이션. 큐에 `{ weight, outAt }` 넣고, 매 초 내린 트럭 제거 후 진입 가능하면 추가.

```js
function solution(bridge_length, weight, truck_weights) {
  let time = 0;
  const bridge = [];
  let totalWeight = 0, i = 0;
  while (i < truck_weights.length || bridge.length > 0) {
    time++;
    if (bridge.length && bridge[0].outAt === time) {
      totalWeight -= bridge.shift().weight;
    }
    if (i < truck_weights.length && totalWeight + truck_weights[i] <= weight && bridge.length < bridge_length) {
      totalWeight += truck_weights[i];
      bridge.push({ weight: truck_weights[i], outAt: time + bridge_length });
      i++;
    }
  }
  return time;
}
```

---

### ⚡ 스택·큐 대표 문제 정리

| 문제             | 유형        | 핵심 포인트                          |
| ---------------- | ----------- | ------------------------------------ |
| 올바른 괄호      | 스택        | push/pop으로 짝 검사                 |
| 기능개발         | 순서+완료일 | 남은 일수 → 연속 배포 묶음          |
| 프로세스(프린터) | 큐+우선순위 | 더 높은 우선순위 있으면 맨 뒤로     |
| 다리를 지나는 트럭 | 큐+시뮬레이션 | 무게·길이 제한, outAt으로 진출 시점 |

---
