//배열(튜플) T를 받아 첫 원소의 타입을 반환하는 제네릭 First<T>를 구현하세요.

type arr1 = ["a", "b", "c"];
type arr2 = [3, 2, 1];

type head1 = First<arr1>; // expected to be 'a'
type head2 = First<arr2>; // expected to be 3

/***
이렇게하면
type First<T extends any[]> = T[0];
문제점
  [] (빈 배열)일 경우에도 T[0]은 undefined가 아니라 any | undefined | unknown 등 정확하지 않은 타입으로 추론될 수 있음

따라서 빈 배열인 경우를 예외 처리하지 못함

예시:

type A = First<[]>; // ❗ any 또는 undefined처럼 나올 수 있음 → 원하지 않는 타입
*/

//answer1 : 빈배열이면 never, 아니면 첫 요소 반환
//type First<T extends any[]> = T extends [] ? never : T[0];

//answer2 : 배열의 길이를 기준으로 길이가 0이면 never

//type First<T extends any[]> = T["length"] extends 0 ? never : T[0];

//answer3 : 배열 구조를 직접 분해해서 첫 번째 요소 추론
type First<T extends any[]> = T extends [infer A, ...infer rest] ? A : never;
/*
배열 구조를 직접 분해해서 첫 번째 요소 추론
가장 강력하고 정밀함
예: 튜플 타입에서 정확히 A만 꺼냄

T가 string[] 같은 일반 배열이면 A는 string으로 추론됨

T가 []이면 never*/
