//배열(튜플)을 받아, 각 원소의 값을 key/value로 갖는 오브젝트 타입을 반환하는 타입을 구현하세요.

const tuple = ["tesla", "model 3", "model X", "model Y"] as const;

type result = TupleToObject<typeof tuple>; // expected { 'tesla': 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}

/*

T[number]는 T 튜플의 **값들(value)**을 유니언 타입으로 추출함.

  이걸 기반으로 mappedType을 만들 수 있음


  */

type TupleToObject<T extends readonly string[]> = {
  [P in T[number]]: P;
};
