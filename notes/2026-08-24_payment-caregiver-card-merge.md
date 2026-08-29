# payment API + jobDetail merge (amount_time)

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: 결제 applicant_user 응답에 시급 없음 — job/detail 캐시로 보강

## 결론

`paymentRepository.getPaymentInfo`는 cgs_users 중심이라 **amount_time이 0**으로 온다. 같은 `cgs_users_id`로 `jobDetail.applicants`에서 찾아 merge하고, react-query로 **이미 받아 둔 detail 캐시**를 재사용한다.

## GPT에 물어볼 때

```
두 API 응답을 UI에서 merge vs BFF/백엔드에서 합치기 트레이드오프.
react-query select/transform vs useMemo merge.
payment info query와 job detail query 로딩 타이밍 불일치 UX.
```

## 학습

- **모놀리스 vs MSA**
  - 모놀리스: 하나의 백엔드 안에 `user / job / payment` 등이 같이 있음
  - MSA: `User Service / Job Service / Payment Service` 등이 독립된 서비스로 분리됨
  - `/user`, `/payment`처럼 API URL을 나눈다고 MSA인 건 아님.

- **BFF**
  - `Backend For Frontend`
  - 프론트가 여러 백엔드 데이터를 직접 조합하지 않도록 **프론트에 맞는 API를 제공하는 백엔드 계층**
  - MSA에서 특히 유용하지만 **MSA에서만 쓰는 건 아님.**

- **백엔드에 API 하나 추가 ≠ 무조건 BFF**
  - `job + payment`를 합쳐주는 API를 기존 모놀리스 백엔드에 하나 추가하는 것은 그냥 **백엔드 조합 API**라고 보는 게 정확함.
  - BFF는 더 넓은 개념.

- **React Query `select`**
  - **하나의 query 응답을 변환**할 때 사용.
  - `job API → 필요한 형태로 가공`

- **`useMemo`**
  - **계산 결과를 메모이제이션**하는 React 기능.
  - 여러 query 데이터를 합치는 데 사용할 수 있지만 **merge 전용 기능은 아님.**
  - 단순한 `job + payment` 객체 합치기에는 굳이 필요하지 않을 수 있음.

- **두 API의 로딩**

  ```ts
  const isLoading = job.isLoading || payment.isLoading;
  ```

  - 둘 다 필요한 화면이면 둘 중 하나라도 로딩 중일 때 로딩 처리.
  - 이 정도는 특별히 어려운 문제가 아님.

### 제일 중요한 흐름

```text
API 하나 가공
→ select

API 여러 개 가져옴
→ 그냥 조합 / 필요하면 useMemo

여러 API를 백엔드에서 하나로 만들어줌
→ 조합 API

프론트 전용 백엔드 계층에서 여러 서비스를 조합
→ BFF
```

결국 오늘 핵심은 **“데이터를 어디에서 조합할 것인가?”**야.
