# ✅ 2주차: 해시맵(HashMap)

## (1) 빈도수 세기 (Counting with HashMap)

**Valid Anagram**

```js
// Valid Anagram
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
