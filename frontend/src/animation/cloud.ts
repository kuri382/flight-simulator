import * as THREE from 'three';

export function createClouds(): THREE.Mesh[] {
  const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
  const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const cloudCount = 100; // 表示する雲の数

  const areaWidth = 2000; // X方向の範囲
  const areaHeight = 2000; // Z方向の範囲

  const clouds: THREE.Mesh[] = [];

  for (let i = 0; i < cloudCount; i++) {
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

    cloud.scale.set(
      Math.random() * 2 + 0.5, // ランダムなサイズ
      Math.random() * 2 + 0.5,
      Math.random() * 2 + 0.5
    );

    cloud.position.set(
      Math.random() * areaWidth - areaWidth / 2, // X方向の範囲（-1000 ~ 1000）
      Math.random() * 50 + 10,                  // 雲の高さ（Y方向）
      Math.random() * areaHeight - areaHeight / 2 // Z方向の範囲（-1000 ~ 1000）
    );

    clouds.push(cloud);
  }

  return clouds;
}
