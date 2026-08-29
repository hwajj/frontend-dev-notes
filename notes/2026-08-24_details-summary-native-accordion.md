# details/summary 네이티브 아코디언

> 작성일: 2026-08-24
> 형식: 경량
> 맥락: PaymentNotice — JS 없이 유의사항 접기/펼치기

### `details / summary` 핵심 정리

- `<details>` + `<summary>`는 **접기/펼치기용 기본 HTML**
- `summary` 클릭하면 브라우저가 알아서 `open`을 **추가/제거**
- React `useState` 없이도 동작
- CSS에서 `details[open]`으로 열린 상태 스타일링 가능

```tsx
<details>
  <summary>상세 내용</summary>
  내용
</details>
```

```css
details[open] .arrow {
  transform: rotate(180deg);
}
```

### `button + aria-expanded`

- React에서 **open 상태를 직접 관리해야 할 때** 사용
- `aria-expanded`로 현재 열림/닫힘 상태를 접근성 API에 전달

```tsx
<button aria-expanded={open}>상세 내용</button>
```

### 선택 기준

**단순 접기/펼치기 → `details`**
**React 상태와 연동/복잡한 제어 → `button + aria-expanded`**

`details open={open} + onToggle`로 React와 동기화할 수도 있지만, 단순 UI라면 굳이 그럴 필요 없음.
