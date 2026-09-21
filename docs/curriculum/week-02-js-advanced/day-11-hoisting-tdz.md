Day 11은 **Hoisting을 “선언이 위로 올라간다”가 아니라, 실행 컨텍스트 생성 과정에서 선언이 어떻게 처리되는지**로 정리하는 게 중요합니다. TDZ까지 `var / let / const`와 묶어서 코드로 판단할 수 있게 만들면 됩니다.

````markdown
# Day 11: Hoisting / TDZ

## 키워드

- Hoisting
- Declaration
- Initialization
- `var`
- `let`
- `const`
- TDZ (Temporal Dead Zone)
- Function Declaration
- Function Expression

## 질문 예시

### 1. Hoisting이란?

JavaScript에서 코드가 실행되기 전에
변수와 함수의 **선언이 해당 스코프에 등록되는 동작**을 말한다.

흔히

> "변수가 코드 위로 끌어올려진다."

라고 설명하지만 실제로 코드가 물리적으로 이동하는 것은 아니다.

Execution Context가 생성되는 과정에서
선언에 대한 처리가 먼저 이루어진다고 이해하는 것이 정확하다.

---

### 2. `var`의 Hoisting

```js
console.log(a); // undefined

var a = 10;
```
````

개념적으로 다음과 비슷하게 이해할 수 있다.

```js
var a;

console.log(a); // undefined

a = 10;
```

`var`는 선언과 함께 `undefined`로 초기화되기 때문에
선언 전에 접근하면 `undefined`가 나온다.

---

### 3. `let` / `const`의 Hoisting

`let`과 `const`도 Hoisting된다.

하지만 선언 이후 초기화되기 전까지
**TDZ(Temporal Dead Zone)**에 있기 때문에
접근할 수 없다.

```js
console.log(a); // ReferenceError

let a = 10;
```

따라서

> "`let`, `const`는 Hoisting되지 않는다."

는 잘못된 설명이다.

정확하게는:

> `let`, `const`도 선언은 처리되지만 초기화되기 전까지 TDZ에 있기 때문에 접근할 수 없다.

---

## `var` vs `let` vs `const`

|         | 선언     | 초기화               | 재할당 | 선언 전 접근   |
| ------- | -------- | -------------------- | ------ | -------------- |
| `var`   | Hoisting | `undefined`로 초기화 | 가능   | `undefined`    |
| `let`   | Hoisting | 선언문 도달 시       | 가능   | ReferenceError |
| `const` | Hoisting | 선언문 도달 시       | 불가능 | ReferenceError |

핵심 차이:

```text
var
선언 → 초기화(undefined) → 실행

let / const
선언 → TDZ → 초기화 → 실행
```

---

# TDZ

## TDZ란?

변수가 선언된 스코프에 존재하지만
**초기화되기 전까지 접근할 수 없는 구간**.

```js
console.log(name); // ReferenceError

let name = "Kim";
```

개념적으로:

```text
let name;

┌───────────────────────┐
│         TDZ           │
│   name에 접근 불가    │
└───────────────────────┘

name = "Kim";
↓
초기화 완료
↓
name 사용 가능
```

---

## TDZ가 존재하는 이유

`let`과 `const`를 선언 전에 사용하는 것을 방지하고
변수를 선언된 위치 이후에 사용하도록 유도한다.

특히 `const`는 선언과 동시에 초기화해야 하기 때문에
TDZ의 개념을 이해하는 것이 중요하다.

---

# 함수 Hoisting

## Function Declaration

함수 선언문은 선언 전에 호출할 수 있다.

```js
hello();

function hello() {
  console.log("hello");
}
```

함수 자체가 사용할 수 있는 상태로
처리되기 때문이다.

---

## Function Expression

함수 표현식은 변수에 함수를 할당하는 방식이다.

```js
hello();

const hello = function () {
  console.log("hello");
};
```

`hello`가 `const`로 선언되어 있기 때문에
초기화 전에 접근하면 ReferenceError가 발생한다.

---

## `var` + Function Expression

```js
hello();

var hello = function () {
  console.log("hello");
};
```

이 경우에는:

```text
var hello → undefined
```

상태에서 `hello()`를 호출하게 되므로

```text
TypeError: hello is not a function
```

이 발생한다.

즉, 다음 세 가지를 구분해야 한다.

