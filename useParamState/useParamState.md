
```text
export const useParamState = <V extends Record<string, unknown>>(configs: ParamConfigs<V>) => 

```

- V는 "파라미터 이름과 타입을 명확히 지정한 객체 타입"
  type ParamConfigs<V> = {
  [K in keyof V]: ParamConfig<V[K]>;
  }


