//Array.push의 제네릭 버전을 구현하세요.
export {};
type Result = Push<[1, 2], "3">; // [1, 2, '3']

type Push<T extends unknown[], U> = [...T, U];
