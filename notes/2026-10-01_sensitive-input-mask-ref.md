# CVC·카드비밀번호 마스킹(ref + input.value)

> 작성일: 2026-10-01
> 형식: 경량
> 맥락: addTime 카드 등록 화면을 care `RegisterCard`에서 이식하면서 민감 입력 UX를 맞출 때.

## 결론

실제 숫자는 `useRef`에만 쌓고, 화면은 `input.value`를 직접 바꿔 `*…+마지막 자리` → debounce 후 전부 `*`로 바꾼다. `value={form.cvc}`만 쓰면 React controlled와 마스킹 타이밍이 맞지 않아 care와 같은 입력감을 내기 어렵다.

## 학습 주제 · 키워드

- **React controlled vs imperative input**: `useRef`, `onChange`에서 DOM 직접 갱신, debounce
- **PCI/UI 보안(표시만)**: 마스킹, ref에 평문, submit 시 ref→state 동기화

## 이 레포 예문

`maskSensitiveInput`은 ref에 digit을 모으고 masked 문자열을 `input.value`에 넣은 뒤 `setForm`으로 API용 값을 맞춘다.

```92:123:src/components/component/addTime/AddTimeRegisterCard.tsx
	const maskSensitiveInput = (
		raw: string,
		field: 'cvc' | 'cardPwd',
		input: HTMLInputElement,
	) => {
		const ref = field === 'cvc' ? cvcValue : pwdValue
		// ...
		input.value = masked
		if (field === 'cvc') {
			setForm(prev => ({ ...prev, cvc: ref.current }))
			debounceMaskCvc(() => {
				input.value = '*'.repeat(ref.current.length)
			})
```

debounce 헬퍼는 care `careUtils.debounce`와 동일하게 모듈 스코프 타이머 1개(`payCardFormValidation.ts`).

## GPT에 물어볼 때

```
React에서 카드 CVC 입력 시 마지막 글자만 보이다가 2초 뒤 전부 * 로 바꾸는 UX를
controlled state(value={})만으로 구현할 때 생기는 문제와,
useRef + input.value 직접 수정 패턴의 트레이드오프를 설명해줘.
우리는 care RegisterCard 이식으로 debounceMaskCvc(fn, 2000) 를 쓰고 있어.
```
