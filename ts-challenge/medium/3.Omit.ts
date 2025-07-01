//T에서 K 프로퍼티만 제거해 새로운 오브젝트 타입을 만드는 내장 제네릭 Omit<T, K>를 이를 사용하지 않고 구현하세요.

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyOmit<Todo, "description" | "title">;

const todo: TodoPreview = {
  completed: false,
};

type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

/**
[P in keyof T as P extends K ? never : P]

P in keyof T	원래 타입 T의 모든 키를 순회함
as P extends K ? never : P	만약 P가 제거 대상 키(K)에 포함되면, never로 바꿔서 제외함
  : T[P]	해당 key의 원래 타입을 그대로 유지*/
export {};
