# Android IME(이동/검색)와 돋보기 동작 통일

> 작성일: 2026-09-23
> 형식: 경량
> 맥락: care `searchDiseaseCode`에서 키보드 IME 액션이 돋보기(최근검색 저장)와 같아야 하고, IME만 키보드가 안 내려가던 이슈를 맞춤.

## 결론

IME 오른쪽 액션(「이동」/「검색」)은 화면 버튼 `onClick`이 아니라 **input의 키 이벤트**(보통 `keydown` + `Enter`)로 들어온다. 돋보기는 클릭 시 포커스가 빠져 키보드가 내려가기 쉬우나, IME는 **input에 포커스가 남으므로** 같은 UX를 원하면 `searchItem()` 뒤에 **`ref.blur()`를 명시**하고 돋보기·IME를 **한 핸들러**로 묶는다. `onKeyPress`보다 `onKeyDown`(+ 필요 시 `preventDefault`)이 WebView에서 더 안정적이고, `enterKeyHint="search"`는 라벨 힌트일 뿐 동작의 핵심은 blur다.

## 학습 주제 · 키워드

- **모바일 폼·IME 액션**: `enterKeyHint`, `onKeyDown`, `Enter`, `blur()`, `onClick` vs 키 이벤트
- **WebView 검색 input**: `onKeyPress` 신뢰도, `preventDefault`, 포커스·소프트키보드

## 이 레포 예문

공통 핸들러로 최근검색 저장과 키보드 내림을 맞춘 부분.

```422:434:c:\Users\yojic\projects\protector\care\src\app\components\care\searchDiseaseCode.tsx
  const saveRecentSearchAndDismissKeyboard = () => {
    searchItem();
    focusRef.current?.blur();
  };

  const onSearchFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return;
    }
    e.preventDefault();
    saveRecentSearchAndDismissKeyboard();
  };
```

input·돋보기에 같은 진입점을 연결.

```689:709:c:\Users\yojic\projects\protector\care\src\app\components\care\searchDiseaseCode.tsx
                  <input
                    ref={focusRef}
                    enterKeyHint='search'
                    onKeyDown={onSearchFieldKeyDown}
                    ...
                  />
                  <button type='button' className='searchBtn' onClick={saveRecentSearchAndDismissKeyboard}>
```

## GPT에 물어볼 때

```
React + Android WebView에서 검색 input의 IME 액션(이동/검색)과 type=button 돋보기를
동일 동작(저장 + 키보드 내림)으로 맞추려면 onKeyDown Enter vs form onSubmit vs onKeyPress 중
무엇을 쓰는 게 좋은지, enterKeyHint/search와 blur() 순서 이슈를 설명해줘.
내 코드는 searchItem() 후 focusRef.blur()를 공통 핸들러로 쓰는 패턴이야.
특정 WebView에서 Enter가 안 오면 대안은?
```
