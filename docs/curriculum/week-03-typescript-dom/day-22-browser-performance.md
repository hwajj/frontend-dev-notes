# Day 22: Browser Performance

## 키워드

- **Reflow (Layout)** — 요소의 크기·위치가 바뀌어 레이아웃을 다시 계산하는 비싼 작업.
- **Repaint** — 색·배경 등 시각만 바뀌어 다시 그리는 작업(레이아웃 재계산은 없음).
- **Layout Thrashing** — 읽기(getBoundingClientRect 등)와 쓰기를 번갈아 해 Reflow가 반복되는 안티패턴.
- **requestAnimationFrame** — 다음 리페인트 직전에 콜백 실행. 애니메이션은 이걸로 프레임에 맞춘다.
- **Debounce** — 마지막 호출 후 일정 시간 뒤 1번 실행(예: 검색 입력).
- **Throttle** — 일정 간격마다 최대 1번 실행(예: 스크롤/리사이즈).

## 면접 포인트

- **Q. Reflow와 Repaint 중 뭐가 더 비싼가?**
  → Reflow. 위치·크기 변화는 하위 요소까지 재계산을 유발한다. Repaint는 상대적으로 저렴.
- **Q. Layout Thrashing을 어떻게 피하나?**
  → 읽기와 쓰기를 분리(먼저 모아서 읽고, 그다음 모아서 쓰기)해 강제 동기 레이아웃을 줄인다.
- **Q. Debounce와 Throttle은 언제 각각 쓰나?**
  → 입력 후 "최종값 1번"이 필요하면 Debounce, 이동 중 "주기적 반영"이 필요하면 Throttle.

## 목표

- Reflow/Repaint를 유발하는 속성을 구분할 수 있다.
- Debounce/Throttle을 직접 구현하고 상황에 맞게 적용한다.
- `requestAnimationFrame`으로 부드러운 애니메이션을 만든다.
