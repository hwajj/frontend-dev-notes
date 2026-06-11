// ?Promise와 같은 타입에 감싸인 타입이 있을 때, 안에 감싸인 타입이 무엇인지 어떻게 알 수 있을까요?
//
//   예시: 들어 Promise<ExampleType>이 있을 때, ExampleType을 어떻게 얻을 수 있을까요?
export {};

/*

1. T extends PromiseLike<any>
이 타입은 Promise 또는 then() 메서드를 가진 유사 Promise 객체만 허용합니다.

  즉, MyAwaited에 Promise<number>나 Promise<Promise<string>> 같은 타입만 들어올 수 있습니다.

2. T extends PromiseLike<infer U> 의 의미
infer U는 PromiseLike<U>에서 U 값을 추론합니다.

  예: Promise<string>이면 U = string,
Promise<Promise<number>>이면 U = Promise<number>

3. U extends PromiseLike<any> ? MyAwaited<U> : U
여기서 핵심은 재귀입니다.

  만약 U도 여전히 PromiseLike라면, 또 다시 MyAwaited<U>를 호출해서 더 깊이 들어갑니다.

  그렇지 않으면 U는 더 이상 Promise가 아닌 실제 값이므로 반환합니다.*/

type ExampleType = Promise<string>;

type Result = MyAwaited<ExampleType>; // string

type MyAwaited<T extends PromiseLike<any>> = T extends PromiseLike<infer U>
  ? U extends PromiseLike<any>
    ? MyAwaited<U>
    : U
  : never;
