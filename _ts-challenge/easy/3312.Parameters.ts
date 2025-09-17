//내장 제네릭 Parameters<T>를 이를 사용하지 않고 구현하세요.

//foo는 함수
const foo = (arg1: string, arg2: number): void => {};

//어떤 함수 타입 T가 있을 때, 그 함수의 매개변수 타입들을 튜플 형태로 추출함
type FunctionParamsType = MyParameters<typeof foo>; // [arg1: string, arg2: number]

type MyParameters<T extends (...args: any[]) => any> = //T는 함수
  T extends (...any: infer S) => any //매개 변수 타입 추출 S
    ? S //추출에 성공하면 S
    : any; //실패하면 any

export {};

/**
 1. T extends (...args: any[]) => any
 T는 반드시 함수 타입이어야 한다는 제약
 이 함수는 어떤 매개변수(...args)를 받고, 어떤 값을 반환해도 괜찮음

 2. T extends (...args: infer S) => any
 조건부 타입 + infer 키워드
 T가 실제로 함수라면, 매개변수 부분 (...args)에서 타입을 추론하여 S에 담음
 ex)
   T = (x: string, y: number) => void
   → infer S = [x: string, y: number]

 3. ? S : any
 추론에 성공했으면 S를 반환

 실패하면 any 반환 (원래 내장 타입은 never를 씀)


 *
 *
 */
