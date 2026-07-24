# URL query string 구성 — `?` 와 `&`

> 작성일: 2026-07-24  
> 맥락: 주소에 `reFlag=true` 같은 값을 붙였는데, 돌아온 화면에서 플래그를 못 읽고 동작이 달라질 때  
> 본문 주제: URL에서 path · query · hash의 경계 · `?`로 쿼리를 열고 `&`로 키를 잇는 규칙  
> 관점: `?` 없이 `&`만 붙인 값은 쿼리가 되나  
> 범위: 로컬 학습 노트 — Git 미공유, 팀 공유 문서에서 참조하지 않음

## 이 글의 질문

- `?a=1&b=2`에서 `?`와 `&`는 각각 무슨 역할인가?
- path 뒤에 `&reFlag=true`만 붙이면 브라우저·라우터는 그걸 파라미터로 읽나?
- “문자열로 URL을 이어 붙일 때” 안전한 방법은 무엇인가?

## 핵심 정리 (결론부터)

| 방식 | 예시 (개념) | 쿼리로 읽히나 | 한 줄 |
|------|-------------|---------------|-------|
| A. 올바름 — 첫 파라미터 | `/detail?reFlag=true` | ✅ `reFlag` | 쿼리는 **`?`로 시작** |
| B. 올바름 — 이어 붙이기 | `/detail?x=1&reFlag=true` | ✅ 둘 다 | 두 번째부터는 **`&`** |
| C. 잘못 — `?` 없이 `&`만 | `/detail&reFlag=true` | ❌ 보통 path의 일부 | `&`는 “이미 열린 쿼리” 안의 구분자 |
| D. 라이브러리 | `URLSearchParams` / 라우터 `search` 객체 | ✅ | 문자열 수동 연결보다 안전 |

한 줄: **`&`는 ‘또 하나의 쿼리 키’이지, ‘쿼리 구간을 여는 문자’가 아니다.** 여는 문은 항상 `?`다.

## 배경 지식 (짧게만)

- **URL 큰 덩어리**: `scheme://host/path?query#hash`
  - **path**: 자원 위치 (`/care/detail/register/...`)
  - **query**: `?` 이후의 `키=값` 목록 (`reFlag=true`)
  - **hash**: `#` 이후. 서버로 안 가는 경우가 많고, 프론트 스크롤·탭에 자주 씀
- **첫 구분자 `?`**: “여기부터 query”라는 **시작 신호** 하나.
- **구분자 `&`**: 이미 query 안에 있을 때, **다음 키=값**을 잇는 쉼표 역할.
- **라우터의 `searchParams.get('reFlag')`**: query 구간을 파싱한 뒤 키를 찾는다. path에 섞인 `&reFlag=true`는 키가 아니다.

비유: 방 번호는 `?`로 복도에서 사무실로 들어가고, 사무실 안 서류철은 `&`로 나란히 둔다. `&`만 복도에 붙이면 서류철이 아니라 **복도 이름에 낙서**한 것과 같다.

## 한눈에

### 올바른 구성

```
https://example.com/care/detail/register/day/hospital/0?reFlag=true#contract
\_________________/ \________________________________/ \__________/ \______/
      origin                      path                    query       hash
                                                      ↑
                                                   여기서 ? 로 시작
```

이미 query가 있을 때 키 추가:

```
/path?foo=1          →  첫 키는 ?
/path?foo=1&reFlag=true  →  다음 키는 &
```

### 잘못된 구성 (쿼리처럼 보이지만 아님)

```
/care/detail/register/day/hospital/0&reFlag=true
                                    ↑
                         path의 연속 문자로 취급되기 쉬움
                         searchParams.get('reFlag') → null
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| query string | `?` 뒤 `키=값&키=값` 구간 |
| path | `?`·`#` 앞의 경로 |
| hash | `#` 뒤 조각 |
| `URLSearchParams` | 쿼리를 만들고 읽는 표준 API |
| encodeURIComponent | 값에 `?` `&` `#` 등이 있을 때 깨지지 않게 이스케이프 |

---

