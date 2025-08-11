# ✅ 5주차: 패턴 조합 & 실전 심화 문제

이번 주는 여러 기본 패턴을 조합해서 푸는 실전형 문제에 익숙해지는 것이 목표입니다. (LeetCode Medium, 코딩테스트 실전에서 자주 등장)

---

## 1. 슬라이딩 윈도우 + 해시맵 고급

**등장 패턴:**

- 윈도우 내 문자/원소의 빈도 관리
- 조건 충족 시 윈도우 축소/확장

**암기할 가치 있는 개념:**

- Map/HashMap으로 윈도우 내 상태 추적
- count, need 등 변수로 조건 관리
- while문으로 윈도우 축소

**예시 코드: 모든 아나그램의 시작 인덱스 찾기**
(LeetCode 438. Find All Anagrams in a String)

```js
function findAnagrams(s, p) {
  let need = new Map();
  for (let ch of p) need.set(ch, (need.get(ch) || 0) + 1);
  let left = 0,
    right = 0,
    count = need.size;
  let res = [];

  while (right < s.length) {
    if (need.has(s[right])) {
      need.set(s[right], need.get(s[right]) - 1);
      if (need.get(s[right]) === 0) count--;
    }
    right++;

    while (count === 0) {
      if (right - left === p.length) res.push(left);
      if (need.has(s[left])) {
        if (need.get(s[left]) === 0) count++;
        need.set(s[left], need.get(s[left]) + 1);
      }
      left++;
    }
  }
  return res;
}
```

**보충 설명:**

- 윈도우 내 상태(need, count 등)를 실시간으로 관리
- 아나그램, 최소/최대 길이, 조건부 부분 문자열 등 다양한 문제에 응용
- LeetCode 424. Longest Repeating Character Replacement 등도 유사 패턴

---

## 2. DFS + 백트래킹 심화

**등장 패턴:**

- 모든 순열, 부분집합, 조합, 조합의 합 등
- 경로 저장, 탐색 후 복귀(pop)

**암기할 가치 있는 개념:**

- used/visited 배열로 중복 방지
- path 배열로 현재 경로 추적
- 재귀 호출/백트래킹 패턴 숙지

**예시 코드: 모든 순열(Permutations) 생성**
(LeetCode 46. Permutations)

```js
function permute(nums) {
  let res = [];
  function dfs(path, used) {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      dfs(path, used);
      path.pop();
      used[i] = false;
    }
  }
  dfs([], Array(nums.length).fill(false));
  return res;
}
```

**보충 설명:**

- 부분집합(LeetCode 78. Subsets), 조합의 합(LeetCode 39. Combination Sum) 등도 유사 패턴
- path.push/pop, used/visited 관리가 핵심
- 재귀 호출의 깊이와 상태 복구에 주의

---

## 3. 그래프 탐색 심화 (DFS/BFS)

**등장 패턴:**

- 연결된 노드(셀) 그룹 찾기
- 2차원 배열(그래프, 지도)에서 영역/섬/구역 개수 세기

**암기할 가치 있는 개념:**

- DFS/BFS로 방문 체크하며 연결된 영역 탐색
- 2차원 배열에서 상하좌우 이동(dx/dy)

**예시 코드: 섬의 개수 세기**
(LeetCode 200. Number of Islands)

```js
function numIslands(grid) {
  let count = 0;
  let rows = grid.length,
    cols = grid[0].length;

  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === "0") return;
    grid[r][c] = "0";
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}
```

**보충 설명:**

- BFS로도 풀이 가능(큐 사용)
- 2차원 배열에서 visited 배열을 따로 두거나, 원본을 변경(grid[r][c]='0')하는 방식 모두 가능
- LeetCode 695. Max Area of Island: 영역의 최대 크기 구하기 등도 유사

---

## 4. 이진 탐색 + 조건 검사

**등장 패턴:**

- 답의 범위를 이분탐색으로 줄여가며 조건 만족 여부 확인
- Parametric Search(최소/최대값 찾기)

**암기할 가치 있는 개념:**

- canXXX 함수로 조건 검사
- mid 계산, while(l <= r) 패턴

**예시 코드: 최소 속도로 바나나 먹기**
(LeetCode 875. Koko Eating Bananas)

```js
function minEatingSpeed(piles, h) {
  let l = 1,
    r = Math.max(...piles);
  let res = r;

  function canEat(speed) {
    let hours = 0;
    for (let pile of piles) {
      hours += Math.ceil(pile / speed);
    }
    return hours <= h;
  }

  while (l <= r) {
    let mid = Math.floor((l + r) / 2);
    if (canEat(mid)) {
      res = mid;
      r = mid - 1;
    } else {
      l = mid + 1;
    }
  }
  return res;
}
```

**보충 설명:**

- 조건 함수(canEat, canShip 등)로 mid값의 가능 여부 판단
- LeetCode 1011. Capacity To Ship Packages Within D Days 등도 유사
- Parametric Search(조건부 최적화) 문제에 자주 등장

---

## 📅 5주차 학습 플랜

- **Day 1-2:** 슬라이딩 윈도우 고급 (Find All Anagrams, Character Replacement)
- **Day 3-4:** 백트래킹 심화 (Permutations, Subsets, Combination Sum)
- **Day 5:** 그래프 탐색 심화 (Number of Islands, Max Area of Island)
- **Day 6-7:** 이진 탐색 응용 (Koko Eating Bananas, Shipping Packages)

**실전 팁:**

- 여러 패턴을 조합하는 문제에 익숙해질 것
- 각 패턴별로 "상태 관리"와 "조건 분기"를 명확히 연습
- 문제를 풀 때, 먼저 어떤 패턴(슬라이딩 윈도우, 백트래킹, 이분탐색 등)이 필요한지 분해해보는 습관을 들이세요.
