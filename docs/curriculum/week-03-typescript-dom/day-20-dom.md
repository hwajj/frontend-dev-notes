# Day 20: DOM

## 키워드

- **DOM Tree** — HTML 문서를 트리 구조 객체로 표현한 것. 브라우저가 파싱해 생성.
- **Node** — 트리의 기본 단위(요소·텍스트·주석 등 모두 Node). `Element`의 상위 개념.
- **Element** — Node 중 태그로 표현되는 것(`<div>` 등). `Node`를 상속.
- **DOM API** — JS로 문서를 읽고 조작하는 인터페이스(`document`, `element` 메서드들).
- **Query Selector** — `querySelector` / `querySelectorAll` 로 CSS 선택자 기반 탐색.
- **DOM Manipulation** — 노드 생성/삽입/삭제/속성·클래스 변경 등 문서 변경.

## 면접 포인트

- **Q. `Node`와 `Element`의 차이는?**
  → `Node`는 텍스트·주석까지 포함하는 상위 타입이고, `Element`는 그중 태그 요소만. `childNodes`는 Node 목록, `children`은 Element 목록.
- **Q. `getElementById`와 `querySelector` 차이는?**
  → 전자는 id 전용으로 빠르고, 후자는 CSS 선택자 전체를 지원해 유연하다. `querySelectorAll`은 정적 NodeList를 반환.
- **Q. DOM 조작이 느릴 수 있는 이유는?**
  → 잦은 변경이 Reflow/Repaint를 유발하기 때문(Day 22와 연결). 변경을 모아 처리(DocumentFragment 등)하는 게 좋다.

## 목표

- Node/Element/Document의 관계를 트리로 설명할 수 있다.
- 선택자 API로 요소를 찾고 생성·삽입·삭제할 수 있다.
- DOM 조작 비용을 인지하고 배칭의 필요성을 이해한다.
