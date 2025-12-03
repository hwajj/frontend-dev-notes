# 📚 스택 (Stack)

> 주제: 스택
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념          | 설명                                                                               |
| ------------- | ---------------------------------------------------------------------------------- |
| **스택**      | LIFO(Last-In-First-Out) 구조 - 마지막에 넣은 것이 먼저 나옴                        |
| **자료구조**  | 배열 또는 연결 리스트로 구현                                                       |
| **주요 연산** | `push()` (추가), `pop()` (제거), `peek()` (확인)                                   |
| **활용 분야** | 괄호 검사, 수식 계산, 역순 처리, Monotonic Stack (오큰수, Next Greater Element) 등 |

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
    if (ch === "(" || ch === "{" || ch === "[") {
      stack.push(ch);
    } else {
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[ch])
        return false;
      stack.pop();
    }
  }
  return stack.length === 0;
}
```

---
