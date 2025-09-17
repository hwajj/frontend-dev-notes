/**
 * JavaScript의 Array.includes 함수를 타입 시스템에서 구현하세요.
 *
 * 타입은 두 인수를 받고, true 또는 false를 반환해야 합니다.
 *
 * 조건:
 * - 첫 번째 인수는 읽기 전용 배열 또는 튜플 타입입니다.
 * - 두 번째 인수는 배열 내 포함 여부를 확인할 타입입니다.
 * - 결과는 boolean literal 타입(true | false)이어야 합니다.
 *
 * 예시:
 * type HasTwo = Includes<[1, 2, 3], 2>; // true
 */

type HasTwo = Includes<[1, 2, 3], 6>; // false

/*
[잘못된 범용 방식 예시: 객체 키 매핑]
----------------------------------
type Includes<T extends readonly any[], U> = {
  [P in T[number]]: true
}[U] extends true ? true : false;

위 방식의 아이디어:
- 배열 T의 요소들을 key로 갖는 객체를 만들고, 모든 값을 true로 설정
- 그 객체에서 key U를 조회하여 true인지 확인

예:
type Includes<T extends readonly any[], U> = {
  [P in T[number]]: '✅ yes'
}[U] extends '✅ yes' ? true : false;

한계:
- key로 들어올 수 있는 타입(string | number | symbol)만 사용 가능
- U가 객체/배열/함수 타입이면 false가 아니라 "타입 오류" 발생
- T[number]에 key가 될 수 없는 타입이 있으면 전체가 오류
→ 따라서 범용 Includes 구현으로는 적합하지 않음
*/

/* 
[타입 동등성 판정기]
-------------------
이전 단방향 버전:
type IsEqual<T, U> =
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
    ? true
    : false;

이 방식의 문제:
- T가 U의 부분집합이면 true를 반환하지만,
  U가 T의 부분집합인지 여부는 확인하지 않음
예:
type Test = IsEqual<1, number>; // true → 실제로는 동등하지 않음
=>
(<G>() => G extends 1 ? 1 : 2)
 extends
 (<G>() => G extends number ? 1 : 2)
G에 2나 number을 넣으면 두 함수의 결과가 달라짐.


해결책:
- 양방향 비교를 통해 완전 동등성을 판별
*/
type IsEqual<T, U> = (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U
  ? 1
  : 2
  ? (<G>() => G extends U ? 1 : 2) extends <G>() => G extends T ? 1 : 2
    ? true
    : false
  : false;

/*
[Includes 재귀 구현]
-------------------
- 첫 번째 요소를 infer로 분리
- IsEqual로 비교
- 같으면 true, 아니면 나머지 요소로 재귀
*/
type Includes<T extends readonly unknown[], U> = T extends [infer F, ...infer R] //F: 1, R: 2,3,4,5
  ? IsEqual<F, U> extends true //1이랑 3을 비교
    ? true //1과 3이 같으면 true
    : Includes<R, U> //Includes<[2,3,4,5], 3> 재귀
  : false;

/* 테스트 */
type HasThree = Includes<[1, 2, 3, 4, 5], 3>; // true
type HasFour = Includes<[1, 2, 3], 4>; // false
