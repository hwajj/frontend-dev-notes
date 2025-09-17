# ✅ 2주차: 해시맵(HashMap)

## (1) 빈도수 세기 (Counting with HashMap)

**Valid Anagram**

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

## (2) 보조 해시맵 탐색 (Two Sum)

**Two Sum**

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

---

## (3) 슬라이딩 윈도우 + 해시맵

**Longest Substring with At Most K Distinct Characters**

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
