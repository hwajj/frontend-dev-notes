# Node 버전 · 환경변수

## 키워드

- **nvm** — Node 버전 관리자. 프로젝트별 버전 전환.
- **.nvmrc** — 프로젝트 권장 Node 버전 파일. **자동 전환은 안 됨**(직접 `nvm use`).
- **OpenSSL 3 이슈** — Node 17+에서 구버전 webpack(4)이 `ERR_OSSL_EVP_UNSUPPORTED`로 깨짐.
- **engines** — `package.json`의 `engines`로 버전 명시.
- **버전 드리프트** — 팀원 간 Node 버전 불일치로 생기는 "내 PC에선 되는데".
- **.env** — 환경별 설정·시크릿을 파일/CI에 두는 관행. **빌드/런타임에 어떻게 주입되는지**가 핵심.
- **import.meta.env** — Vite에서 클라이언트에 노출되는 env (보통 `VITE_` 접두사).
- **NEXT_PUBLIC_*** — Next.js에서 브라우저 번들에 들어가는 변수 접두사.
- **NODE_ENV** — `development` / `production` 등. 도구·최적화 분기.

## 개념 정리

### Node 버전 통일

`.nvmrc` + `nvm use` + `engines` + lockfile로 "내 PC에선 되는데"를 줄인다. OpenSSL/webpack 충돌은 버전 정합이 근본 해결.

### 환경변수: 빌드 시 주입 vs 런타임

프론트(정적 번들)는 많은 경우 **빌드 시점에** `process.env` / `import.meta.env`가 문자열로 치환된다. 그래서 CI에서 잘못된 env로 빌드하면 **재빌드 전까지** 값이 고정된다.

| 구분 | 예시 | 브라우저에 노출? |
|------|------|------------------|
| 공개 설정 | `VITE_API_BASE_URL`, `NEXT_PUBLIC_API_URL` | 예 — 번들에 포함될 수 있음 |
| 시크릿 | DB 비밀번호, private API_KEY, `SECRET` | **아니어야 함** — 서버/CI 시크릿만 |

`NEXT_PUBLIC_` / `VITE_` 없는 서버 전용 변수는 Node 런타임(SSR·API route)에서만 읽고, 클라이언트 번들에 넣지 않는다. **시크릿을 `NEXT_PUBLIC_`에 넣으면 소스가 공개되는 것과 같다.**

### Vite / Next 감각

- Vite: `import.meta.env.VITE_*`, `import.meta.env.MODE`
- Next: `process.env.NEXT_PUBLIC_*`(클라이언트), 서버 전용은 접두사 없이 서버 코드에서만
- `NODE_ENV=production`이면 압축·일부 개발 경고 제거 등

## 면접 포인트

- **Q. `.nvmrc`가 있는데 왜 버전이 안 바뀌나?**
  → `.nvmrc`는 선언일 뿐 자동 전환이 아니다. `nvm use`(또는 셸 훅)로 적용해야 한다.
- **Q. Node 17+에서 오래된 webpack이 터지는 이유는?**
  → OpenSSL 3의 기본 정책이 구 알고리즘을 막아서. 임시론 `--openssl-legacy-provider`, 근본은 Node/빌드 버전 정합.
- **Q. `NEXT_PUBLIC_` / `VITE_`가 붙는 변수와 안 붙는 변수의 차이는?**
  → 접두사 있는 쪽은 클라이언트 번들에 들어갈 수 있는 **공개 값**. 시크릿·private 키는 접두사 없이 서버(또는 CI)에만 둔다.
- **Q. 프론트 `.env`에 API_SECRET을 두면?**
  → 빌드에 섞이거나 실수로 노출되면 누구나 탈취 가능. 시크릿은 서버·BFF·시크릿 매니저에 둔다.

## 관련 실무 노트

- `notes/2026-06-08_nvmrc-node-drift.md`
- `notes/2026-06-08_node-openssl-webpack.md`

## 목표

- nvm/.nvmrc로 Node 버전을 통일할 수 있다.
- OpenSSL/webpack 버전 충돌을 진단·해결한다.
- Vite/Next 환경변수 노출 규칙을 말하고, 시크릿을 번들에 넣지 않는다.
