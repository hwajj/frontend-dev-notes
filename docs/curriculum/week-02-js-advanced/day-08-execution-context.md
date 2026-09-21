# Day 8: Execution Context

## 키워드

- Execution Context
- Global Execution Context
- Function Execution Context
- Call Stack
- Lexical Environment
- Variable Environment
- Environment Record
- Outer Environment Reference
- `this` Binding
- Execution Context 생성 → 실행 과정

## 질문 예시

### 1. Execution Context란?

JavaScript 코드가 실행되기 위해 필요한
환경 정보를 관리하는 실행 단위.

JavaScript는 코드를 실행할 때
Execution Context를 생성하고,
이를 Call Stack에서 관리한다.

---

### 2. Execution Context의 종류

대표적으로:

- Global Execution Context
- Function Execution Context
- Eval Execution Context

실무 면접에서는 주로
Global / Function Execution Context를 이해하면 된다.

---

### 3. Call Stack과 Execution Context

함수가 호출되면 Function Execution Context가 생성되어
Call Stack에 쌓인다.

```text
┌──────────────────────┐
│ inner() Context      │ ← 현재 실행
├──────────────────────┤
│ outer() Context      │
├──────────────────────┤
│ Global Context       │
└──────────────────────┘
```

````

함수 실행이 끝나면 해당 Context가 Stack에서 제거된다.

---

### 4. Execution Context 생성 과정

실행 컨텍스트는 크게

```text
생성 단계
 ↓
실행 단계
```

로 나누어 생각할 수 있다.

#### 생성 단계

실행에 필요한 환경을 설정한다.

- 변수/함수 선언 정보 등록
- Lexical Environment 구성
- Outer Environment Reference 설정
- `this` 결정

#### 실행 단계

코드를 위에서부터 실제로 실행한다.

```js
const name = "Kim";

function hello() {
  console.log(name);
}

hello();
```

대략적인 흐름:

```text
Global Context 생성
 ↓
Global Context 실행
 ↓
hello() 호출
 ↓
Function Context 생성
 ↓
hello() 실행
 ↓
Function Context 제거
```

---

### 5. Lexical Environment

변수와 함수 등의 식별자를
어떤 값과 연결할지 관리하는 환경.

또한 상위 Lexical Environment를 참조하기 때문에
스코프 체인을 구성할 수 있다.

```text
inner Lexical Environment
        ↓
outer Lexical Environment
        ↓
Global Lexical Environment
```

---

### 6. 호이스팅과 Execution Context

호이스팅을 단순히

> "변수가 위로 올라간다"

라고 이해하면 안 된다.

Execution Context가 생성되는 과정에서
선언이 먼저 처리되기 때문에
코드 실행 시점에 특정 식별자를 참조할 수 있는 것이다.

```js
console.log(a);

var a = 10;
```

`var`는 생성 단계에서 선언이 처리되고
초기값으로 `undefined`가 설정되기 때문에:

```text
a → undefined
```

상태에서 `console.log(a)`가 실행된다.

반면 `let`, `const`는 선언은 처리되지만
초기화되기 전까지 TDZ에 있기 때문에 접근할 수 없다.

---

## 실행 흐름 예제

```js
const x = 10;

function outer() {
  const y = 20;

  function inner() {
    const z = 30;
    console.log(x + y + z);
  }

  inner();
}

outer();
```

실행 흐름:

```text
Global Context 생성
 ↓
Global Context 실행
 ↓
outer() 호출
 ↓
outer Function Context 생성
 ↓
outer 실행
 ↓
inner() 호출
 ↓
inner Function Context 생성
 ↓
inner 실행
 ↓
inner Context 제거
 ↓
outer Context 제거
```

각 Context는 자신의 Lexical Environment를 가지고
상위 환경을 참조한다.

따라서 `inner`에서

```text
z → inner
y → outer
x → global
```

순서로 식별자를 찾을 수 있다.

---

## 면접 질문

- Execution Context란 무엇인가요?
- Execution Context와 Call Stack은 어떤 관계인가요?
- Execution Context는 언제 생성되나요?
- Global Execution Context와 Function Execution Context의 차이는?
- Execution Context 생성 단계에서는 어떤 일이 일어나나요?
- Lexical Environment란 무엇인가요?
- Execution Context와 Scope는 어떤 관계가 있나요?
- 호이스팅은 Execution Context와 어떤 관련이 있나요?
- `var`와 `let`의 초기화 시점이 다른 이유는 무엇인가요?
- 함수가 호출될 때 Call Stack에서는 어떤 일이 일어나나요?

## 목표

- Execution Context를 자신의 말로 설명할 수 있다.
- Global / Function Execution Context를 구분할 수 있다.
- Execution Context와 Call Stack의 관계를 설명할 수 있다.
- 함수 호출 시 새로운 Execution Context가 생성되는 과정을 설명할 수 있다.
- 생성 단계와 실행 단계를 구분할 수 있다.
- Lexical Environment가 무엇인지 설명할 수 있다.
- 호이스팅을 Execution Context 관점에서 설명할 수 있다.
- 코드가 실행될 때 **어떤 Context가 Stack에 쌓이고 제거되는지** 추적할 수 있다.

````

### Day 8에서 딱 하나 제대로 잡는다면

**`Execution Context → Lexical Environment → Call Stack`의 관계**를 잡는 게 핵심입니다.

그리고 다음 순서는 이렇게 가는 게 좋습니다.

```text
Day 8  Execution Context
   ↓
Day 9  Scope / Scope Chain
   ↓
Day 10 Closure
   ↓
Day 11 Hoisting / var / let / const / TDZ
   ↓
Day 12 this
   ↓
Day 13 함수 / Prototype
   ↓
Day 14 Event Loop
```

특히 **호이스팅을 Day 8에서 너무 깊게 파지 않는 것**을 권합니다. Day 8에서는 "Execution Context가 생성될 때 선언 정보가 처리된다" 정도만 잡고, `var/let/const/TDZ`의 세부 동작은 Day 11에서 코드로 털어버리는 편이 훨씬 깔끔합니다.
