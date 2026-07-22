# Day 25: REST API

## 키워드

- **REST** — 자원(Resource)을 URL로 표현하고 HTTP 메서드로 행위를 나타내는 아키텍처 스타일.
- **HTTP Method** — `GET`(조회), `POST`(생성), `PUT/PATCH`(수정), `DELETE`(삭제).
- **Status Code** — 2xx 성공, 3xx 리다이렉트, 4xx 클라이언트 오류, 5xx 서버 오류.
- **Query Parameter** — `?page=1&size=10` 형태. 필터·정렬·페이지네이션에 사용.
- **Path Parameter** — `/users/42`처럼 경로에 포함된 자원 식별자.
- **CRUD** — Create/Read/Update/Delete를 HTTP 메서드에 매핑.

## 면접 포인트

- **Q. `PUT`과 `PATCH`의 차이는?**
  → `PUT`은 자원 **전체 교체**(멱등), `PATCH`는 **부분 수정**. 부분 업데이트에는 PATCH가 적합.
- **Q. Query Parameter와 Path Parameter를 어떻게 구분해 쓰나?**
  → 특정 자원을 **식별**하면 Path(`/users/42`), 목록을 **필터/정렬/페이징**하면 Query(`?sort=name`).
- **Q. 자주 쓰는 상태 코드 예시는?**
  → 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401/403 인증·인가, 404 Not Found, 500 Server Error.

## API 설계 포인트

- **일관된 자원 네이밍** — 복수 명사(`/users`), 계층 표현(`/users/42/orders`). 동사는 URL이 아니라 HTTP 메서드로.
- **버저닝** — `/v1/...` 또는 헤더로. 하위 호환을 위한 전략.
- **에러 응답 규격** — `{ code, message, details }`처럼 형식 통일. 상태 코드와 본문을 함께 설계.
- **페이지네이션·필터·정렬** — Query Parameter 규칙 표준화(`?page=&size=&sort=`).

## 목표

- 자원 중심으로 엔드포인트를 설계할 수 있다.
- 메서드·상태 코드를 의미에 맞게 사용한다.
- CRUD를 REST 규칙에 맞춰 fetch로 구현한다.
- 일관된 네이밍·버저닝·에러 규격을 갖춘 API를 설계할 수 있다.
