1. 개요
  - 파라미터를 상태관리하는 useParamState훅을 만드는 과정을 통해 그에 필요한 지식을 학습한다.

2. 흐름
   - 목적에 맞는 코드 구현하도록 플로우 이해
   - useSearchParams와 query string 구조 이해
   - useSearchParam을 조작하기
     - useSearchParam -> Object -> 배열객체로 조작
     - reduce함수 잘 쓰기
   - ParamConfig 타입 만들어보기
   - Typescript 개념 
   - 

  
3. 학습내용
  a. 목적
  - 매번 폼을 입력할때마다 searchParam을 바꿔주는게 번거롭고 어렵다
  - 페이지 새로고침 시 url로부터 상태를 복원해야한다.
  - 페이지를 새로고침해도 url에 상태가 남아서 검색한 결과를 새로 만들지 않아도 됨
    
  b. 구현에 필요한 밑그림
    1. url 파라미터로부터 스트링을 가져와서 조작해야한다.
     - decoder : 스트링이 T면 객체에는 true를 담도록 파싱 필요
     - validator : 유효성검사 필요 

    2. 각 파라미터의 성격(string, number, boolean, array, date 등)에 따라, 
    해당 타입에 맞는 디코더/유효성 검사기를 자동으로 설정해주는 구조가 필요하다. 
    => Param클래스 사용
      Param.string(...)은 일정한 구조의 객체를 생성하는 팩토리함수
      ```
      {
      value: 'abc', // 초기값
      decoder: (value: string) => value, // 문자열 → 타입
      validator: ... // 유효성 검사 함수
      }
      
      ```
    3. 만들
          
     