//Array.unshift의 타입 버전을 구현하세요.
//Unshift = 배열의 맨 앞에 요소를 추가하는 동작

type Result = Unshift<[1, 2], 0>; // [0, 1, 2]

type Unshift<T extends unknown[], U> = [U, ...T];

export {};
