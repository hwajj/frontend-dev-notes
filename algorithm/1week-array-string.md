# ✅ 1주차: 배열(Array) / 문자열(String)

## (1) 슬라이딩 윈도우 (Sliding Window)

**Longest Substring Without Repeating Characters**

```ts
// 문자열이 주어졌을 때, 반복되지 않는 가장 긴 부분 문자열의 길이를 구하는 문제 풀이
// (예시 문제)
// - LeetCode 3. Longest Substring Without Repeating Characters
// - LeetCode 159. Longest Substring with At Most Two Distinct Characters
// - LeetCode 340. Longest Substring with At Most K Distinct Characters
// - LeetCode 904. Fruit Into Baskets (= at most 2 distinct)
// - HackerRank: Two Characters (변형: 인접 문자 제약)
function lengthOfLongestSubstring(s : string) :number{
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
| 입력           | 출력  | 설명                         |
| ------------ | --- | -------------------------- |
| `"abcabcbb"` | `3` | `"abc"` 가 가장 긴 중복 없는 부분문자열 |
| `"bbbbb"`    | `1` | `"b"` 하나만 가능               |
| `"pwwkew"`   | `3` | `"wke"` 가 가장 길다            |
| `""`         | `0` | 빈 문자열은 길이 0                |


- Set 으로 현재 중복 없는 문자를 저장.
- left 와 right 포인터로 윈도우 구간을 확장.
- 중복 발견 시 left를 앞으로 이동시켜 중복 제거.
- 매번 윈도우 길이(right - left + 1)의 최댓값 갱신.
---

## (2) 투 포인터 (Two Pointers)

**Two Sum II - Input Array Is Sorted**

```ts
// 정렬된 배열에서 합이 target이 되는 두 수의 1-based 인덱스를 찾는 문제 풀이 (투 포인터)
// (예시 문제)
// - LeetCode 167. Two Sum II (Input Array Is Sorted)
// - LeetCode 125. Valid Palindrome (양끝 포인터 응용)
// - LeetCode 344. Reverse String (양끝 스왑)
// - HackerRank: Pairs (정렬 후 투 포인터/이분탐색 응용)
// - LeetCode 11. Container With Most Water (양끝 좁혀오기)
function twoSum(numbers:number[], target: number):number {
  //left , right 가 양끝
  let left = 0,
    right = numbers.length - 1;

  while (left < right) {
    let sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1]; // 1-based index
    // 합이 너무 작으면 left를 오른쪽으로 옮기고,
    else if (sum < target) left++;
    //    합이 너무 크면 right를 왼쪽으로 옮김
    else right--;
  }
  return [];
}
```

| 입력                                  | 출력      | 설명          |
| ----------------------------------- | ------- | ----------- |
| `numbers = [2,7,11,15], target = 9` | `[1,2]` | 2 + 7 = 9   |
| `numbers = [2,3,4], target = 6`     | `[1,3]` | 2 + 4 = 6   |
| `numbers = [-1,0], target = -1`     | `[1,2]` | -1 + 0 = -1 |

- 배열이 정렬되어 있으므로,
  합이 너무 작으면 left를 오른쪽으로 옮기고,
  합이 너무 크면 right를 왼쪽으로 옮김.

조건에 맞는 두 수를 찾으면 그 인덱스를 반환.

---

## (3) 누적합 (Prefix Sum)

**Range Sum Query (prefix sum 활용)**

```ts
// Range Sum Query (prefix sum 활용)
// 배열에서 특정 구간 [l, r) 합을 O(1)에 구하기 위한 Prefix Sum 구축
// (예시 문제)
// - LeetCode 303. Range Sum Query - Immutable
// - LeetCode 325. Maximum Size Subarray Sum Equals k (prefix+hash 응용)
// - LeetCode 560. Subarray Sum Equals K (prefix+hash 응용)
// - HackerRank: Subarray Division (Birthday Chocolate)
// - LeetCode 238. Product of Array Except Self (합이 아닌 곱의 누적 응용)
function buildPrefixSum(nums: number[]) : number[]{
  let prefix = [0];
  for (let num of nums) {
    prefix.push(prefix[prefix.length - 1] + num);
  }
  return prefix;
}

function rangeSum(prefix :number[], l: number, r: number) : number {
  return prefix[r] - prefix[l];
}
```
