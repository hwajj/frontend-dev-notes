

## **📌 Day 1 — 기본 무대 세팅**

### **목표**

* Three.js 초기 환경 구성
* Scene, Camera, Renderer 연결

### **진행 내용**

```ts
import * as THREE from "three";

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

**배운 점**

1. **Scene-Camera-Renderer** 3요소의 관계
2. `requestAnimationFrame`을 통한 렌더 루프
3. `renderer.domElement`를 HTML에 mount하는 방식

---

맞아요, 아까 이어쓰다가 **Day 2 배운 점 4번**이 중간에 잘렸네요.
다시 정리해서 완성판으로 드릴게요.

---

## **📌 Day 2 — Mesh, Material, Geometry**

### **목표**

* 3D 오브젝트 생성 및 Scene에 추가
* Material과 Geometry의 관계 이해

### **진행 내용**

```ts
// Geometry (모양)
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Material (표면)
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// Mesh (Geometry + Material)
const cube = new THREE.Mesh(geometry, material);

// Scene에 추가
scene.add(cube);

// 애니메이션: 회전
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

---

### **배운 점**

1. **Geometry** = 3D 물체의 형태(모양 정보)
2. **Material** = 표면의 색상·질감·광택
3. **Mesh** = Geometry + Material의 결합체
4. \*\*Scene에 Mesh를 add()\*\*하면 카메라에 의해 Renderer가 화면에 그려줌
5. 회전·이동·크기 변경은 `mesh.rotation`, `mesh.position`, `mesh.scale`로 조절
6. `MeshBasicMaterial`은 빛의 영향을 받지 않음 → 광원 효과를 보려면 `MeshStandardMaterial` 등 사용 필요
7. 애니메이션은 렌더 루프 안에서 속성을 조금씩 바꾸는 방식으로 구현
