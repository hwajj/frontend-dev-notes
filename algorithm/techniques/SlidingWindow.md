# 🪟 슬라이딩 윈도우 (Sliding Window)

> 주제: 슬라이딩 윈도우
> 목표: 각 알고리즘의 대표 문제를 예시로 개념, 입력·출력, 코드, 포인트까지 한눈에 보기

---

## 📍 핵심 개념 요약

| 개념                | 설명                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------- |
| **슬라이딩 윈도우** | 고정 크기 또는 가변 크기의 윈도우를 배열/문자열 위에서 이동시키며 문제를 해결하는 기법 |
| **주요 패턴**       | 확장형(조건 만족 전까지 확장), 고정형(고정 크기 윈도우)                                |
| **시간복잡도**      | O(n)                                                                                   |
| **활용 분야**       | 최장/최단 부분 문자열, 부분 배열 최적화, 빈도수 기반 문제 등                           |

---

## 📘 **문제 1: LeetCode 3. Longest Substring Without Repeating Characters**

> 반복되지 않는 가장 긴 부분 문자열의 길이를 구하는 문제

### 💬 **입출력 예시**

| 입력         | 출력 | 설명                                    |
| ------------ | ---- | --------------------------------------- |
| `"abcabcbb"` | `3`  | `"abc"` 가 가장 긴 중복 없는 부분문자열 |
| `"bbbbb"`    | `1`  | `"b"` 하나만 가능                       |
| `"pwwkew"`   | `3`  | `"wke"` 가 가장 길다                    |
| `""`         | `0`  | 빈 문자열은 길이 0                      |

### 💻 **코드 + 주석**

```ts
//슬라이딩 윈도우는 인덱스2개를 가지고 조작해서 가장 긴길이를 표현할수있음
// 문자열이 주어졌을 때, 반복되지 않는 가장 긴 부분 문자열의 길이를 구하는 문제 풀이
// (예시 문제)
// - LeetCode 3. Longest Substring Without Repeating Characters
// - LeetCode 159. Longest Substring with At Most Two Distinct Characters
// - LeetCode 340. Longest Substring with At Most K Distinct Characters
// - LeetCode 904. Fruit Into Baskets (= at most 2 distinct)
// - HackerRank: Two Characters (변형: 인접 문자 제약)
function lengthOfLongestSubstring(s: string): number {
  let set = new Set();
  let left = 0,
    maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    //cbadbceb의 두번째 b에서 중복 발견 시 윈도우를 앞으로 이동시켜 중복 제고
    //b가 2번째도 있고 5번째에도 있으면,
    //2번째 b를 가진 문자열을 최장으로 할것이냐, 5번째 b를 가진 문자열을 최장으로 할것이냐 골라야함
    //그러기위해선 left를 3번째까지 이동시켜 set안의 b 중복제거.
    // left를 이동시키기 위한 while문
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
```

**핵심 포인트:**

- Set 으로 현재 중복 없는 문자를 저장.
- left 와 right 포인터로 윈도우 구간을 확장.
- 중복 발견 시 left를 앞으로 이동시켜 중복 제거.
- 매번 윈도우 길이(right - left + 1)의 최댓값 갱신.

---

## 📘 **문제 2: LeetCode 76. Minimum Window Substring**

> 문자열 `s`, `t`가 주어질 때,
> `t`의 모든 문자를 포함하는 `s`의 가장 짧은 부분 문자열을 구하라.
> 없으면 `""`을 반환.

### 💬 **입출력 예시**

| 입력                               | 출력     |
| ---------------------------------- | -------- |
| s = `"ADOBECODEBANC"`, t = `"ABC"` | `"BANC"` |
| s = `"a"`, t = `"a"`               | `"a"`    |
| s = `"a"`, t = `"aa"`              | `""`     |

### 💻 **코드 + 주석**

```js
// ✅ 최소 윈도우 부분 문자열 (Minimum Window Substring)
let need = new Map(); // t의 각 문자의 필요 개수 저장
for (let ch of t) need.set(ch, (need.get(ch) || 0) + 1);

let missing = t.length; // 아직 채워야 할 문자의 수
let l = 0,
  start = 0,
  minLen = Infinity; // 포인터 및 결과 초기화

for (let r = 0; r < s.length; r++) {
  // 오른쪽 포인터 확장
  if (need.has(s[r]) && need.get(s[r]) > 0) missing--; // 필요한 문자 채움
  need.set(s[r], (need.get(s[r]) || 0) - 1);

  // 모든 문자를 다 포함했으면 왼쪽을 줄이며 최소 길이 탐색
  while (missing === 0) {
    if (r - l + 1 < minLen) [start, minLen] = [l, r - l + 1];
    need.set(s[l], (need.get(s[l]) || 0) + 1);
    if (need.get(s[l]) > 0) missing++; // 필요한 문자가 빠짐
    l++;
  }
}

return minLen === Infinity ? "" : s.substring(start, start + minLen);
```

**핵심 포인트:**

- 오른쪽 포인터는 조건 만족 전까지 확장
- 조건 만족 시 왼쪽 포인터로 축소하면서 최소 길이 갱신
- missing 변수로 필요한 문자 수 추적

---

## 📘 **문제 3: LeetCode 340. Longest Substring with At Most K Distinct Characters**

> 슬라이딩 윈도우 + 해시맵으로 윈도우 내 문자 빈도 관리 (고유 문자 K개 이하 최대 길이)

### 💻 **코드 + 주석**

```js
// Longest Substring with At Most K Distinct Characters
// 슬라이딩 윈도우 + 해시맵으로 윈도우 내 문자 빈도 관리 (고유 문자 K개 이하 최대 길이)
// (예시 문제)
// - LeetCode 159. Longest Substring with At Most Two Distinct Characters
// - LeetCode 340. Longest Substring with At Most K Distinct Characters
// - LeetCode 76. Minimum Window Substring (윈도우 조건 반전/복잡도↑)
// - LeetCode 438. Find All Anagrams in a String (고정 윈도우 길이)
// - LeetCode 424. Longest Repeating Character Replacement (최다빈도 추적 변형)
function lengthOfLongestSubstringKDistinct(s, k) {
  let map = new Map();
  let left = 0,
    maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    map.set(s[right], (map.get(s[right]) || 0) + 1);

    while (map.size > k) {
      map.set(s[left], map.get(s[left]) - 1);
      if (map.get(s[left]) === 0) map.delete(s[left]);
      left++;
    }

    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
```

---

## ⚡ **핵심 포인트**

| 구분        | 내용                                            |
| ----------- | ----------------------------------------------- |
| 시간복잡도  | O(N)                                            |
| 핵심 키워드 | 윈도우 확장 + 축소, 문자 개수 추적              |
| 응용        | Find Anagrams, Longest Substring Without Repeat |

---

## 📝 스터디 문제 정리

<!-- 스터디에서 제공된 문제를 여기에 추가하세요 -->

---
