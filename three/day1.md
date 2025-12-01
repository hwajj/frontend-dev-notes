# 1주차 하루 단위 실행표 - 3D

## 월요일 - 3D 학습

### 3D (1h)

#### 1. three.js 설치 및 기본 구조 학습
- three.js 설치 및 프로젝트 설정
- Scene/Camera/Renderer 구조 이론 학습

#### 2. "렌더링 루프" 개념 정리
- 렌더링 루프의 동작 원리 이해
- 그림으로 렌더링 과정 시각화

### 학습 내용

#### Scene (장면)
- 3D 객체들이 배치되는 공간
- 모든 3D 요소를 포함하는 컨테이너

#### Camera (카메라)
- 사용자가 보는 시점을 결정
- PerspectiveCamera, OrthographicCamera 등

#### Renderer (렌더러)
- 3D 장면을 2D 화면에 그리는 역할
- WebGL 기반 렌더링

#### 렌더링 루프
```
1. Scene 업데이트 (객체 위치, 회전 등)
2. Camera 설정 (위치, 방향)
3. Renderer로 Scene을 Camera 시점에서 렌더링
4. requestAnimationFrame으로 반복
```

### 학습 목표
- three.js의 기본 아키텍처 이해
- 렌더링 루프의 동작 원리 파악
- 3D 그래픽 프로그래밍의 기초 개념 습득 