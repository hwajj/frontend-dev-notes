상황:
어떤 폼 화면이 있고, 입력 필드의 기본값을 아래처럼 정리했다고 하자.

```ts
const formDefaultValues = {
  email: '',
  age: 0,
  agreeToTerms: false,
}
```

목표:
formDefaultValues를 기반으로 FormFieldConfig<T> 타입을 만들어서,
각 필드에 대한 validator/required 설정을 강제하고 싶다.


1. 객체의 각 필드에 대해



```ts
 type FormFieldConfig<T> = {
  [K in keyof T]: {
    required : boolean;
    validate?: (value: T[K]) => boolean
  }
  
 } 

```



