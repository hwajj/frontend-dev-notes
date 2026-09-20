Day 10은 **Scope Chain과 Closure를 하나로 묶는 게 좋습니다.** Day 9에서 Lexical Environment를 배웠으니, 여기서는 그 연결이 실제 코드에서 어떻게 동작하는지를 잡으면 됩니다.

````markdown id="64183"
# Day 10: Scope Chain / Closure

## 키워드

- Scope
- Lexical Scope
- Scope Chain
- Variable Lookup
- Closure
- 자유 변수 (Free Variable)
- 실행 컨텍스트와 Closure
- Garbage Collection과 Closure

## 질문 예시

### 1. Scope란?

변수에 접근할 수 있는 범위를 의미한다.

JavaScript는 **Lexical Scope(정적 스코프)**를 사용한다.

즉, 함수가 어디에서 호출됐는지가 아니라
**어디에서 선언됐는지**를 기준으로 스코프가 결정된다.

---

### 2. Scope Chain이란?

현재 스코프에서 변수를 찾지 못했을 때
상위 스코프를 순서대로 탐색하는 구조.

```js
const global = "global";

function outer() {
  const outerValue = "outer";

  function inner() {
    const innerValue = "inner";

    console.log(innerValue);
    console.log(outerValue);
    console.log(global);
  }

  inner();
}
```
````

변수 탐색:

```text
inner Scope
 ├─ innerValue 발견
 │
 └─ outerValue 없음
       ↓
outer Scope
 ├─ outerValue 발견
 │
 └─ global 없음
       ↓
Global Scope
 └─ global 발견
```

---

### 3. Closure란?

함수가 자신이 선언된 Lexical Environment의
변수를 기억하고 참조할 수 있는 현상.

```js
function counter() {
  let count = 0;

  return function () {
    return ++count;
  };
}

const increase = counter();

increase(); // 1
increase(); // 2
```

`counter()` 실행은 끝났지만
반환된 함수는 `count`를 계속 사용할 수 있다.

```text
increase
   ↓
counter의 Lexical Environment
   ↓
count
```

---

### 4. Closure가 만들어지는 조건

핵심은 두 가지.

1. 내부 함수가 외부 함수의 변수를 참조한다.
2. 내부 함수가 외부 함수의 실행이 끝난 후에도 살아 있다.

```js
function outer() {
  const value = 10;

  return function inner() {
    console.log(value);
  };
}

const fn = outer();

fn();
```

`inner`는 `outer`의 `value`를 참조하고 있고,
`outer()`가 종료된 이후에도 `fn`을 통해 실행될 수 있다.

---

### 5. Closure는 함수가 "변수를 복사해서 저장"하는 것이 아니다

흔히

> "함수가 외부 변수의 값을 기억한다."

라고 표현하지만,
정확하게는 **외부 Lexical Environment에 대한 접근이 유지되는 것**으로 이해하는 것이 좋다.

```js
function outer() {
  let count = 0;

  return {
    increase() {
      count++;
    },

    getCount() {
      return count;
    },
  };
}
```

두 함수는 같은 `count`를 공유한다.

```text
increase ─┐
          ├→ outer Lexical Environment
getCount ─┘
              ↓
          count = 0
```

---

### 6. Closure의 실무 활용

#### 데이터 은닉

외부에서 직접 접근할 수 없는 상태를 만들 수 있다.

```js
function createCounter() {
  let count = 0;

  return {
    increase: () => ++count,
    getCount: () => count,
  };
}
```

```js
const counter = createCounter();

counter.increase();
counter.getCount(); // 1
```

`count`에 직접 접근할 수 없고
제공된 함수로만 변경할 수 있다.

---

#### 함수 팩토리

특정 값을 기억하는 함수를 만들 수 있다.

```js
function multiplyBy(n) {
  return (value) => value * n;
}

const double = multiplyBy(2);
const triple = multiplyBy(3);

double(5); // 10
triple(5); // 15
```

---

#### React와 Closure

React의 이벤트 핸들러와 Effect에서도
Closure를 자주 만나게 된다.

```js
function Component() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log(count);
  };

  // handleClick은 해당 렌더링의 count를 참조
}
```

React에서는 렌더링마다 함수가 새로 만들어지기 때문에
**어떤 렌더링의 값을 Closure가 참조하고 있는지**가 중요하다.

이 개념은 이후 `useEffect`의 dependency와
stale closure 문제로 연결된다.

---

### 7. Closure와 Garbage Collection

Closure가 외부 변수를 참조하고 있다고 해서
해당 변수가 영원히 메모리에 남는 것은 아니다.

더 이상 해당 환경에 접근할 수 있는 참조가 없다면
Garbage Collector가 회수할 수 있다.

```js
let fn = outer();

fn();

fn = null;
```

이후 해당 Closure에 대한 다른 참조가 없다면
관련 환경은 GC 대상이 될 수 있다.

따라서 Closure 자체가 메모리 누수인 것은 아니다.

---

## 면접 질문

- Scope란 무엇인가요?
- JavaScript는 정적 스코프인가요, 동적 스코프인가요?
- Scope Chain은 어떻게 동작하나요?
- 변수를 찾을 때 어떤 순서로 탐색하나요?
- Closure란 무엇인가요?
- Closure가 왜 만들어지나요?
- Closure는 실무에서 어디에 사용하나요?
- Closure를 이용해 데이터를 은닉할 수 있는 이유는 무엇인가요?
- Closure가 메모리 누수를 발생시키나요?
- Closure와 Garbage Collection은 어떤 관계가 있나요?
- React에서 Closure 때문에 발생할 수 있는 문제는 무엇인가요?
- Stale Closure란 무엇인가요?

## 코드 추적

다음 코드를 보고 결과를 설명할 수 있어야 한다.

```js
let x = "global";

function outer() {
  let x = "outer";

  return function inner() {
    console.log(x);
  };
}

const fn = outer();

x = "changed";

fn();
```

결과:

```text
outer
```

이유:

`inner`는 호출된 위치가 아니라
**선언된 위치의 Lexical Scope**를 기준으로
`x`를 찾기 때문이다.

---

## 목표

- Scope와 Scope Chain을 설명할 수 있다.
- Lexical Scope가 무엇인지 설명할 수 있다.
- 변수 탐색 과정을 코드로 추적할 수 있다.
- Closure가 무엇인지 자신의 말로 설명할 수 있다.
- Closure가 외부 Lexical Environment에 접근할 수 있는 이유를 설명할 수 있다.
- Closure의 실무 활용 사례를 설명할 수 있다.
- Closure와 메모리 관리의 관계를 설명할 수 있다.
- React에서 Closure가 어떻게 사용되는지 설명할 수 있다.
- **"이 코드에서 어떤 값을 참조하는가?"를 Closure와 Scope Chain 관점에서 설명할 수 있다.**

````

### Day 8~10을 연결하면

```text
Day 8
Execution Context
"코드를 실행하기 위한 환경"

        ↓

Day 9
Lexical Environment
"변수와 상위 환경을 관리하는 구조"

        ↓

Day 10
Scope Chain
"변수를 못 찾으면 상위 환경으로 탐색"

        ↓

Closure
"그 상위 환경에 계속 접근할 수 있는 함수"
````

여기까지 오면 다음 **Day 11은 `var / let / const + Hoisting + TDZ`**로 가는 게 가장 자연스럽습니다.

그리고 그다음 `this` → Prototype → Event Loop 순으로 가면 JS 실행 모델 파트가 꽤 탄탄하게 연결됩니다.
