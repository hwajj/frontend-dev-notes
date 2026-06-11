//T에서 K 프로퍼티만 선택해 새로운 오브젝트 타입을 만드는 내장 제네릭 Pick<T, K>을 이를 사용하지 않고 구현하세요.
//맵드타입 문법.

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyPick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};

type MyPick<T, K extends keyof T> = {
  [key in K]: T[key];
};

//--------------------

//1. keyof : 키들을 유니언 타입으로 가져옴
interface userInfo {
  name: string;
  age: number;
}
type keyofValue = keyof userInfo;
// keyofValue는 "name" | "age"가 된다.

//2. extends: 타입 제한
//K extends keyof T:  K가 그 키들의 부분집합이어야 한다는 조건(제약)
// => 검사조건일 뿐 값은 아님


//3 . in: 유니언 타입을 순회
//in은 유니언 타입의 값을 순회하면서 배열 또는 객체를 생성할 때 주로 사용한다.
//  주의: interface 안에서 in을 직접 사용하면 에러가 발생하므로 사용하지 말 것.
type name = "firstname" | "lastname";
type TName = {
  [key in name]: string;
};



// 실제 개발에서의 예시:

/*

아래 코드처럼 작성하면 TypeScript의 이점을 잃게 된다.
반환값의 타입을 정확히 알 수 없다.
key에 대한 타입 제약이 없다.


*/
// function getValue(o: object, key: string) {
//   return o[key]
// }

//개선된 버전
function getValue<T extends Object, K extends keyof T>(o: T, key: K): T[K] {
  return o[key];
}
// 예시:

const obj1 = { name: "Jane", age: 18 };
const value = getValue(obj1, "name");
// 'name'은 obj1에 실제 존재하는 키이므로 타입이 정확히 추론되고,
// 존재하지 않는 키를 넣으면 에러가 발생한다.

export {}; // 아무것도 안 내보내도 됨 → 모듈 스코프 됨
