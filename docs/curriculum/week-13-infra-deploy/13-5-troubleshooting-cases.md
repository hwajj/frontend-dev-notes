# 실전 트러블슈팅 사례집

> 앞 절(네트워크·Nginx·배포)에서 배운 걸 **실제 장애 흐름**으로 엮는다. "증상 → 가설 → 확인 → 원인 → 해결" 순서로 정리하는 연습.

## 대표 사례: Nginx 서브도메인 배포 — Node 버전 충돌부터 라우팅 누락까지

1. **증상** — 서브도메인 배포 후 페이지가 안 뜨거나(빌드 실패) / 새로고침 시 404 / 502.
2. **1차 원인 — Node 버전 충돌**
   - Node 17+ OpenSSL 3에서 구 webpack이 `ERR_OSSL_EVP_UNSUPPORTED`로 빌드 실패.
   - 해결: `.nvmrc`/`engines`로 버전 고정 또는 `--openssl-legacy-provider`(임시).
3. **2차 원인 — Nginx 라우팅 누락**
   - `server_name`(서브도메인) 미설정 → 요청이 엉뚱한 가상호스트로.
   - SPA `try_files ... /index.html` 누락 → 새로고침 404.
   - `/api` location 없음 → 프록시 안 됨.
4. **3차 원인 — 업스트림 미기동**
   - 502/ECONNREFUSED는 설정보다 "뒤 서버가 안 떠 있음"인 경우가 많다. 포트·프로세스 확인.

## 트러블슈팅 사고 틀

- **레이어로 좁히기**: DNS → Nginx(가상호스트/location) → 업스트림(앱) → 앱 내부.
- **로그부터**: `nginx error.log`, 앱 로그, 상태 코드로 어느 층인지 특정.
- **재현 최소화**: `curl -v`로 헤더/리다이렉트/상태 코드 직접 확인.

## 면접 포인트

- **Q. 배포 후 502가 떴다. 어디부터 보나?**
  → 업스트림 프로세스·포트 확인(대개 앱 미기동). 그다음 Nginx `proxy_pass` 대상, 방화벽 순.
- **Q. 로컬은 되는데 배포만 안 되는 원인 후보는?**
  → Node/빌드 버전 차이, 환경변수 누락, Nginx 라우팅/fallback 누락, CORS/same-origin 차이.

## 관련 실무 노트

- `notes/2026-06-08_proxy-econnrefused-upstream.md`
- `notes/2026-06-08_node-openssl-webpack.md`
- `notes/2026-06-08_nvmrc-node-drift.md`
- `notes/2026-06-11_ubuntu-deploy-s3-media.md`

## 목표

- 장애를 "레이어로 좁히는" 사고 틀로 접근할 수 있다.
- Node 버전 충돌·Nginx 라우팅 누락·업스트림 미기동을 구분해 진단한다.
- "증상→가설→확인→원인→해결"로 사례를 문서화한다.
