# details/summary 네이티브 아코디언

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: PaymentNotice — JS 없이 유의사항 접기/펼치기

## 결론

`<summary>` 클릭 시 브라우저가 `<details>`의 **`open` 속성**을 토글한다. React state·onClick 없음. `reset.css`는 기본 ▶ marker만 숨기고, `open` 유무로 초기 펼침(`PaymentNotice`) vs 접힘을 정한다.

## 학습 주제 · 키워드

- **HTML disclosure widget**: `details`, `summary`, `open`, `::-webkit-details-marker`

## 이 레포 예문

```tsx
// PaymentNotice.tsx
<details className="noticeGrey__aco" open>
  <summary><span>필독</span>꼭 확인해 주세요!</summary>
  ...
</details>
```

```css
/* reset.css — 토글 아님, 꾸미기만 */
summary::-webkit-details-marker { display: none; }
```

## GPT에 물어볼 때

```
details/summary vs button+aria-expanded 접근성·키보드 차이.
React controlled details(open state 동기화)가 필요한 경우.
details[open] CSS로 화살표·애니메이션 넣는 패턴.
```
