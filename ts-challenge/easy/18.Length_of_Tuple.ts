//배열(튜플)을 받아 길이를 반환하는 제네릭 Length<T>를 구현하세요.

type tesla = ["tesla", "model 3", "model X", "model Y"];
type spaceX = [
  "FALCON 9",
  "FALCON HEAVY",
  "DRAGON",
  "STARSHIP",
  "HUMAN SPACEFLIGHT",
];

type teslaLength = Length<tesla>; // expected 4
type spaceXLength = Length<spaceX>; // expected 5

//type Length<T extends readonly any[]> = number;
//항상 number라는 일반 타입이 된다.

type Length<T extends string[]> = T["length"];
//이건 T가 고정된 튜플일 경우, 정확한 숫자 리터럴 타입을 추론할 수 있다.

/**
 *  배열(튜플) 타입도 “객체 타입”이다
 * type MyTuple = ["a", "b", "c"];
 *
 * 이 타입은 내부적으로 이렇게 생긴 객체 타입으로 인식된다.
 *
 * type MyTuple = {
 *   0: "a";
 *   1: "b";
 *   2: "c";
 *   length: 3;        //  여기 length 속성이 있음!
 *   // + 기타 배열 메서드들 (push, pop 등)
 * }
 */
