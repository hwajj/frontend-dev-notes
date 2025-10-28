export {}; // 모듈 스코프
// T의 모든 프로퍼티를 읽기 전용(재할당 불가)으로 바꾸는 내장 제네릭 Readonly<T>를 이를 사용하지 않고 구현하세요.

type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

//1. keyof : 키들을 유니언 타입으로 가져옴
//2. in:  유니언 타입으로 온 키를 하나씩 순회 (맵드타입반복)
//3. 모든 프로퍼티를 읽기전용으로 하기때문에 
//기존 객체의 모든 key를 그대로 돌리면 되니까, 부분집합 조건 자체가 필요 없음.

interface Todo {
  title: string;
  description: string;
}

const todo: MyReadonly<Todo> = {
  title: "Hey",
  description: "foobar",
};

//
// todo.title = "Hello";
//
//
// todo.description = "barFoo";


