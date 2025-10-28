// - LeetCode 55. Jump Game
// - LeetCode 45. Jump Game II
// - LeetCode 134. Gas Station
// - LeetCode 435. Non-overlapping Intervals
// - LeetCode 253. Meeting Rooms II
function canJump(nums: number[]): boolean {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}
