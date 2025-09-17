# ✅ 1주차: 배열(Array) / 문자열(String)

## (1) 슬라이딩 윈도우 (Sliding Window)

**Longest Substring Without Repeating Characters**

```js
// 문자열이 주어졌을 때, 반복되지 않는 가장 긴 부분 문자열의 길이를 구하는 문제 풀이
// (예시 문제)
// - LeetCode 3. Longest Substring Without Repeating Characters
// - LeetCode 159. Longest Substring with At Most Two Distinct Characters
// - LeetCode 340. Longest Substring with At Most K Distinct Characters
// - LeetCode 904. Fruit Into Baskets (= at most 2 distinct)
// - HackerRank: Two Characters (변형: 인접 문자 제약)
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
// 정렬된 배열에서 합이 target이 되는 두 수의 1-based 인덱스를 찾는 문제 풀이 (투 포인터)
// (예시 문제)
// - LeetCode 167. Two Sum II (Input Array Is Sorted)
// - LeetCode 125. Valid Palindrome (양끝 포인터 응용)
// - LeetCode 344. Reverse String (양끝 스왑)
// - HackerRank: Pairs (정렬 후 투 포인터/이분탐색 응용)
// - LeetCode 11. Container With Most Water (양끝 좁혀오기)
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
// 배열에서 특정 구간 [l, r) 합을 O(1)에 구하기 위한 Prefix Sum 구축
// (예시 문제)
// - LeetCode 303. Range Sum Query - Immutable
// - LeetCode 325. Maximum Size Subarray Sum Equals k (prefix+hash 응용)
// - LeetCode 560. Subarray Sum Equals K (prefix+hash 응용)
// - HackerRank: Subarray Division (Birthday Chocolate)
// - LeetCode 238. Product of Array Except Self (합이 아닌 곱의 누적 응용)
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
