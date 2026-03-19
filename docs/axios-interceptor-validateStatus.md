# Axios + 인터셉터 + validateStatus 학습 문서

> baseURL·timeout·요청/응답 인터셉터 구성과, `validateStatus: () => true`로 실패 응답도 흐름에 태우는 이유를 한 문서에서 정리합니다.

---

## 1. 학습 목표와 전제

- **목표**: Axios 인스턴스에 baseURL, timeout, 요청 인터셉터(Authorization 주입), 응답 인터셉터(401 시 콘솔에 `"reissue"` 출력)를 구성하고, `validateStatus: () => true`의 역할과 사용 이유를 이해한다.
- **전제**: Axios 기본 사용법(`axios.get`, `axios.post`), Promise/async 이해가 있으면 충분하다.

---

## 2. Axios 인스턴스와 baseURL·timeout

### 2.1 왜 인스턴스를 쓰나

`axios.get('https://api.example.com/users')`처럼 매번 URL을 넣지 않고, **공통 설정이 적용된 클라이언트**를 하나 만들어 두면:

- baseURL·timeout·헤더를 한 곳에서 관리할 수 있고
- 이후 **인터셉터**로 요청/응답을 한 번에 가공할 수 있다.

이 “설정이 묶인 클라이언트”가 **Axios 인스턴스**다.

### 2.2 인스턴스 생성 예시

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10_000, // 10초
});

// 사용 시 baseURL이 자동으로 붙는다.
const res = await api.get('/users'); // GET https://api.example.com/users
```

- **baseURL**: 모든 요청의 접두사. `get('/users')`만 넘기면 `baseURL + '/users'`로 요청된다.
- **timeout**: 밀리초 단위. 이 시간을 넘기면 요청이 abort되고 `AxiosError`(보통 `code: 'ECONNABORTED'`)가 난다.

---

## 3. 요청 인터셉터(Authorization 주입)

### 3.1 인터셉터가 하는 일

**인터셉터**는 “요청이 나가기 직전” 또는 “응답이 들어온 직후”에 끼어 들어가서 config/응답을 바꿀 수 있게 해준다.

- **요청 인터셉터**: `config`를 수정해서 헤더·파라미터 등을 넣는다.  
  → Authorization을 **매 요청마다 여기서 한 번만** 넣어 두면, 호출하는 쪽에서는 URL·바디만 신경 쓰면 된다.

### 3.2 요청 인터셉터로 Authorization 넣기

토큰을 반환하는 함수 `getToken()`이 있다고 하자. 비동기일 수 있으므로 `async`로 받아준다.

```typescript
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

type GetToken = () => Promise<string | null> | string | null;

const createApiClient = (config: {
  baseURL: string;
  timeout: number;
  getToken: GetToken;
}): AxiosInstance => {
  const { baseURL, timeout, getToken } = config;

  const instance = axios.create({
    baseURL,
    timeout,
    // validateStatus는 아래 5절에서 설명
    validateStatus: () => true,
  });

  instance.interceptors.request.use(async (axiosConfig: InternalAxiosRequestConfig) => {
    const token = await Promise.resolve(getToken());
    if (token != null && axiosConfig.headers) {
      axiosConfig.headers.Authorization = token;
    }
    return axiosConfig;
  });

  return instance;
};

// 사용 예
const getToken = async () => localStorage.getItem('accessToken') ?? null;
const api = createApiClient({
  baseURL: 'https://api.example.com',
  timeout: 10_000,
  getToken,
});

