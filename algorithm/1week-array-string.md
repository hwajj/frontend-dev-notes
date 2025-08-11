# ✅ 1주차: 배열(Array) / 문자열(String)

## (1) 슬라이딩 윈도우 (Sliding Window)

**Longest Substring Without Repeating Characters**

```js
// Longest Substring Without Repeating Characters
function lengthOfLongestSubstring(s) {
  let set = new Set();
  let left = 0,
    maxLen = 0;

  for (let right = 0; right < s.length; right++) {
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

---

## (2) 투 포인터 (Two Pointers)

**Two Sum II - Input Array Is Sorted**

```js
// Two Sum II - Input Array Is Sorted
function twoSum(numbers, target) {
  let left = 0,
    right = numbers.length - 1;

  while (left < right) {
    let sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1]; // 1-based index
    else if (sum < target) left++;
    else right--;
  }
  return [];
}
```

---

## (3) 누적합 (Prefix Sum)

**Range Sum Query (prefix sum 활용)**

```js
// Range Sum Query (prefix sum 활용)
function buildPrefixSum(nums) {
  let prefix = [0];
  for (let num of nums) {
    prefix.push(prefix[prefix.length - 1] + num);
  }
  return prefix;
}

function rangeSum(prefix, l, r) {
  return prefix[r] - prefix[l];
}
```
