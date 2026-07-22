# SPA 로그아웃 — 버튼 눌렀는데 왜 안 나가지?

> 작성일: 2026-05-29 (갱신)  
> 맥락: 사이드바「로그아웃」을 눌렀는데 같은 화면에 남거나, API는 계속 되는 것처럼 보일 때.

---

## 먼저 이것만 — 로그아웃은 **한 함수**가 아니다

이 앱은 로그인 정보를 **두 군데**에 둔다.

| 어디 | 뭐가 들어 있나 | 비유 |
|------|----------------|------|
| **Zustand** (`auth-store`) | `user`, `isAuthenticated` — **지금 화면**이 “로그인됨”인지 | 작업대 |
| **localStorage** (`tokenStore`) | access/refresh 토큰, user JSON — **새로고침 후에도** 남음 | 서랍 |

로그아웃을 **제대로** 하려면 둘 다 비우고, (가능하면) 서버에 알리고, 로그인 페이지로 보내야 한다.

### `clearAuth()`만 누르면?

**Zustand 작업대만 치운다.** 서랍(localStorage) 토큰은 그대로다.

```27:28:src/stores/auth-store.ts
  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),
```

그다음 API를 부르면?

```13:18:src/lib/api/client.ts
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**axios는 Zustand를 안 본다.** `tokenStore`(localStorage)에서 토큰을 꺼내 `Authorization` 헤더에 붙인다.  
→ 화면에서 이름이 사라져도 **네트워크는 로그인 사용자**일 수 있다.

### `logout()` 훅을 쓰면?

**순서대로** 서버 → 서랍 → 작업대 → 페이지 이동.

```62:69:src/hooks/useNursingAuth.ts
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      tokenStore.clearAll();
      clearAuth();
      navigate('/login-nursing');
    }
  }, [clearAuth, navigate]);
```

| 단계 | 하는 일 |
|------|---------|
| `logoutApi()` | `POST /auth/logout` (MVP는 OK만 반환) |
| `tokenStore.clearAll()` | localStorage 토큰·user **삭제** |
| `clearAuth()` | Zustand 메모리 **삭제** |
| `navigate(...)` | 로그인 화면으로 **이동** |

물류·관리자는 `useAuth().logout` — 마지막만 `/login`으로 간다.

### 한 표로 비교

| | `clearAuth`만 | `logout()` 훅 |
|---|---------------|---------------|
| 화면 메모리 (Zustand) | ✅ 지움 | ✅ 지움 |
| localStorage 토큰 | ❌ **남음** | ✅ 지움 |
| 서버 `/auth/logout` | ❌ | ✅ |
| 로그인 페이지 이동 | Guard·navigate에 따름 | ✅ 명시 이동 |
| API 요청 | **토큰 남으면 계속** | 토큰 없음 → 401 |

---

## 내가 헷갈렸던 점

- 버튼 눌렀는데 왜 같은 URL에 남지? → **`clearAuth`만** 연결됐거나, Guard가 redirect하기 전 상태.
- `clearAuth` 했는데 API 되는 것 같다 → **localStorage 토큰**이 아직 있음 (위 axios 코드).
- 요양원만 이상한가? → **예전**엔 Guard 밖 DEV 라우트였음. **지금**은 Guard **안** (아래 §3).

---

## 왜 로그인은 두 군데에 저장하나

**로그인할 때** 둘 다 채운다.

- Zustand → Header·Guard가 “지금 누구?”를 **빠르게** 읽음.
- localStorage → **새로고침**해도 `refreshToken`으로 `/auth/refresh` 후 다시 로그인 상태 복구.

**로그아웃 = 로그인의 역순.** 한쪽만 비우면 “반쯤 로그아웃”이다.

`tokenStore.clearAll()` — 서랍 비우기:

```60:65:src/lib/auth/token-store.ts
  clearAll(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(USER_KEY);
  },
```

---

## 사이드바 버튼 — 뭐가 연결돼 있나 (2026-05-29 기준)

| 사이드바 | 로그아웃 연결 | 상태 |
|----------|---------------|------|
| **NHSidebar** (요양원) | `useNursingAuth().logout` | ✅ 완전 로그아웃 |
| **Sidebar** (물류) | `clearAuth`만 | ⚠️ 토큰 남음 |
| **AdminSidebar** | `clearAuth`만 | ⚠️ 토큰 남음 |

**요양원 — 올바른 연결**

```75:75:src/components/layout/NHSidebar.tsx
  const { logout } = useNursingAuth();
```

```183:185:src/components/layout/NHSidebar.tsx
        <button
          type="button"
          onClick={() => void logout()}
```

**물류 — 아직 `clearAuth`만 (수정 후보)**

```39:39:src/components/layout/Sidebar.tsx
  const clearAuth = useAuthStore((s) => s.clearAuth);
```

→ `const { logout } = useAuth()` + `onClick={() => void logout()}` 로 바꾸는 게 맞다.

**왜 훅을 써야 하나** — 로그아웃은 async + API + storage + navigate가 묶여 있다. store 액션 한 줄로는 **절반만** 된다.

---

## AuthGuard — “로그인 페이지로 보내는 문”

`isAuthenticated === false` 이면 로그인 화면으로 보낸다.

```16:21:src/components/guards/AuthGuard.tsx
  if (!isAuthenticated) {
    const loginPath = location.pathname.startsWith('/nursing-hospital')
      ? '/login-nursing'
      : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }
```

- **물류** `clearAuth`만 해도 → Guard가 **`/login`으로 보내서** “나간 것처럼” 보일 수 있다.  
  **하지만** localStorage 토큰이 남으면 새로고침 시 **다시 로그인 복구**될 수 있다.
- **요양원** 라우트는 `App.tsx`에서 Guard **안**에 있다 (물류·요양원·admin 동일 블록).

```56:56:src/App.tsx
    <Route element={<AuthGuard />}>
```

```95:119:src/App.tsx
      {/* 요양원 관리자 */}
      <Route element={<NHDashboardLayout />}>
        ...
        <Route path="/nursing-hospital/usage-statistics" element={<StatsDashboardPage />} />
      </Route>
    </Route>
```

**예전 문서 주의:** DEV용으로 Guard **밖**에 두었던 시절엔 `clearAuth`만으로 URL이 안 바뀌었다. **지금 코드는 Guard 안.**

---

## 집에서 확인하는 방법

1. F12 → **Application → Local Storage** — `carenation_access_token` 있는지.
2. 로그아웃 클릭 후 토큰 키가 **사라졌는지**.
3. Network — API 요청 **Request Headers**에 `Authorization: Bearer ...` **아직 있는지**.
4. 사이드바 코드 — `clearAuth`인지 `logout()`인지 (위 표).

| 증상 | 흔한 원인 |
|------|-----------|
| 화면만 비고 API 됨 | `clearAuth`만 + localStorage 토큰 남음 |
| 로그인 페이지로 안 감 (과거) | Guard 밖 DEV 라우트 |
| 로그아웃 후 새로고침하면 다시 로그인 | `tokenStore.clearAll()` 안 함 |

---

## 면접 한 줄

SPA 로그아웃은 **메모리 state + persistent storage + (서버) + 라우팅**을 같이 끊어야 한다. axios가 storage에서 토큰을 읽으면 `clearAuth`만으로는 네트워크 인증이 남는다.
