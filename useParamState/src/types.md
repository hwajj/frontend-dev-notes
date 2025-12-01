
`type UndefinedToNull<T> = T extends undefined ? null : T;`
    : undefined면 null 반환

`export type RawValue = string | null`
    : string | null 


`export type Decoder<V> = (value: string) => V`
    : string을 받아서 원하는 V 타입으로 반환하는 함수

```ts
export interface ParamConfig<V> {
  value: V
  decoder: Decoder<V>
  validator?: (value: RawValue) => boolean
}
```

```ts
export type ParamConfigs<V extends Record<string, unknown>> = {
  [K in keyof V]: ParamConfig<V[K]>
}
```
- `V extends Record<string, unknown>`
  - V는 `{ [key: string]: any }` 형태의 객체 타입만 받을 수 있다.
- `[K in keyof V]`
  - V의 키 (name, age 등)를 순회하면서 그 키 하나하나(K)에 대해
- `ParamConfig<V[K]>`
  - name → ParamConfig<string>
  - age → ParamConfig<number>
  - 즉, 각 키의 타입을 꺼내서 거기에 대응하는 ParamConfig<T>를 만든다.


export interface ParamConfig<V> {
  value: V
  decoder: Decoder<V>
  validator?: (value: RawValue) => boolean //
}

{
  id :  {
             value: number,
             decoder: Decoder<number>,
        },
  name :  {
    value: number,
    decoder: Decoder<number>,
    validator?: (value: RawValue) => boolean},
  }

}

