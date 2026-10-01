# async onClick과 `void` (floating Promise)

> 작성일: 2026-10-01
> 형식: 경량
> 맥락: addTime 카드 등록 버튼은 `onClick={onSubmit}`인데, 같은 기능군 `AddTimeApply` 삭제는 `void handleDeletePayCard` — 세션에서 void를 안 쓴 이유를 물었을 때.

## 결론

`onClick={onSubmit}`처럼 async 함수를 넘기면 클릭 시 Promise가 반환되어 `@typescript-eslint/no-floating-promises`에 걸릴 수 있다. 레포 다른 화면은 `onClick={() => void handleChangeSubmit()}`로 의도적으로 Promise를 무시한다. `AddTimeRegisterCard`는 `onClick={onSubmit}` — 동작은 같지만 린트·팀 컨벤션상 `() => void onSubmit()` 정렬이 안전하다. `catch {}`만 두고 에러 UI는 axios interceptor에 맡기는 것도 같은 submit 흐름에서 함께 논의된 패턴이다.

## 학습 주제 · 키워드

- **TypeScript void operator**: floating promise, `MouseEventHandler` 반환 `void`
- **ESLint**: `@typescript-eslint/no-floating-promises`
- **에러 경로**: try/catch 비우기 + axios interceptor

## 이 레포 예문

등록 버튼 — async handler 직접 전달.

```398:402:src/components/component/addTime/AddTimeRegisterCard.tsx
						<button
							type="button"
							className="solidBtn"
							disabled={isSubmitting}
							onClick={onSubmit}
```

같은 addTime — void로 Promise 명시 처리.

```368:370:src/components/component/addTime/AddTimeApply.tsx
												onRegisterClick={goRegisterCard}
												onDeleteCard={cardId =>
													void handleDeletePayCard(cardId)
```

## GPT에 물어볼 때

```
React button onClick에 async 함수를 onClick={fn} vs onClick={() => void fn()} 로
넘길 때 TypeScript·eslint no-floating-promises 차이를 설명해줘.
우리 레포는 FamilyProtectorInfo 등은 void 를 쓰고 AddTimeRegisterCard 등록 버튼은 onClick={onSubmit} 이야.
async handler 안에서 catch는 비우고 axios interceptor가 팝업을 띄운다.
```
