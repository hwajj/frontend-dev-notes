# ✅ 4주차: 실전 패턴 확장 & 탐색 테크닉

이번 주는 실전 문제에서 자주 쓰이는 고급 패턴과 탐색 기법을 익히는 것이 목표입니다.

---

## 1. 슬라이딩 윈도우 (확장 버전)

**등장 패턴:**

- 최소/최대 길이의 부분 문자열 찾기
- 조건을 만족하는 윈도우의 위치, 길이 구하기

**암기할 가치 있는 개념:**

- 윈도우 내 상태(카운트, 조건 등) 동적 관리
- Map/HashMap으로 필요 문자/조건 추적
- while문으로 윈도우 축소

**예시 코드: 최소 윈도우 서브스트링 찾기**
(예: LeetCode 76. Minimum Window Substring)

```js
// s에서 t의 모든 문자를 포함하는 최소 윈도우 찾기
let need = new Map();
for (let ch of t) need.set(ch, (need.get(ch) || 0) + 1);
let missing = t.length,
  l = 0,
  start = 0,
  minLen = Infinity;

for (let r = 0; r < s.length; r++) {
  if (need.has(s[r]) && need.get(s[r]) > 0) missing--;
  need.set(s[r], (need.get(s[r]) || 0) - 1);

  while (missing === 0) {
    if (r - l + 1 < minLen) [start, minLen] = [l, r - l + 1];
    need.set(s[l], (need.get(s[l]) || 0) + 1);
    if (need.get(s[l]) > 0) missing++;
    l++;
  }
}
return minLen === Infinity ? "" : s.substring(start, start + minLen);
```

**보충 설명:**

- 윈도우 내 상태(need, missing 등)를 실시간으로 관리
- while문으로 윈도우를 축소하며 최소 길이 갱신
- 투 포인터(l, r) 패턴과 Map 활용법 숙지

**추가 예시:**

- "최대 k개의 다른 문자만 포함하는 가장 긴 부분 문자열" 등 다양한 변형에 응용 가능

---

## 2. DFS / 백트래킹

**등장 패턴:**

- 모든 조합/순열/부분집합 생성
- 경로 탐색, 조건 만족하는 경우의 수 세기

**암기할 가치 있는 개념:**

- 재귀 호출, path 배열로 현재 상태 추적
- 백트래킹: 탐색 후 원상복구(pop)

**예시 코드: 모든 조합(Combination) 생성**
(예: LeetCode 77. Combinations)

```js
function combine(n, k) {
  let res = [],
    path = [];
  function dfs(start) {
    if (path.length === k) {
      res.push([...path]);
      return;
    }
    for (let i = start; i <= n; i++) {
      path.push(i);
      dfs(i + 1);
      path.pop();
    }
  }
  dfs(1);
  return res;
}
```

**보충 설명:**

- path.push, path.pop으로 상태 관리
- 순열, 부분집합, 조합 등 다양한 문제에 응용
- 방문 체크(visited 배열)로 중복 방지 가능

**추가 예시:**

- 순열(Permutation): for문에서 visited 체크
- 부분집합(Subset): dfs(index+1)로 포함/미포함 분기

---

## 3. BFS (큐)

**등장 패턴:**

- 그래프/트리의 최단 경로, 레벨별 탐색
- 상태 변화가 단계적으로 일어나는 문제

**암기할 가치 있는 개념:**

- queue(shift/push)로 레벨별 탐색
- visited 집합/배열로 중복 방문 방지

**예시 코드: 그래프의 최단 경로 길이**
(예: LeetCode 127. Word Ladder)

```js
function bfsShortestPath(start, end, graph) {
  let queue = [[start, 0]];
  let visited = new Set([start]);

  while (queue.length) {
    let [node, dist] = queue.shift();
    if (node === end) return dist;
    for (let nei of graph[node] || []) {
      if (!visited.has(nei)) {
        visited.add(nei);
        queue.push([nei, dist + 1]);
      }
    }
  }
  return -1;
}
```

**보충 설명:**

- queue.shift()는 O(N)이므로, 실제 대회/실무에서는 deque(LinkedList) 사용 권장
- 최단 경로, 레벨 탐색, 퍼지는 문제(불, 바이러스 등)에 자주 등장

**추가 예시:**

- 2차원 배열(미로, 토마토 등)에서 dx/dy로 상하좌우 이동
- 트리의 레벨 순회(level order traversal)

---

## 4. 이진 탐색 응용 (Lower Bound / Upper Bound)

**등장 패턴:**

- 조건을 만족하는 최소/최대값(인덱스) 찾기
- lower bound(이상), upper bound(초과) 위치 구하기

**암기할 가치 있는 개념:**

- while(l < r) 패턴 (l <= r 아님에 주의)
- mid 계산, 조건 분기

**예시 코드: 첫 번째 target 이상인 인덱스 찾기 (Lower Bound)**

```js
function lowerBound(nums, target) {
  let l = 0,
    r = nums.length;
  while (l < r) {
    let mid = Math.floor((l + r) / 2);
    if (nums[mid] < target) l = mid + 1;
    else r = mid;
  }
  return l;
}
```

**보충 설명:**

- lower bound: target 이상이 처음 등장하는 위치
- upper bound: target 초과가 처음 등장하는 위치 (if(nums[mid] <= target) l=mid+1; else r=mid;)
- 정렬된 배열에서 구간 개수, 삽입 위치, 조건부 최적화 등에 활용

**추가 예시:**

- upperBound 함수, bisect_left/bisect_right (Python)
- lower/upper bound를 활용한 파라메트릭 서치(최소/최대값 이분 탐색)