```text
Function Declaration
→ 선언 전에 호출 가능

const Function Expression
→ 선언 전에 접근하면 ReferenceError

var Function Expression
→ 선언 전에 접근하면 undefined
→ 호출하면 TypeError
```

---

# Hoisting 코드 문제

## 문제 1

```js
console.log(a);

var a = 10;
```

결과:

```text
undefined
```

---

## 문제 2

```js
console.log(a);

let a = 10;
```

결과:

```text
ReferenceError
```

---

## 문제 3

```js
hello();

function hello() {
  console.log("hello");
}
```

결과:

```text
hello
```

---

## 문제 4

```js
hello();

const hello = function () {
  console.log("hello");
};
```

결과:

```text
ReferenceError
```

---

## 문제 5

```js
hello();

var hello = function () {
  console.log("hello");
};
```

결과:

```text
TypeError
```

---

# 면접에서 자주 나오는 함정

### Q. `let`과 `const`는 Hoisting되지 않죠?

잘못된 답:

> 네. `let`과 `const`는 Hoisting되지 않습니다.

좋은 답:

> `let`과 `const`도 선언 자체는 Hoisting되지만,
> 초기화되기 전까지 TDZ에 있기 때문에 접근할 수 없습니다.

---

### Q. Hoisting 때문에 변수가 위로 올라가는 건가요?

정확하게는 아니다.

코드가 실제로 이동하는 것이 아니라
**Execution Context가 생성될 때 선언이 처리되는 것**으로 이해하는 것이 좋다.

---

### Q. `var`는 왜 선언 전에 `undefined`가 나오나요?

`var`는 실행 전에 선언이 처리되고
초기화 단계에서 `undefined`가 할당되기 때문이다.

---

### Q. `let`과 `const`는 왜 ReferenceError가 발생하나요?

선언은 되어 있지만
초기화되기 전까지 TDZ에 있기 때문이다.

---

## 면접 질문

- Hoisting이 무엇인가요?
- `var` / `let` / `const`는 각각 어떻게 Hoisting되나요?
- `let`과 `const`도 Hoisting되나요?
- TDZ란 무엇인가요?
- `var`는 선언 전에 접근할 수 있는데 `let`은 왜 안 되나요?
- Hoisting과 Execution Context는 어떤 관계가 있나요?
- 함수 선언문은 왜 선언 전에 호출할 수 있나요?
- 함수 선언문과 함수 표현식의 Hoisting 차이는 무엇인가요?
- 다음 코드의 결과를 설명해주세요.

```js
console.log(a);
var a = 10;
```

- 다음 코드의 결과를 설명해주세요.

```js
console.log(a);
let a = 10;
```

- 다음 두 코드의 에러 차이를 설명해주세요.

```js
hello();

var hello = function () {};
```

```js
hello();

const hello = function () {};
```

## 목표

- Hoisting을 "변수가 위로 올라간다"가 아닌 실행 컨텍스트 관점에서 설명할 수 있다.
- `var`, `let`, `const`의 선언과 초기화 차이를 설명할 수 있다.
- TDZ가 무엇인지 설명할 수 있다.
- `let`과 `const`도 Hoisting된다는 것을 설명할 수 있다.
- Function Declaration과 Function Expression의 Hoisting 차이를 설명할 수 있다.
- `undefined`, `ReferenceError`, `TypeError`가 발생하는 상황을 구분할 수 있다.
- 코드를 보고 **실행 전에 어떤 상태가 만들어지는지** 추적할 수 있다.

````

### Day 8~11의 연결

지금까지 배운 걸 하나의 흐름으로 보면 꽤 깔끔합니다.

```text
Day 8
Execution Context
        ↓
"코드를 실행하기 위한 환경을 만든다"

Day 9
Lexical Environment
        ↓
"변수와 상위 환경을 관리한다"

Day 10
Scope Chain / Closure
        ↓
"변수를 현재 → 상위 스코프로 탐색한다"
"함수가 외부 환경을 계속 참조할 수 있다"

Day 11
Hoisting / TDZ
        ↓
"실행 전에 선언은 어떻게 처리되는가?"
"왜 var는 undefined인데 let은 ReferenceError인가?"
````

**Day 11의 핵심은 `undefined` / `ReferenceError` / `TypeError` 세 개를 코드만 보고 구분하는 것**입니다. 이걸 할 수 있으면 Hoisting/TDZ는 면접에서 상당히 안정적으로 설명할 수 있습니다.
