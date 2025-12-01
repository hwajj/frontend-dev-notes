# 1주차 하루 단위 실행표 - 프론트엔드

## 월요일 - 분석 & 설계 (Design Mode 중심)

### 프론트엔드 (3.5h)

#### 1. 폴더 구조 생성
```
/src/features/survey/
├── components/     # Presenter 컴포넌트
├── containers/     # Container 컴포넌트  
├── hooks/          # Custom Hook
└── services/       # Repository + Facade
```

#### 2. requirements.md 작성
- 케이스 10개 정의
- 설계안 3개 작성 (A/B/C) + 장단점 비교

#### 3. flowchart 작성 (draw.io)
- Container와 Service 간 데이터 흐름 시각화

### 디자인 패턴 포인트

#### Container
- 상태와 이벤트 핸들링만 담당
- 비즈니스 로직은 Service에 위임

#### Presenter  
- props 기반 렌더링
- 상태 없음 (순수 함수형 컴포넌트)

#### Repository
- `getDraft()`: 임시 저장 데이터 조회
- `saveDraft()`: 임시 저장 데이터 저장
- `getCommitted()`: 확정된 데이터 조회
- `saveCommitted()`: 확정된 데이터 저장

#### Facade
- `SurveyStorageService`로 Repository + API 클라이언트 묶음
- 복잡한 의존성을 단순한 인터페이스로 추상화

### 학습 목표
- Container-Presenter 패턴의 이해와 적용
- Repository 패턴을 통한 데이터 접근 계층 분리
- Facade 패턴을 통한 복잡한 시스템 단순화
- 설계 패턴의 장단점 비교 분석 