import * as THREE from 'three';

export function createClouds(): THREE.Mesh[] {
  const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
  const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const cloudCount = 1500;

  const areaWidth = 4000;
  const areaHeight = 4000;

  const clouds: THREE.Mesh[] = [];

  for (let i = 0; i < cloudCount; i++) {
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    const cloudSize = Math.random() * 3
    cloud.scale.set(
      cloudSize,
      cloudSize,
      cloudSize
    );

    cloud.position.set(
      Math.random() * areaWidth - areaWidth / 2,
      Math.random() * 10000 + 1000,
      Math.random() * areaHeight - areaHeight / 2
    );

    clouds.push(cloud);
  }

  return clouds;
}
