# basicSwiper opacity·데스크톱 클리핑

> 작성일: 2026-07-02
> 형식: 경량
> 맥락: MainServiceSwiper가 모바일에선 세로 쌓이고 데스크톱에선 안 보이는 증상 디버깅 중 나온 v002 CSS·초기화 조합 이슈.

## 결론

`index.css`의 `.basicSwiper { opacity: 0 }`는 `.swiper-initialized` 또는 `.ready` 전까지 영역을 숨긴다. Swiper init이 늦거나 실패하면 데스크톱은 `main.css`의 `height: 590px` + `overflow: hidden`까지 겹쳐 **완전히 안 보인다**. 모바일은 고정 높이가 없어 세로로 쌓인 `<li>`라도 일부가 보여 증상이 다르게 느껴진다.

## 학습 주제 · 키워드

- **CSS 초기화 상태·클리핑**: `opacity`, `overflow: hidden`, `swiper-initialized`, FOUC 방지
- **반응형 증상 분기**: `matchMedia`, `getBoundingClientRect`, 미디어쿼리 높이 고정

## 이 레포 예문

초기화 전 숨김·초기화 후 표시 규칙.

```206:212:homepage-carenation-react/public/css/index.css
.basicSwiper {
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.basicSwiper.swiper-initialized, .basicSwiper.ready {
  opacity: 1;
}
```

데스크톱만 고정 높이로 클리핑.

```124:127:homepage-carenation-react/public/css/main.css
@media screen and (min-width: 768px) {
  .main__service .basicSwiper {
    height: 590px;
  }
}
```

## GPT에 물어볼 때

```
React useEffect에서 Swiper 초기화 전 .basicSwiper가 opacity:0이고 데스크톱만 height:590px+overflow:hidden이야.
swiper-initialized는 있는데 슬라이드가 안 보이면 어떤 computed style을 순서대로 보면 돼?
double rAF 지연 init과 .ready 클래스 추가 중 뭐가 FOUC 방지에 더 안전한지 비교해줘.
```
