# 이벤트 루프

콜 스택, 태스크 큐, 마이크로태스크 큐의 실행 순서를 설명할 수 있어야 한다.

브라우저 JavaScript 기준으로 **실행 순서만 정확하게** 잡으면 이거야.

```text
1. Call Stack에서 현재 JavaScript 실행
          ↓
2. Call Stack이 비면
          ↓
3. Microtask Queue 확인
          ↓
4. Microtask를 전부 실행
          ↓
5. Task Queue에서 Task 하나 실행
          ↓
6. 다시 Microtask Queue 확인
          ↓
7. Microtask를 전부 실행
          ↓
8. 다시 Task 하나 실행
          ↓
      반복
```

핵심은 **Task와 Microtask를 번갈아 하나씩 처리하는 게 아니라는 것**이야.

- **Call Stack**: 지금 당장 실행 중인 코드
- **Microtask Queue**: `Promise.then()`, `queueMicrotask()` 등
- **Task Queue**: `setTimeout`, DOM 이벤트 등
- **Event Loop**: Stack이 비었을 때 **Microtask를 먼저 전부 비운 다음 Task 하나를 실행**하도록 조정

예를 들어:

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");
```

실행 순서는: 1 4 3 2
Call Stack → 1 → 4 → Stack 비었음 → Microtask Queue → 3 → Task Queue → 2

한 문장으로 외우면:

> **Call Stack에서 현재 코드를 실행하고, Stack이 비면 Microtask를 전부 처리한 후 Task를 하나 처리하고, 다시 Microtask를 전부 처리하는 과정을 반복한다.**

- 브라우저의 Event Loop는 Call Stack이 비었을 때 Microtask Queue를 먼저 확인해 Microtask를 전부 처리한 뒤, Task Queue에서 Task를 하나 처리하고 다시 Microtask를 전부 처리하는 과정을 반복한다. 비동기 작업은 Web API(호스트 환경)에서 처리되며, 작업이 완료되면 종류에 따라 Microtask Queue 또는 Task Queue에 들어간다.
