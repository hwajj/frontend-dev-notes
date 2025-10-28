//정렬된 배열에서 합이 target이 되는 두 수의 1-based 인덱스를 찾는 문제 풀이 (투 포인터)
function twoSum(numberArr: number[], targetNumber: number) {
  let left = 0,
    right = numberArr.length - 1;
  while (left < right) {
    let sum = numberArr[left] + numberArr[right];

    if (sum === targetNumber) return [left + 1, right + 1];
    else if (sum > targetNumber) right--;
    else left++;
  }
}

// Range Sum Query (prefix sum 활용)
// 배열에서 특정 구간 [l, r) 합을 O(1)에 구하기 위한 Prefix Sum 구축
function buildPrefixSum(numberArr: number[]) {
  let prefix = [0];

  for (let num of numberArr) {
    prefix.push(prefix[prefix.length - 1] + num);
  }
}
