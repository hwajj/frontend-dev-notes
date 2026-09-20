# Day 9: Lexical Environment

## 키워드

- Lexical Environment
- Environment Record
- Outer Environment Reference
- Identifier Resolution
- Scope
- Scope Chain
- 정적 스코프 (Lexical Scope)

## 질문 예시

### 1. Lexical Environment란?

현재 코드의 식별자와 값을 연결하고,
상위 Lexical Environment를 참조하는 환경.

쉽게 말하면:

> "현재 스코프에서 어떤 변수를 가지고 있고,
> 현재 스코프에 없는 변수를 어디에서 찾을지 관리하는 구조"

```text
현재 Lexical Environment
 ├─ localVar
 ├─ anotherVar
 └─ Outer Environment Reference
                    ↓
          상위 Lexical Environment
                    ↓
          Global Lexical Environment
```

---

### 2. Lexical Environment의 구성

주요하게 이해할 것은 두 가지.

#### Environment Record

현재 환경의 식별자와 값을 관리한다.

```text
Environment Record

x → 10
name → "Kim"
foo → function
```

#### Outer Environment Reference

현재 환경에서 찾지 못한 식별자를
어디에서 계속 찾아볼지 가리킨다.

```text
inner
  ↓
outer
  ↓
global
```

---

### 3. 변수 탐색 과정

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
```

`inner`에서 `x`를 찾는다면:

```text
inner Environment
 ↓ x 없음
outer Environment
 ↓ x 없음
Global Environment
 ↓
x = 10 발견
```

즉, 현재 환경에서 식별자를 찾지 못하면
Outer Environment Reference를 따라 상위 환경으로 이동한다.

---

### 4. Lexical Scope

JavaScript는 **코드가 작성된 위치**를 기준으로
변수의 스코프가 결정되는 정적 스코프 언어다.

```js
const x = "global";

function outer() {
  const x = "outer";

  function inner() {
    console.log(x);
  }

  inner();
}
```

`inner`에서 참조하는 `x`는
`inner`가 선언된 위치를 기준으로 결정된다.

```text
inner
 ↓
outer의 Lexical Environment
 ↓
x = "outer"
```

---

### 5. 동적 스코프와의 차이

JavaScript는 함수가 **어디에서 호출됐는지**가 아니라
**어디에서 선언됐는지**를 기준으로 변수 탐색 범위를 결정한다.

```js
const x = "global";

function foo() {
  console.log(x);
}

function bar() {
  const x = "bar";
  foo();
}

bar();
```

결과:

```text
global
```

`foo()`가 `bar()` 안에서 호출됐더라도
`foo`가 선언된 위치의 스코프를 따라가기 때문이다.

---

### 6. Scope Chain과의 관계

Lexical Environment가 연결되어 있는 구조를
변수 탐색 관점에서 보면 Scope Chain으로 이해할 수 있다.

```text
inner
 ↓
outer
 ↓
global
```

현재 환경에서 변수를 찾지 못하면
상위 환경을 계속 탐색한다.

---

### 7. Execution Context와의 관계

Day 8에서 배운 Execution Context와 연결해서 이해한다.

```text
Execution Context
       │
       ├── Lexical Environment
       │      ├── Environment Record
       │      └── Outer Environment Reference
       │
       └── this 관련 정보 등
```

Execution Context는 **코드가 실행되는 데 필요한 실행 환경 전체**를 관리하고,

Lexical Environment는 그 안에서
**식별자와 스코프 관계를 관리하는 핵심 구조**라고 이해하면 된다.

---

### 8. Lexical Environment와 Closure

Lexical Environment는 이후 Closure를 이해하기 위한 핵심 개념이다.

```js
function counter() {
  let count = 0;

  return function () {
    return ++count;
  };
}

const increase = counter();
```

`counter()` 실행이 끝난 후에도
반환된 함수가 `count`에 접근할 수 있는 이유는

```text
increase
   ↓
counter의 Lexical Environment
   ↓
count = 0
```

와 같은 참조 관계가 유지되기 때문이다.

즉,

> Closure를 이해하려면 Lexical Environment를 이해해야 한다.

---

## 면접 질문

- Lexical Environment란 무엇인가요?
- Lexical Environment는 어떤 정보를 가지고 있나요?
- Environment Record란 무엇인가요?
- Outer Environment Reference는 무엇인가요?
- JavaScript의 Scope Chain은 어떻게 만들어지나요?
- JavaScript가 정적 스코프를 사용하는 이유는 무엇인가요?
- 변수는 어떤 순서로 탐색되나요?
- 함수가 다른 함수 내부에서 호출되면 변수 탐색은 어떻게 이루어지나요?
- Execution Context와 Lexical Environment의 관계는 무엇인가요?
- Lexical Environment가 Closure와 어떤 관련이 있나요?

## 목표

- Lexical Environment를 자신의 말로 설명할 수 있다.
- Environment Record와 Outer Environment Reference의 역할을 설명할 수 있다.
- 현재 스코프에서 변수를 찾는 과정을 추적할 수 있다.
- JavaScript가 Lexical Scope를 사용하는 것을 설명할 수 있다.
- Lexical Environment와 Scope Chain의 관계를 설명할 수 있다.
- Execution Context와 Lexical Environment의 관계를 설명할 수 있다.
- Closure가 Lexical Environment와 어떤 관련이 있는지 설명할 수 있다.
- 코드만 보고 **변수가 어느 스코프에서 찾아지는지** 추적할 수 있다.

````

### Day 8 → Day 9의 연결

이 둘은 이렇게 기억하면 됩니다.

```text
Execution Context
"지금 이 코드를 실행하기 위한 환경은?"

        ↓

Lexical Environment
"이 환경에 어떤 변수가 있고,
못 찾으면 어디로 가야 하지?"

        ↓

Scope Chain
"현재 → 바깥 → 더 바깥 → 전역으로 탐색"

        ↓

Closure
"그 바깥 환경을 함수가 계속 기억할 수 있네?"
````

**Day 9에서 `Environment Record`의 세부 스펙까지 파고들 필요는 없습니다.** 면접 대비라면 `Environment Record + Outer Environment Reference + Lexical Scope + 변수 탐색` 네 개를 코드로 설명할 수 있는 수준이면 충분합니다.