## 관점

흔한 착각은 “`&reFlag=true`를 붙였으니 플래그는 전달됐다”이다.  
실제 문제는 **플래그 이름이 틀려서가 아니라, URL 문법상 그 문자열이 query 구간에 들어가지 않은 것**이다.  
디버깅도 “값이 true인가 false인가”보다 **주소창에 `?reFlag=`가 보이는가, `&`만 path에 붙었는가**를 먼저 본다.  
판단 축: **어디에**(path vs query vs hash) · **무엇으로 열었는가**(`?` 여부) · **값이 예약 문자를 포함하는가**(인코딩).  
수동 문자열 연결은 빠르지만, “이미 `?`가 있는지” 분기 실수가 곧 버그 수다.

## 한 줄 요약

쿼리 파라미터를 붙일 때는 **첫 키는 `?`, 그다음은 `&`** — `?` 없이 `&`만 쓰면 대부분 쿼리가 아니다.

## 함정 한 가지

“지금 pathname에 이미 쿼리가 있는지”를 본 뒤 `?`/`&`를 고르는 분기를 **한곳만** 고치고, 다른 화면은 예전 문자열 연결을 쓰면 같은 버그가 남는다. **플래그를 읽는 쪽**(`get('reFlag')`)만 보면 “왜 null이지?”로만 보이고, **만드는 쪽** 문자열을 보기 전까지 원인에 도달하지 못한다.

---

## 왜 이렇게인가

### 1. 언제 발생하나 (조건)

| 조건 | 설명 |
|------|------|
| URL을 손으로 `+` / 템플릿으로 연결 | 라이브러리가 `?`/`&`를 대신 넣어 주지 않음 |
| “옵션 플래그”를 path 뒤에 덧붙임 | `reFlag`, `utm_*` 등 |
| 읽는 쪽은 query API 사용 | `searchParams.get`, `URLSearchParams` |
| 기존 path에 `?`가 없을 때 `&`부터 사용 | 잘못된 패턴 C |

Postman에서 전체 URL을 바르게 치거나, 브라우저 주소창에 `?reFlag=true`로 직접 열면 **증상 없음**.  
앱이 만들어 준 **깨진 문자열로만** 들어오면 증상 남.

### 2. 왜 `?`와 `&`가 나뉘나 (목적)

초기 웹 폼이 `GET`으로 서버에 키=값을 넘길 때, path와 데이터를 나누는 약속이 필요했다.  
- `?` — “데이터 구간 시작”  
- `&` — “데이터 항목 구분”  

이 문법은 HTML 폼·브라우저·서버·프론트 라우터가 **같은 규칙**으로 파싱한다.  
서버 방화벽이나 CORS와 무관하다. **문자열 모양**만으로 구간이 갈린다.

### 3. 도구·경로 비교

같은 “재등록 플래그를 켠 상세”를 본다는 의도라도, URL 문자열이 다르면 앱이 읽는 결과가 다르다.

| 시나리오 | 전체 URL 예 | Origin | `reFlag` query? | 앱이 `get('reFlag')` |
|----------|-------------|--------|-----------------|----------------------|
| A — 주소창에 올바름 | `http://localhost:3000/care/detail/register/day/hospital/0?reFlag=true` | `http://localhost:3000` | 있음 | `"true"` |
| B — 앱이 `?`로 조합 | 위와 동일 형태 | 동일 | 있음 | `"true"` |
| C — 앱이 `&`만 붙임 | `http://localhost:3000/care/detail/register/day/hospital/0&reFlag=true` | 동일 | 없음(path에 흡수) | `null` |
| D — Postman이 A URL로 GET | (브라우저 Origin 없음) | — | 서버는 path/query를 표준 파싱 | 서버 기준으론 A와 동일하게 query 가능 |

결론 한 줄: **HTTP로 “같은 페이지”를 열어도, path에 `&`가 섞이면 프론트 query 헬퍼는 플래그를 못 본다.**  
“Postman은 되고 앱만 안 된다”가 아니라, **앱이 만들어 준 URL이 C 형태인지**를 먼저 비교한다.