await api.get('/me'); // Authorization: <토큰값> 이 자동으로 붙음
```

- `Promise.resolve(getToken())`: `getToken`이 동기면 그대로 값, 비동기면 Promise이므로 `await` 한 번에 통일.
- `axiosConfig.headers`가 없을 수 있으므로 `axiosConfig.headers` 존재 여부를 확인한 뒤에만 `Authorization`을 넣는다.

---

## 4. 응답 인터셉터(401 시 콘솔에 "reissue" 출력)

### 4.1 응답 인터셉터 역할

“서버에서 온 응답”을 **한 군데**에서 검사해서, status에 따라 로그·재시도·리다이렉트 등을 붙일 수 있다.

여기서는 **status === 401**일 때 콘솔에 `"reissue"`를 찍는 예만 둔다. 실제로는 이 위치에서 토큰 재발급(reissue) 호출을 넣거나, 상위로 이벤트를 올리는 식으로 확장한다.

### 4.2 401일 때 "reissue" 로그 찍기

아래 코드는 **`validateStatus: () => true`가 설정되어 있을 때**만 의도대로 동작한다.  
기본값이면 401이 오면 Axios가 reject해서 응답 인터셉터의 “성공 콜백”에는 도달하지 않는다. 이 부분은 5절에서 설명한다.

```typescript
instance.interceptors.response.use(
  (response) => {
    if (response.status === 401) {
      console.log('reissue');
    }
    return response;
  }
);
```

- `response`: `{ status, data, headers, ... }` 형태의 Axios 응답 객체.
- `return response`: 다음 then/호출부로 그대로 넘긴다. 수정하고 싶다면 `return { ...response, data: ... }`처럼 새 객체를 반환해도 된다.

---

## 5. validateStatus: () => true — 실패도 응답 흐름에 태우는 이유

### 5.1 Axios 기본 동작(validateStatus 기본값)

Axios는 내부적으로 “성공인지”를 아래와 비슷한 조건으로 판단한다.

```typescript
// Axios 내부 기본값에 해당하는 개념
function defaultValidateStatus(status: number): boolean {
  return status >= 200 && status < 300;
}
```

- 이 조건을 **만족하면** → Promise가 **resolve**되고, 호출부는 `response` 객체를 받는다.
- 이 조건을 **만족하지 않으면**(400, 401, 500 등) → Promise가 **reject**되고, 호출부는 **응답이 아니라 AxiosError**를 받는다.

그래서 기본 설정일 때는:

- 2xx → `then(response => ...)` 에서만 다룰 수 있고
- 그 외 → `catch(error => ...)` 에서만 다룰 수 있다.  
  즉, **“실패 = 예외(throw)”** 로만 흐름에 올라온다.

### 5.2 validateStatus: () => true 의 의미

```typescript
validateStatus: () => true
```

의 의미는 **“모든 HTTP status를 유효한 응답으로 간주한다”** 이다.

- 200이든 401이든 500이든 **전부 resolve** 시킨다.
- 따라서 **항상** `then(response => ...)` 쪽으로 가고, `response.status`와 `response.data`를 같은 방식으로 다룰 수 있다.

즉, “실패도 응답 흐름에 태운다”는 말은, **에러로 throw되지 않게 하고, 응답 객체의 한 종류로 흐름에 올린다**는 뜻이다.

### 5.3 이렇게 쓰는 이유

1. **401을 “예외”가 아니라 “상태값”으로 다루고 싶을 때**  
   - 401도 `response`로 받아서, 인터셉터나 상위 레이어에서 “reissue 필요”로만 인지하고, 토큰 재발급 후 재시도 등을 **한 흐름**에서 처리할 수 있다.

2. **호출부를 “항상 response가 온다”는 전제로 단순하게 쓰고 싶을 때**  
   - `try/catch`와 `catch` 분기를 줄이고, `if (response.status === 401)` 같은 **status 기반 분기** 하나로 통일할 수 있다.

3. **에러/성공을 “한 파이프라인”에서 처리하고 싶을 때**  
   - 응답 인터셉터 하나에서 status에 따라 reissue 로그, 리다이렉트, 토스트 등을 모두 처리할 수 있고, “모든 HTTP 결과를 한 종류의 객체(response)”로 다루는 설계가 가능해진다.

반대로, `validateStatus`를 기본값으로 두면 401은 **항상 reject**이므로, 그 시점에서 이미 “응답 객체”가 아니라 “에러 객체”로 흐름이 갈라진다.  
그럼 응답 인터셉터의 “성공 콜백”에는 401이 들어오지 않으므로, “401일 때 콘솔에 reissue” 같은 로직을 **응답 흐름 안**에 두려면 `validateStatus: () => true`가 필요하다.

---

## 6. 한 파일에서 돌려볼 수 있는 전체 예시

아래는 baseURL·timeout·요청 인터셉터(Authorization)·응답 인터셉터(401 시 `"reissue"` 출력)·`validateStatus: () => true`를 모두 포함한 **학습용 스텁**이다.  
Node 또는 브라우저에서 Axios만 설치되어 있으면 동작한다.

```typescript
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

