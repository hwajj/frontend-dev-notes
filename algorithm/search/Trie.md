# 🌳 트라이 (Trie)

> 주제: 트라이 (Prefix Tree)
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념        | 설명                                       |
| --------- | ---------------------------------------- |
| **트라이**   | 문자열 저장/탐색에 특화된 트리형 자료구조          |
| **핵심 구조**  | 각 노드는 문자를 저장하고, 자식 노드로 다음 문자를 가리킴             |
| **주요 연산**    | `insert(word)`, `search(word)`, `startsWith(prefix)`        |
| **시간복잡도** | 삽입/검색: O(m) (m = 단어 길이) |
| **활용 분야** | 자동완성, 접두사/전체 단어 검색, 사전 구현, 문자열 집합 관리 등 |

---

## 📘 **문제 1: LeetCode 208. Implement Trie**

> 트라이 자료구조를 구현하라.

### 💬 **입출력 예시**

```js
let trie = new Trie();
trie.insert('apple');
trie.search('apple');   // true
trie.search('app');    // false
trie.startsWith('app'); // true
trie.insert('app');
trie.search('app');    // true
```

### 💻 **코드 + 주석**

```js
// Trie 노드 정의
class TrieNode {
  constructor() {
    this.children = {}; // 자식 노드(문자: TrieNode)
    this.isWord = false; // 단어의 끝 표시
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  
  // 단어 삽입
  insert(word) {
    let node = this.root;
    for (let ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];
    }
    node.isWord = true; // 단어의 끝 표시
  }
  
  // 단어 전체 검색
  search(word) {
    let node = this.root;
    for (let ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isWord; // 단어의 끝인지 확인
  }
  
  // 접두사 검색
  startsWith(prefix) {
    let node = this.root;
    for (let ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true; // 접두사만 있으면 true
  }
}
```

**핵심 포인트:**
- 각 노드는 문자를 저장하고 자식 노드로 다음 문자를 가리킴
- `isWord` 플래그로 단어의 끝을 표시
- `search`는 단어 전체가 있어야 true, `startsWith`는 접두사만 있으면 true

---

## 📘 **문제 2: LeetCode 720. Longest Word in Dictionary**

> 사전에서 가장 긴 단어를 찾되, 그 단어의 모든 접두사도 사전에 있어야 한다.

### 💬 **입출력 예시**

| 입력                    | 출력    |
| --------------------- | ----- |
| `words = ['w','wo','wor','worl','world']` | `'world'` |
| `words = ['a','banana','app','appl','ap','apply','apple']` | `'apple'` |

### 💻 **코드 + 주석**

```js
// Longest Word in Dictionary
function longestWord(words) {
  let trie = new Trie();
  
  // 모든 단어 삽입
  for (let word of words) {
    trie.insert(word);
  }
  
  let longest = '';
  
  function dfs(node, path) {
    // 현재 경로가 단어이고 더 길면 갱신
    if (node.isWord && path.length > longest.length) {
      longest = path;
    }
    
    // 자식 노드 탐색 (알파벳 순서대로)
    for (let ch in node.children) {
      if (node.children[ch].isWord) {
        dfs(node.children[ch], path + ch);
      }
    }
  }
  
  dfs(trie.root, '');
  return longest;
}
```

---

## 📘 **문제 3: LeetCode 211. Design Add and Search Words Data Structure**

> 단어를 추가하고, '.' 와일드카드를 포함한 검색을 지원하는 자료구조를 구현하라.

### 💬 **입출력 예시**

```js
let wordDictionary = new WordDictionary();
wordDictionary.addWord('bad');
wordDictionary.addWord('dad');
wordDictionary.addWord('mad');
wordDictionary.search('pad'); // false
wordDictionary.search('bad'); // true
wordDictionary.search('.ad'); // true ('.'은 어떤 문자든 매칭)
wordDictionary.search('b..'); // true
```

### 💻 **코드 + 주석**

```js
class WordDictionary {
  constructor() {
    this.root = new TrieNode();
  }
  
  addWord(word) {
    let node = this.root;
    for (let ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];
    }
    node.isWord = true;
  }
  
  search(word) {
    return this.dfs(this.root, word, 0);
  }
  
  dfs(node, word, index) {
    if (index === word.length) {
      return node.isWord;
    }
    
    let ch = word[index];
    
    if (ch === '.') {
      // 와일드카드: 모든 자식 노드 탐색
      for (let child in node.children) {
        if (this.dfs(node.children[child], word, index + 1)) {
          return true;
        }
      }
      return false;
    } else {
      // 일반 문자: 해당 자식 노드만 탐색
      if (!node.children[ch]) return false;
      return this.dfs(node.children[ch], word, index + 1);
    }
  }
}
```

---

## 📘 **문제 4: LeetCode 212. Word Search II**

> 2D 보드에서 주어진 단어들을 모두 찾아라.

### 💻 **코드 + 주석**

```js
// Word Search II (Trie + DFS)
function findWords(board, words) {
  let trie = new Trie();
  for (let word of words) {
    trie.insert(word);
  }
  
  let result = [];
  let rows = board.length;
  let cols = board[0].length;
  
  function dfs(r, c, node, path) {
    if (node.isWord) {
      result.push(path);
      node.isWord = false; // 중복 방지
    }
    
    if (r < 0 || c < 0 || r >= rows || c >= cols) return;
    if (board[r][c] === '#') return; // 이미 방문
    
    let ch = board[r][c];
    if (!node.children[ch]) return;
    
    let nextNode = node.children[ch];
    board[r][c] = '#'; // 방문 표시
    
    dfs(r + 1, c, nextNode, path + ch);
    dfs(r - 1, c, nextNode, path + ch);
    dfs(r, c + 1, nextNode, path + ch);
    dfs(r, c - 1, nextNode, path + ch);
    
    board[r][c] = ch; // 백트래킹
  }
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, trie.root, '');
    }
  }
  
  return result;
}
```

---

## ⚡ **핵심 포인트**

| 구분    | 내용                                          |
| ----- | ------------------------------------------- |
| 시간복잡도 | 삽입/검색: O(m) (m = 단어 길이)                                    |
| 공간복잡도  | O(ALPHABET_SIZE * N * M) (N = 단어 개수, M = 평균 단어 길이)                                    |
| 핵심 패턴  | TrieNode 구조, insert/search/startsWith 연산                         |
| 응용    | 자동완성, 사전, 접두사 검색, 문자열 집합 관리, Word Search 등 |

---

## 📝 스터디 문제 정리

<!-- 스터디에서 제공된 문제를 여기에 추가하세요 -->

---

