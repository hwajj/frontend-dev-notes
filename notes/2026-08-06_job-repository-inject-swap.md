# JobRepository 주입·스왑

> 작성일: 2026-08-06
> 형식: 경량
> 맥락: app-dailycare에서 UI는 dummy/http 구현을 직접 보지 않고 repository 인터페이스만 쓰도록 둔 구조

## 결론

페이지는 `DummyJobRepository`·fixtures를 import하지 말고 `JobRepository`만 의존한다. 구현 선택은 `createJobRepository()` + `REACT_APP_DATA_SOURCE`에 모은다. http가 비어도 UI 코드는 그대로 두고 어댑터만 갈아끼우면 된다.

## 학습 주제 · 키워드

- **Repository / Port-Adapter (FE)**: `인터페이스 의존`, `구현 스왑`, `환경 변수 팩토리`
- **레이어 분리**: `UI → domain port`, `data 어댑터`, `fixtures는 dummy 전용`

## 이 레포 예문

UI·도메인 계약은 인터페이스에만 있고, 생성은 factory가 env로 고른다.

```ts
// domain/JobRepository.ts
export interface JobRepository {
  getList(status: JobListFilter): Promise<JobListItem[]>;
  getDetail(id: string): Promise<JobDetail | null>;
}
```

```ts
// data/createJobRepository.ts
export function createJobRepository(): JobRepository {
  const source = process.env.REACT_APP_DATA_SOURCE || 'dummy';
  if (source === 'http') { /* TODO HttpJobRepository */ }
  return new DummyJobRepository();
}
export const jobRepository = createJobRepository();
```

## GPT에 물어볼 때

```
프론트에서 Repository 인터페이스 + factory로 dummy/http를 스왑하는 패턴을 설명해줘.
내 코드는 CRA, REACT_APP_DATA_SOURCE, JobRepository(getList/getDetail), createJobRepository → DummyJobRepository다.
이게 DI 컨테이너와 뭐가 다른지, Context로 주입할 때와 모듈 싱글톤(export const jobRepository)의 트레이드오프, Http 연동 시 타입을 domain에 둘지 response DTO에 둘지 알려줘.
```
