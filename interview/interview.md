# 면접 준비 (이전 방식)

> **이 파일은 더 이상 편집하지 않습니다.**
> FE 학습 노트는 **`docs/`** 아래에서 **파일 1개 = 페이지 1개**로 관리합니다.

## 어디를 수정하나요?

| 하려는 일 | 수정 위치 |
|-----------|-----------|
| 문서 내용 추가·수정 | `docs/interview/<카테고리>/<slug>.md` |
| 사이드바 메뉴 | `docs/.vitepress/config.mts` |
| 사이트 미리보기 | `npm run docs:dev` |
| 배포용 HTML 생성 | `npm run docs:build` → `fe/` 폴더 |

## 문서 목록 (현재)

- JavaScript: `docs/interview/javascript/closure.md`, `event-loop.md`
- React: `docs/interview/react/virtual-dom.md`, `hooks-rules.md`
- TypeScript: `docs/interview/typescript/generics.md`, `utility-types.md`
- CS: `docs/interview/cs/http-vs-https.md`

## 새 페이지 추가 방법

1. `docs/interview/<카테고리>/<영문-slug>.md` 파일 생성 (제목은 `# 한글 제목`)
2. `docs/.vitepress/config.mts`의 `sidebar`에 링크 추가
3. `npm run docs:build` 실행 후 `index.html` → **FE학습** 탭에서 확인

## 참고

- `fe/` 폴더는 **빌드 결과물**입니다. 직접 수정하지 마세요.
- `fe/index.html`이 한 줄로 보이는 것은 정상입니다 (VitePress가 압축해서 생성).
