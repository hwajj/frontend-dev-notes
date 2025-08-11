//슬라이딩 윈도우는 인덱스2개를 가지고 조작해서 가장 긴길이를 표현할수있음

function lengthOfLongestSubstring(s: string): number {
  let set = new Set();
  let left = 0,
    maxLen = 0;
  for (let right = 0; right < s.length - 1; right++) {
    //r 인덱스가 set에 있는것을 가리키면 l인덱스를 r까지 당김
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    //아니면
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
