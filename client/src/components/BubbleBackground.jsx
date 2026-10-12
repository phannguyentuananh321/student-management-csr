import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * BubbleBackground 3D: Sử dụng WebGL & Three.js thực thụ
 * Các quả cầu 3D màu vàng (#FFD700) và xanh lá (#22C55E/#10B981) với ánh sáng phản chiếu,
 * độ sâu không gian 3D, hiệu ứng di chuột (mouse parallax) và loop vô tận nổi từ dưới lên.
 */
export default function BubbleBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Kiểm tra hỗ trợ WebGL
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & 3D Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 24;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Hệ thống đèn chiếu 3D (Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(-15, 20, 20);
    scene.add(dirLight1);

    const goldPointLight = new THREE.PointLight(0xffd700, 3, 60);
    goldPointLight.position.set(10, -10, 15);
    scene.add(goldPointLight);

    const greenPointLight = new THREE.PointLight(0x22c55e, 3, 60);
    greenPointLight.position.set(-10, 10, 15);
    scene.add(greenPointLight);

    // 4. Tạo các vật liệu 3D phản quang bóng bẩy (Phong Specular Materials)
    const goldMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      emissive: 0x554400,
      specular: 0xffffff,
      shininess: 90,
      transparent: true,
      opacity: 0.82
    });

    const greenMaterial = new THREE.MeshPhongMaterial({
      color: 0x22c55e,
      emissive: 0x054415,
      specular: 0xffffff,
      shininess: 90,
      transparent: true,
      opacity: 0.80
    });

    const emeraldMaterial = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      emissive: 0x043825,
      specular: 0xffffff,
      shininess: 85,
      transparent: true,
      opacity: 0.80
    });

    // 5. Khởi tạo các quả cầu 3D với kích thước và độ sâu khác nhau
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const bubbleCount = 42;
    const bubbles = [];

    const materials = [goldMaterial, greenMaterial, emeraldMaterial];

    for (let i = 0; i < bubbleCount; i++) {
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(sphereGeometry, mat);

      // Kích thước quả cầu ngẫu nhiên
      const scale = 0.5 + Math.random() * 1.5;
      mesh.scale.set(scale, scale, scale);

      // Tọa độ không gian 3D (X, Y, Z)
      mesh.position.x = (Math.random() - 0.5) * 36;
      mesh.position.y = (Math.random() - 0.5) * 40;
      mesh.position.z = (Math.random() - 0.5) * 20;

      // Thuộc tính chuyển động
      const speedY = 0.025 + Math.random() * 0.045;
      const swaySpeed = 0.008 + Math.random() * 0.015;
      const swayAmplitude = 0.5 + Math.random() * 1.2;
      const phase = Math.random() * Math.PI * 2;
      const rotSpeedX = (Math.random() - 0.5) * 0.02;
      const rotSpeedY = (Math.random() - 0.5) * 0.02;

      bubbles.push({
        mesh,
        baseX: mesh.position.x,
        speedY,
        swaySpeed,
        swayAmplitude,
        phase,
        rotSpeedX,
        rotSpeedY
      });

      scene.add(mesh);
    }

    // 6. Hiệu ứng Parallax khi di chuột tương tác 3D
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;

    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
      targetCameraX = mouseX * 2.5;
      targetCameraY = -mouseY * 2.5;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Resize handler
    const onResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', onResize);

    // 7. Animation Loop 3D
    let animationFrameId;
    let time = 0;

    const animate = () => {
      time += 1;

      // Camera di chuyển mềm mại theo chuột (3D Parallax)
      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Cập nhật vị trí các quả cầu 3D
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        const mesh = b.mesh;

        // Nổi từ dưới lên trên
        mesh.position.y += b.speedY;

        // Dao động ngang hình sin tự nhiên
        mesh.position.x = b.baseX + Math.sin(time * b.swaySpeed + b.phase) * b.swayAmplitude;

        // Xoay quả cầu 3D
        mesh.rotation.x += b.rotSpeedX;
        mesh.rotation.y += b.rotSpeedY;

        // LOOP VÔ TẬN: Khi bay khỏi tầm nhìn phía trên, reset xuống đáy
        if (mesh.position.y > 22) {
          mesh.position.y = -22 - Math.random() * 4;
          mesh.position.x = (Math.random() - 0.5) * 36;
          b.baseX = mesh.position.x;
          mesh.position.z = (Math.random() - 0.5) * 20;
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Dọn dẹp tài nguyên Three.js khi unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeometry.dispose();
      goldMaterial.dispose();
      greenMaterial.dispose();
      emeraldMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}
