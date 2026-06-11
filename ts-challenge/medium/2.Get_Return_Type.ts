//내장 제네릭 ReturnType<T>을 이를 사용하지 않고 구현하세요.

const fn = (v: boolean) => {
  if (v) return 1;
  else return 2;
};

type a = MyReturnType<typeof fn>; // should be "1 | 2"

type MyReturnType<T extends (...args: any[]) => any> = //
  T extends (...args: any[]) => infer R ? R : never;
/**
ex.
type A = MyReturnType<string> // → never
이건 "string은 함수가 아니니까 return type을 추론할 수 없다"는 뜻이 되고,
never는 의도적으로 오류에 가까운 결과를 줘서 타입 검사에서 실수 방지에 유리함
 **/
export {};
