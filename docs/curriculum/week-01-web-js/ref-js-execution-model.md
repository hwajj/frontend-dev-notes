이건 **브라우저 렌더링과 별개로 JS 면접 대비용 참고 챕터**로 두면 좋습니다. 지금 구성에서 면접 포인트가 너무 적어서, 실제 질문으로 이어질 만한 것들을 조금 보강하는 게 좋습니다.

````markdown
# (참고) JS 실행 모델

## 키워드

- 실행 컨텍스트 (Execution Context)
- Call Stack
- Scope / Scope Chain
- Lexical Environment
- Environment Record
- 호이스팅 (Hoisting)
- var / let / const
- TDZ (Temporal Dead Zone)
- this 바인딩
- 함수 선언 vs 함수 표현식
- 클로저 (Closure)

## 질문 예시

### 1. 실행 컨텍스트란?

JavaScript 코드가 실행될 때 필요한 환경 정보를 관리하는 객체.

주요 구성 요소:

- Lexical Environment
- Variable Environment
- `this` 바인딩

실행 컨텍스트는 Call Stack에 쌓이며,
함수 호출이 끝나면 Stack에서 제거됨.

---

### 2. 호이스팅이란?

변수와 함수의 선언이 해당 스코프에서 코드 실행 전에
처리되는 JavaScript의 동작 방식.

단, `var`, `let`, `const`, 함수 선언은 동작 방식이 다름.

```js
console.log(a); // undefined
var a = 10;
```
````

```js
console.log(a); // ReferenceError
let a = 10;
```

`let`과 `const`도 선언 자체는 처리되지만
초기화되기 전까지 TDZ에 있기 때문에 접근할 수 없음.

---

### 3. var / let / const 차이

|        | var  | let    | const  |
| ------ | ---- | ------ | ------ |
| 스코프 | 함수 | 블록   | 블록   |
| 재선언 | 가능 | 불가능 | 불가능 |
| 재할당 | 가능 | 가능   | 불가능 |
| TDZ    | 없음 | 있음   | 있음   |

---

### 4. TDZ란?

`let`과 `const` 변수가 선언된 스코프에 존재하지만
초기화되기 전까지 접근할 수 없는 구간.

```js
console.log(name); // ReferenceError
let name = "Kim";
```

---

### 5. Scope Chain이란?

현재 실행 컨텍스트에서 변수를 찾지 못하면
상위 스코프로 이동하면서 변수를 검색하는 구조.

```js
const name = "Kim";

function outer() {
  function inner() {
    console.log(name);
  }

  inner();
}
```

`inner` → `outer` → 전역 스코프 순으로 변수를 탐색함.

---

### 6. 클로저란?

함수가 자신이 선언된 렉시컬 환경의 변수를
함수 실행이 끝난 이후에도 참조할 수 있는 현상.

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

`counter()` 실행이 끝났음에도
반환된 함수가 `count`를 계속 참조할 수 있음.

---

### 7. this 바인딩

`this`는 **함수가 어떻게 호출되었는지**에 따라 결정됨.

```js
const user = {
  name: "Kim",
  hello() {
    console.log(this.name);
  },
};

user.hello(); // Kim
```

하지만 메서드를 변수에 분리하면 호출 주체가 달라짐.

```js
const hello = user.hello;

hello(); // 일반 함수 호출
```

React에서도 콜백을 전달하거나 메서드를 분리하는 과정에서
`this` 문제가 발생할 수 있음.

---

### 8. 일반 함수 vs 화살표 함수의 this

화살표 함수는 자신의 `this`를 가지지 않고
상위 스코프의 `this`를 사용함.

```js
const user = {
  name: "Kim",

  hello() {
    const inner = () => {
      console.log(this.name);
    };

    inner();
  },
};
```

따라서 `this`를 유지해야 하는 콜백에서
화살표 함수가 유용함.

---

### 9. 함수 선언 vs 함수 표현식

함수 선언문은 선언 전에 호출할 수 있음.

```js
hello();

function hello() {
  console.log("hello");
}
```

함수 표현식은 변수 초기화 이후에 호출해야 함.

```js
hello(); // ReferenceError

const hello = function () {
  console.log("hello");
};
```

---

## 면접 질문

- 실행 컨텍스트가 무엇인가요?
- Call Stack과 실행 컨텍스트는 어떤 관계인가요?
- 호이스팅이 무엇인가요?
- `var`, `let`, `const`의 차이는 무엇인가요?
- TDZ가 무엇인가요?
- `let`과 `const`도 호이스팅되나요?
- Scope Chain이 무엇인가요?
- 클로저를 설명해보세요.
- 클로저를 실무에서 사용해본 경험이 있나요?
- `this`는 어떻게 결정되나요?
- 화살표 함수의 `this`는 일반 함수와 어떻게 다른가요?
- 메서드를 콜백으로 전달했더니 `this`가 깨지는 이유는 무엇인가요?
- 함수 선언문과 함수 표현식의 차이는 무엇인가요?

## 목표

- JS 코드가 실행될 때 어떤 일이 일어나는지 설명할 수 있다.
- `var / let / const`의 동작 차이를 설명할 수 있다.
- TDZ와 호이스팅을 구분해서 설명할 수 있다.
- Scope Chain을 통해 변수 탐색 과정을 설명할 수 있다.
- 클로저가 왜 발생하고 어디에 활용되는지 설명할 수 있다.
- `this`가 호출 방식에 따라 어떻게 달라지는지 설명할 수 있다.
- 함수 선언문과 함수 표현식의 실행 차이를 설명할 수 있다.
- "왜 이 코드가 이렇게 동작하죠?"라는 질문에 실행 순서와 스코프 관점에서 설명할 수 있다.

```

그리고 **이 파트는 깊게 파지 않는 게 좋습니다.**
5년차 프론트 면접에서 JS 실행 모델을 물어보더라도 `Lexical Environment`의 내부 슬롯까지 외우는 것보다,

**호이스팅 → 스코프 → 클로저 → this → 이벤트 루프**

이 다섯 개를 코드 보고 바로 설명할 수 있는 게 훨씬 효율적입니다.

특히 다음 참고 파트는 **:contentReference[oaicite:0]{index=0}**로 이어가는 게 좋습니다. `Promise`, `microtask`, `macrotask`, `async/await`까지 연결하면 JS 면접의 큰 축이 거의 잡힙니다.
```
