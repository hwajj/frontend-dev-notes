# JWT — Storage와 API를 나눈 이유

> 작성일: 2026-05-29  
> 맥락: access/refresh를 **어디에 저장할지**(쿠키·localStorage)와 **재발급 URL**이 앱마다 다른데, 인증 로직을 한 라이브러리에 묶고 싶다.

## 먼저 이것만

1. **JwtStorage** — 토큰 읽기·쓰기·삭제만 (저장소 구현은 앱이 제공).
2. **JwtAuthAPI** — login·`reissueAccessToken`만 (서버 URL·요청 형식은 앱이 제공).
3. **JwtAuthService** — 만료 검사·재발급 **순서**·동시 재발급 방지 — 앱 시작 시 `register`로 한 번 연결.

## 이 글의 질문

- 라이브러리가 localStorage에 직접 넣으면 안 되나?
- axios 인터셉터와 어떻게 나누나?

## 핵심 (먼저 읽기)

| 계층 | 책임 | 앱마다 다름 |
|------|------|-------------|
| Storage | `get` / `update` / `clear` | httpOnly 쿠키 vs localStorage |
| Auth API | login, refresh API 호출 | 엔드포인트·body |
| Service | exp 검사, reissue, race 가드 | 공통 흐름 |

## 전제 (30초)

- **Access token**: 짧음 — API `Authorization` 헤더.
- **Refresh token**: 김 — access 재발급용.
- **JWT payload**: `exp` 등 — 디코드해서 만료 판단 (서명 검증은 서버).

## 한눈에

```
[앱 시작]
  JwtAuthService.register(myStorage, myAuthApi)

[API 요청 전 — 인터셉터 개념]
  tokens ← storage.get()
  access 만료? → newAccess ← authApi.reissueAccessToken(refresh)
              → storage.update({ accessToken: newAccess, refreshToken })
  헤더에 access 붙여 요청

[로그아웃]
  storage.clear()
```

## 용어 (이 글에서만)

| 용어 | 한 줄 뜻 |
|------|----------|
| `register` | Storage + API 구현체를 서비스에 **주입** |
| `#isUnderReissuance` | refresh **동시 두 번** 방지 플래그 |
| `onReissueError` | 재발급 실패 시 로그아웃 등 앱 처리 |

## 함정 한 가지

**착각**: 공유 패키지가 `localStorage.setItem`까지 하면 편하다.  
**실제**: httpOnly·웹뷰·SSR 정책이 달라 **저장은 앱 책임**, 패키지는 **흐름만** 공유하는 편이 안전하다.

## 왜 이렇게인가

Storage와 HTTP를 한 클래스에 묶으면 테스트·모킹이 어렵고, 쿠키 앱과 SPA 앱이 같은 코드를 쓰기 힘들다. static `register`는 간단한 DI다. 401이 연속될 때 refresh가 **연쇄 호출**되면 서버·클라이언트 모두 불안정해져, 재발급 중 플래그로 막는다.

## 실무 체크포인트

### 앱이 구현할 interface (개념)

```typescript
abstract class JwtStorage {
  abstract get(): Promise<{ accessToken: string | null; refreshToken: string | null }>;
  abstract update(tokens: { accessToken: string; refreshToken: string }): void;
  abstract clear(): void;
}

abstract class JwtAuthAPI {
  abstract login(credentials: unknown): Promise<{ accessToken: string; refreshToken: string }>;
  abstract reissueAccessToken(refreshToken: string): Promise<string>; // 새 access만
}
```

### localStorage 예 (앱 코드)

```typescript
class LocalStorageJwt implements JwtStorage {
  async get() {
    return {
      accessToken: localStorage.getItem('access'),
      refreshToken: localStorage.getItem('refresh'),
    };
  }
  update({ accessToken, refreshToken }) {
    localStorage.setItem('access', accessToken);
    localStorage.setItem('refresh', refreshToken);
  }
  clear() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }
}
```

### 등록 + 만료 검사 (개념)

```typescript
JwtAuthService.register(new LocalStorageJwt(), new MyAuthAPI());

const auth = new JwtAuthService();
const { accessToken } = await auth.get();
JwtAuthService.throwIfExpired(accessToken); // exp 초과 시 throw

// 401 인터셉터 안에서
const newAccess = await auth.reissue();
```

### Before / After — 책임 분리

| 한 클래스에 전부 | Storage / API / Service 분리 |
|------------------|------------------------------|
| 쿠키 앱에서 fork | Storage만 `CookieJwt`로 교체 |
| 단위 테스트 어려움 | Storage·API 각각 mock |

## 참고 코드 — 추상 클래스 (요지)

```typescript
export abstract class JwtStorage {
  abstract get(): Promise<Tokens>;
  abstract update(payload: Tokens): void;
  abstract clear(): void;
}

export abstract class JwtAuthAPI {
  abstract login(...args: unknown[]): Promise<LoginResponse>;
  abstract reissueAccessToken(refreshToken: string): Promise<string>;
}
```

## 부록 — backoffice-shared

`@backoffice-fe/service`: `JwtAuthService`, `JwtStorage`, `JwtAuthAPI`. `AuthHttpClientService` 등이 인터셉터에서 `get`·`reissue` 호출. 앱 `main`에서 `JwtAuthService.register(...)` 실행.

## 면접 한 줄

「인증 라이브러리는 저장·API·오케스트레이션을 분리하고, 재발급은 동시성 가드까지 포함한다.」
