# Param은 URL 코덱

> 작성일: 2026-07-02
> 형식: 경량
> 맥락: `useParamState`의 `Param`이 Zod 같은 검증 라이브러리 대신 왜 있는지 논의했다.

## 결론

`Param`은 범용 스키마 검증기가 아니라 **이 팀 URL 문자열 규칙**용 작은 코덱이다. `value`(기본값)·`validator`·`decoder`로 읽고, `toParams`/`encodeParam`이 쓴다. boolean은 `'true'`/`'false'`, 배열은 trailing comma·`EMPTY_ARRAY_IDENTIFIER`처럼 **교과서 스키마에 없는 규칙**이 코드에 박혀 있다.

## 학습 주제 · 키워드

- **TypeScript·API 설계**: `ParamConfig`, codec vs validator, library dependency
- **URL 직렬화**: query encode/decode, array delimiter, fallback default

## 이 레포 예문

배열을 URL에 쓸 때 1원소 배열과 plain string을 구분하려 trailing comma를 붙인다.

```typescript
// packages/hook/src/useParamState/utils.ts
if (isArray(value)) {
  return value.length >= 1
    ? `${value.join(ARRAY_ITEM_DELIMITER)}${ARRAY_ITEM_DELIMITER}`
    : EMPTY_ARRAY_IDENTIFIER
}
```

Zod로 validator 일부는 대체 가능하지만, 위 encode 규칙과 `toParams`는 그대로 필요하다.

## GPT에 물어볼 때

```
React 앱 URL 쿼리용 커스텀 Param(codec) vs Zod schema + transform 중
팀 전용 인코딩 규칙(배열 trailing comma, boolean 문자열)이 있을 때 트레이드오프를 비교해줘.
공유 훅 패키지에 Zod를 peer로 넣을지, 가벼운 자체 codec을 둘지 기준도 알려줘.
```
