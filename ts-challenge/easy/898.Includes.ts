/*JavaScript의 Array.includes 함수를 타입 시스템에서 구현하세요.
타입은 두 인수를 받고, true 또는 false를 반환해야 합니다.

  예시:*/

type isPillarMen = Includes<["Kars", "Esidisi", "Wamuu", "Santana"], "Dio">; // expected to be `false`

/*

type Includes<T extends readonly any[], U> = {
  [P in T[number]]: true
}[U] extends true ? true : false;

“배열 T의 요소들을 key로 갖고, 전부 true 값을 가진 객체를 만든 뒤,
거기서 U라는 key를 조회해서 값이 true인지 확인하는 방식”

type Includes<T extends readonly any[], U> = {
  [P in T[number]]: '✅ yes'
}[U] extends '✅ yes' ? true : false;

따라서 객체의 키로 들어올수 있는 string | number | symbol 만 확인가능

*/

type IsEqual<T, U> =
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
    ? true
    : false;
//→ 즉, 모든 G에 대해 G extends T == G extends U여야 함

/*
모든 여자가 자궁이있고
모든 여자가 여성호르몬이 나온다고해서
자궁=여성호르몬인건 아니잖아

"자궁 있는지, 여성호르몬 있는지 판단하는 함수의 반환 결과가 항상 같다면
→ 그 두 함수는 같은 역할을 한다고 간주할 수 있다"

G extends T ? 1 : 2 같은 표현 → 타입 조건을 평가해서 결과를 반환하는 함수 타입
→ 이건 “타입의 행동” 또는 “타입 관계의 판별 결과”를 표현하는 것


<G>() => G extends T ? 1 : 2
어떤 타입 G가 들어오면, 그 G가 T를 만족하면 1, 아니면 2를 반환하는 함수

<G>() => G extends U ? 1 : 2
어떤 타입 G가 들어오면, 그 G가 U를 만족하면 1, 아니면 2를 반환하는 함수

=> 이 두 함수 타입이 같다는 건:
모든 G에 대해 G extends T와 G extends U의 결과가 완전히 같다는 뜻

*/

type Includes<Value extends any[], Item> =
  IsEqual<Value[0], Item> extends true
    ? true
    : Value extends [Value[0], ...infer rest]
      ? Includes<rest, Item>
      : false;
