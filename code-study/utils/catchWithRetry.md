try {
const res = await fetch("/api");
return res.json();
} catch (e) {
console.error(e);
return null;
}

=> 이걸 1줄로 편하게 쓰자

const [error, result] = await catchWithRetry(() => fetch("/api"));

```


export const catchWithRetry = async <T, E=unknown>(
  fn: (error? : E) => Awaitable<T>,//
  retryCount = 0
)=> {

  let retry = 0;
  let response: T | null = null
  let error : E | null = null


  if (retryCount < 0 || retryCount > 5) {
    throw new Error('retryCount must be between 0 and 5.');
  }

  while (retry <= retryCount) {
    try {
      response = await fn(error ?? undefined); // 함수 실행
      error = null; // 성공했으므로 error 초기화
      break;        // 성공했으니 루프 종료
    } catch (err) {
      error = err as E; // 실패한 에러 저장
      retry++;          // 재시도 횟수 증가
    }
  }

  return [error, response] as TryCatchReturn<T, E>;


}
```

질문:
fn: (error? : E) => Awaitable<T> 타입이 어렵다!

답
(error? : E) : 에러를 받을수도있고 안받을수도 있음
Awaitable<T> : 비동기,동기 모두 지원
=> 즉, 에러를 선택적으로 받고, 결과 T 또는 Promise<T>를 반환하는 함수
아래 fn1,fn2,fn3 모두 받을수있음.

```
// 동기 함수
const fn1 = () => 123;

// 비동기 함수
const fn2 = async () => {
  const res = await fetch("/api");
  return res.json();
};

// 에러를 받아서 처리하는 함수
const fn3 = (err?: Error) => {
  if (err) console.log("이전 에러:", err);
  return "재시도 결과";
};
```
