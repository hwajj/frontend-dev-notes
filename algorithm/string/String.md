# 📝 문자열 (String)

> 주제: 문자열 처리
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념        | 설명                                       |
| --------- | ---------------------------------------- |
| **문자열 처리**   | 문자열 검색, 패턴 매칭, 변환, 파싱 등          |
| **주요 기법**  | 해시맵(빈도수), 투포인터, 슬라이딩 윈도우, 정규표현식 등             |
| **활용 분야**    | 애너그램, 회문, 문자열 변환, 패턴 매칭 등        |

---

## 📘 **문제: LeetCode 242. Valid Anagram**

> 두 문자열이 애너그램인지(문자 빈도 동일) 판별하는 문제

### 💬 **입출력 예시**

| 입력                    | 출력    |
| --------------------- | ----- |
| `s = "anagram", t = "nagaram"` | `true` |
| `s = "rat", t = "car"` | `false` |

### 💻 **코드 + 주석**

```js
// Valid Anagram
// 두 문자열이 애너그램인지(문자 빈도 동일) 판별하는 문제 풀이 (해시맵 빈도수)
// (예시 문제)
// - LeetCode 242. Valid Anagram
// - LeetCode 383. Ransom Note
// - LeetCode 387. First Unique Character in a String
// - HackerRank: Sherlock and the Valid String
// - LeetCode 49. Group Anagrams (확장: 해시 키 설계)
function isAnagram(s, t) {
  if (s.length !== t.length) return false;

  let map = new Map();
  for (let ch of s) {
    map.set(ch, (map.get(ch) || 0) + 1);
  }
  for (let ch of t) {
    if (!map.has(ch)) return false;
    map.set(ch, map.get(ch) - 1);
    if (map.get(ch) === 0) map.delete(ch);
  }
  return map.size === 0;
}
```

---

## 📘 **문제: LeetCode 125. Valid Palindrome**

> 문자열이 회문인지 판별 (대소문자 무시, 영숫자만 고려)

### 💬 **입출력 예시**

| 입력                    | 출력    |
| --------------------- | ----- |
| `"A man, a plan, a canal: Panama"` | `true` |
| `"race a car"` | `false` |

### 💻 **코드 + 주석**

```js
// 투포인터로 회문 검사
function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  
  while (left < right) {
    // 영숫자가 아닌 문자 건너뛰기
    while (left < right && !/[a-zA-Z0-9]/.test(s[left])) left++;
    while (left < right && !/[a-zA-Z0-9]/.test(s[right])) right--;
    
    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }
    left++;
    right--;
  }
  
  return true;
}
```

---

## 📘 **문제: 프로그래머스 Lv1. 숫자 문자열과 영단어**

> 문자열 `s`에 숫자와 숫자를 의미하는 영단어(`zero`~`nine`)가 섞여 있다. 영단어를 숫자로 변환해 원래 숫자를 반환한다.

### 💬 **입출력 예시**

| 입력                  | 출력    |
| --------------------- | ------- |
| `"one4seveneight"`    | `1478`  |
| `"23four5six7"`       | `234567`|
| `"2three45sixseven"`  | `234567`|
| `"123"`               | `123`   |

### 💻 **코드 + 주석**

```js
// 숫자 문자열과 영단어
// 영단어를 해당 숫자 문자열로 치환한 뒤 Number로 변환
// (예시 문제)
// - 프로그래머스 Lv1. 숫자 문자열과 영단어
function solution(s) {
  const words = [
    "zero", "one", "two", "three", "four",
    "five", "six", "seven", "eight", "nine",
  ];

  for (let i = 0; i < words.length; i++) {
    s = s.split(words[i]).join(String(i));
  }

  return Number(s);
}
```

**설명:**

- `split(영단어).join(숫자)`로 해당 토큰만 숫자 문자로 바꿀 수 있다.
- s는 `"zero"` 또는 `"0"`으로 시작하지 않으므로, 치환 후에도 앞자리 0 문제는 없다.
- s 길이 ≤ 50이므로 단순 치환으로 충분하다.

---

## ⚡ **핵심 포인트**

| 구분    | 내용                                          |
| ----- | ------------------------------------------- |
| 시간복잡도 | 대부분 O(n)                                    |
| 주요 기법  | 해시맵(빈도수), 투포인터, 정규표현식, split/join 치환 |
| 응용    | 애너그램, 회문, 문자열 변환, 패턴 매칭, 토큰 치환 등 |

---

## 📝 스터디 문제 정리

- 프로그래머스 Lv1. 숫자 문자열과 영단어

---

