# 🗺️ 해시맵 (HashMap)

> 주제: 해시맵
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념        | 설명                                       |
| --------- | ---------------------------------------- |
| **해시맵**   | 키-값 쌍을 저장하는 자료구조, 평균 O(1) 시간에 조회/삽입/삭제 가능          |
| **주요 활용**  | 빈도수 세기, 빠른 조회, 중복 체크, 보조 자료구조로 활용             |
| **시간복잡도**    | 평균 O(1), 최악 O(n)        |
| **활용 분야** | Two Sum, 애너그램, 빈도수 기반 문제, 캐싱 등 |

---

## 📘 **문제 1: 빈도수 세기 (Counting with HashMap)**

### 💻 **코드 + 주석**

```js
// 배열에서 각 원소의 빈도수 세기
// (예시 문제)
// - LeetCode 1. Two Sum
// - LeetCode 387. First Unique Character in a String
// - LeetCode 49. Group Anagrams
// - LeetCode 242. Valid Anagram
// - HackerRank: Sherlock and the Valid String
function countFrequencies(nums) {
  let map = new Map();
  for (let num of nums) {
    map.set(num, (map.get(num) || 0) + 1);
  }
  return map;
}
```

**보충 설명:**
- `map.get(num) || 0` 패턴은 자주 쓰임
- Object도 가능하지만, Map이 더 안전(키 타입 제한 없음)

---

## 📘 **문제 2: LeetCode 1. Two Sum**

> 배열에서 합이 target이 되는 두 수의 인덱스를 찾는 문제

### 💬 **입출력 예시**

| 입력                    | 출력      |
| --------------------- | ------- |
| `nums = [2,7,11,15], target = 9` | `[0,1]` |

### 💻 **코드 + 주석**

```js
// Two Sum
// 배열에서 합이 target이 되는 두 수의 인덱스를 찾는 문제 풀이 (해시맵 보조 탐색)
// (예시 문제)
// - LeetCode 1. Two Sum
// - LeetCode 219. Contains Duplicate II (값-최근인덱스 맵 응용)
// - LeetCode 217. Contains Duplicate (해시셋 응용)
// - LeetCode 454. 4Sum II (두 배열 합 빈도 맵)
// - HackerRank: Ice Cream Parlor
function twoSum(nums, target) {
  let map = new Map();

  for (let i = 0; i < nums.length; i++) {
    let complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
```

**핵심 포인트:**
- 한 번의 순회로 해결 (O(n))
- complement = target - nums[i]를 이전에 본 적이 있는지 확인

---

## 📘 **문제 3: LeetCode 242. Valid Anagram**

> 두 문자열이 애너그램인지(문자 빈도 동일) 판별

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

## ⚡ **핵심 포인트**

| 구분    | 내용                                          |
| ----- | ------------------------------------------- |
| 시간복잡도 | 평균 O(1) 조회/삽입/삭제                                    |
| 주요 패턴  | 빈도수 세기, 보조 자료구조, 중복 체크                                    |
| 응용    | Two Sum, 애너그램, 빈도수 기반 문제, 캐싱 등 |

---

## 📝 스터디 문제 정리

<!-- 스터디에서 제공된 문제를 여기에 추가하세요 -->

---

