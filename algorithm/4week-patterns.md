**4주차**
* Sliding Window 확장 / DFS-Backtracking / BFS / Binary Search 응용


## 1. 슬라이딩 윈도우 (확장 버전)

```js
// 문자열에서 최소 윈도우 서브스트링 찾기
// (예: LeetCode 76. Minimum Window Substring)
let need = new Map();
for (let ch of t) need.set(ch, (need.get(ch)||0)+1);
let missing = t.length, l=0, start=0, minLen=Infinity;

for (let r=0; r<s.length; r++) {
  if (need.has(s[r]) && need.get(s[r])>0) missing--;
  need.set(s[r], (need.get(s[r])||0)-1);

  while (missing===0) {
    if (r-l+1 < minLen) [start,minLen]=[l,r-l+1];
    need.set(s[l], (need.get(s[l])||0)+1);
    if (need.get(s[l])>0) missing++;
    l++;
  }
}
return minLen===Infinity ? "" : s.substring(start,start+minLen);
```

---

## 2. DFS / 백트래킹

```js
// 모든 조합(Combination) 생성
// (예: LeetCode 77. Combinations)
function combine(n,k) {
  let res=[], path=[];
  function dfs(start) {
    if (path.length===k) {
      res.push([...path]);
      return;
    }
    for (let i=start; i<=n; i++) {
      path.push(i);
      dfs(i+1);
      path.pop();
    }
  }
  dfs(1);
  return res;
}
```

---

## 3. BFS (큐)

```js
// 그래프의 최단 경로 길이
// (예: LeetCode 127. Word Ladder)
function bfsShortestPath(start, end, graph) {
  let queue=[[start,0]];
  let visited=new Set([start]);

  while(queue.length) {
    let [node,dist]=queue.shift();
    if (node===end) return dist;
    for (let nei of graph[node]||[]) {
      if (!visited.has(nei)) {
        visited.add(nei);
        queue.push([nei,dist+1]);
      }
    }
  }
  return -1;
}
```

---

## 4. 이진 탐색 응용 (Lower Bound / Upper Bound)

```js
// 첫 번째 target 이상인 인덱스 찾기 (Lower Bound)
function lowerBound(nums,target) {
  let l=0,r=nums.length;
  while(l<r){
    let mid=Math.floor((l+r)/2);
    if(nums[mid]<target) l=mid+1;
    else r=mid;
  }
  return l;
}
```

---