### 4. 수동 연결을 안 고친 경우 (증상이 보이는 구성)

의사코드:

```ts
// 나쁨 — pathname에 쿼리가 없을 때
const returnUrl = `${pathname}&reFlag=true`;
// → "/care/detail/register/.../0&reFlag=true"
```

읽는 쪽:

```ts
searchParams.get('reFlag'); // null
// 앱은 “재등록 모드가 아님”으로 분기 → 뒤로가기·미리보기가 엇갈림
```

증상은 “플래그 변수 버그”처럼 보이지만, **전달 매체가 URL 문법을 깨뜨린 것**이 원인이다.

### 5. 안전한 만드는 법

**이미 search 문자열이 있는지**에 따라 `?`/`&`를 고른다.

```ts
const qs = searchParams.toString(); // "foo=1" 또는 ""
const returnUrl = `${pathname}${qs ? `?${qs}` : ''}${hash ? `#${hash}` : ''}`;
```

또는 표준 API:

```ts
const u = new URL(pathname, 'http://dummy'); // base는 path 조합용
u.searchParams.set('reFlag', 'true');
// u.pathname + u.search + u.hash
```

값이 다른 URL 전체일 때(중첩 returnUrl)는 **반드시** `encodeURIComponent`로 한 번 감싼다.  
안 그러면 안쪽 `?` `&`가 바깥 query를 찢어 버린다.

### 6. 디버깅 체크리스트

1. 주소창을 복사한다. `?reFlag=`가 보이는지, `&reFlag=`가 path에 붙어 있는지 본다.  
2. DevTools → 해당 페이지에서 `location.search`를 찍는다. 비어 있으면 query 구간이 없는 것이다.  
3. 플래그를 **읽는 코드**가 아니라 **문자열을 만드는 코드**를 찾는다.  
4. `returnUrl`처럼 URL이 쿼리 **값**으로 또 들어가는지 확인한다. 이중 인코딩/디코딩 실수도 같은 계열이다.

---

## 참고 코드

일반적으로 “현재 검색 문자열을 유지한 채 returnUrl을 만든다”는 패턴이다.

```ts
const returnSearch = new URLSearchParams(search); // 현재 페이지의 query
returnSearch.set('reFlag', 'true');
const returnSearchStr = returnSearch.toString();
const returnUrl = `${pathname}${returnSearchStr ? `?${returnSearchStr}` : ''}${hash ? `#${hash}` : ''}`;
```

이 레포에서는 상세 “수정하기”가 위와 같이 `URLSearchParams`로 `reFlag`를 넣은 뒤 `?`를 붙여 `returnUrl`을 만든다.  
예전에 pathname에 `&reFlag=true`를 직접 붙이던 방식은, 쿼리 파서가 `reFlag`를 못 읽어 재등록 맥락이 끊기는 원인이었다.

## 이 레포에서는

| 개념 | 이 프로젝트에서의 위치 |
|------|------------------------|
| 잘못된 연결(과거) | `pathname + '&reFlag=true'` 형태 → path에 `&` 흡수 |
| 올바른 연결(현재) | `editBtn`에서 `URLSearchParams` + `?${returnSearchStr}` |
| 플래그 소비 | 상세·등록 플로우에서 `reFlag=true`로 재등록 미리보기 등 분기 |
| 연관 증상 | 플래그 유실 후 뒤로가기가 기대한 화면이 아님 (history 이슈와 **겹쳐** 보이기 쉬움) |

history의 push/replace 문제와 **동시에** 보이면, “루프”만 고치고 쿼리 생성은 남는 식으로 한쪽만 수정하기 쉽다. **주소 문자열**과 **스택 조작**은 따로 검증한다.

## 더 볼 것 (선택)

- `encodeURIComponent` vs `encodeURI` (무엇을 이스케이프하지 않는지)
- 중첩 URL을 쿼리 값으로 넣을 때(returnUrl)의 인코딩 규칙
- 팀 공유가 필요하면 docs로 재작성 — 이 파일은 로컬 notes 전용