type GetToken = () => Promise<string | null> | string | null;

/**
 * baseURL, timeout, 요청 인터셉터(Authorization), 응답 인터셉터(401 → console "reissue") 를 가진 Axios 클라이언트
 */
function createAxiosWithInterceptors(config: {
  baseURL: string;
  timeout: number;
  getToken: GetToken;
}): AxiosInstance {
  const { baseURL, timeout, getToken } = config;

  const instance = axios.create({
    baseURL,
    timeout,
    validateStatus: () => true, // 4xx/5xx도 응답 객체로 받기 위함
  });

  // 요청 인터셉터: Authorization 주입
  instance.interceptors.request.use(async (axiosConfig: InternalAxiosRequestConfig) => {
    const token = await Promise.resolve(getToken());
    if (token != null && axiosConfig.headers) {
      axiosConfig.headers.Authorization = token;
    }
    return axiosConfig;
  });

  // 응답 인터셉터: 401이면 콘솔에 "reissue" 출력
  instance.interceptors.response.use((response) => {
    if (response.status === 401) {
      console.log('reissue');
    }
    return response;
  });

  return instance;
}

// ----- 사용 예 (학습용) -----

const getToken = async () => 'Bearer my-token'; // 실제로는 storage/cookie 등에서 조회

const api = createAxiosWithInterceptors({
  baseURL: 'https://httpbin.org',
  timeout: 10_000,
  getToken,
});

// 실제로 요청을 보내서 동작을 확인할 수 있다.
(async () => {
  const res = await api.get('/get');
  console.log('status', res.status);
  console.log('data', res.data);
  // 401이 오면 위 응답 인터셉터에서 "reissue" 가 출력된다.
})();
```

- **httpbin.org**: GET 요청을 그대로 돌려주는 테스트 서비스.  
  로컬에서 401을 시뮬레이션하려면 `baseURL`을 401을 반환하는 mock 서버로 바꾸면 된다.

---

## 7. 개념 정리와 확장 학습

### 7.1 이 문서에서 다룬 개념

| 개념 | 요약 |
|------|------|
| **Axios 인스턴스** | `axios.create({ baseURL, timeout, ... })` 로 만든, 공통 설정이 적용된 클라이언트. |
| **요청 인터셉터** | 나가기 직전에 `config`를 가공. Authorization, 공통 헤더 등 주입에 사용. |
| **응답 인터셉터** | 들어온 직후에 `response`를 가공. status별 로그·재시도·에러 변환에 사용. |
| **validateStatus** | “이 status를 성공으로 볼지”를 결정. `() => true`면 모두 성공으로 보고 resolve. |

### 7.2 이후 확장 학습 제안

- **토큰 재발급(reissue)과 요청 재시도**: 401 시 응답 인터셉터나 별도 레이어에서 reissue 호출 후, 실패한 요청의 `config`로 다시 `instance.request(config)` 호출하는 패턴.
- **AxiosError 구조**: `error.response?.status`, `error.response?.data`, `error.code` 등으로 네트워크 에러와 HTTP 에러 구분.
- **인터셉터에서 에러 처리**: `response.use(onFulfilled, onRejected)` 의 두 번째 인자로 “reject된 경우”를 한곳에서 처리하는 방법.
- **다른 클라이언트와의 비교**: Fetch API에는 인터셉터가 없으므로, `fetch`를 감싼 래퍼 함수로 비슷한 역할을 구현하는 방식.

---

## 8. 정리

- **baseURL·timeout**은 `axios.create({ baseURL, timeout })` 에서 한 번에 설정한다.
- **Authorization 주입**은 요청 인터셉터에서 `getToken()` 결과를 `config.headers.Authorization` 에 넣으면 된다.
- **401 시 "reissue" 출력**은 응답 인터셉터에서 `response.status === 401` 일 때 `console.log('reissue')` 를 호출하면 된다.
- **validateStatus: () => true** 를 쓰면 4xx/5xx도 reject되지 않고 **응답 객체**로 넘어오기 때문에, “401을 응답 흐름 안에서 다루고 싶다”는 요구를 만족시킬 수 있다.

이 한 문서만으로도 위 구성의 목적·코드·이유를 따라가며 학습할 수 있도록 구성했다.
