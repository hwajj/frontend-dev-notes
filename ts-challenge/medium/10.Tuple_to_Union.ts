//튜플 값으로 유니온 타입을 생성하는 제네릭 TupleToUnion<T>를 구현하세요.

/* _____________ 여기에 코드 입력 _____________ */

import { Equal, Expect } from "../utils";

type TupleToUnion<T extends (number | string | boolean)[]> = T[number];
// export type TupleToUnion<T> = T extends Array<infer ITEMS> ? ITEMS : never
/* _____________ 테스트 케이스 _____________ */
type cases = [
  Expect<Equal<TupleToUnion<[123, "456", true]>, 123 | "456" | true>>,
  // Expect<Equal<TupleToUnion<[123, "456", true]>, 123 | "456">>, // 일부러 틀림
  Expect<Equal<TupleToUnion<[123]>, 123>>,
];
