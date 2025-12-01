//undefined 들어오면 null
type UndefinedToNull<T> = T extends undefined ? null : T;

export type RawValue = string | null;

//문자열을 어떤 값 V로 바꾸는 함수
export type Decoder<V> = (value: string) => V;
/*
const numberDecoder: Decoder<number> = (value: string) => Number(value);
const dateDecoder: Decoder<Date> = (value: string) => new Date(value);
*/

export interface ParamConfig<V> {
  value: V;
}
/**
 * V 타입의 객체의 키들을 순회하면서 ParamConfig 타입의 객체를 생성
 * 예를 들어, { a: 1, b: 2 } 타입의 객체가 있으면, { a: { value: 1 }, b: { value: 2 } } 타입의 객체를 생성
 *
 * 
 */
export type ParamConfigs<V extends Record<string, unknown>> = {
  [K in keyof V]: ParamConfig<V[K]>;
};



