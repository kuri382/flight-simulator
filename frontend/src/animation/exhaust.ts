import * as THREE from 'three';

export function createExhaust(scene: THREE.Scene): THREE.Points {
    const particleCount = 100; // パーティクルの数
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3); // 各パーティクルの位置 (x, y, z)

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = 2; // X座標（機体の基点）
        positions[i * 3 + 1] = 0; // Y座標（機体の基点）
        positions[i * 3 + 2] = 0; // Z座標（機体の基点）
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xff4500, // オレンジ色
        size: 1, // パーティクルのサイズ
        transparent: true,
        opacity: 0.8,
    });

    const particles = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particles);

    return particles;
}

export function updateExhaust(
    particles: THREE.Points,
    aircraftPosition: THREE.Vector3
) {
    const positions = particles.geometry.attributes.position.array as Float32Array;
    const particleCount = positions.length / 3;

    // 固定方向（例：Z軸負方向）に噴射
    const exhaustDirection = new THREE.Vector3(0, 0, -1);

    for (let i = 0; i < particleCount; i++) {
        const index = i * 3;

        // 現在のパーティクル位置を取得
        const x = positions[index];
        const y = positions[index + 1];
        const z = positions[index + 2];

        // 固定方向に移動
        positions[index] += exhaustDirection.x * 0.5;
        positions[index + 1] += exhaustDirection.y * 0.5;
        positions[index + 2] += exhaustDirection.z * 0.5;

        // パーティクルが一定距離を超えた場合、基点に戻す
        const distance = Math.sqrt(
            (x - aircraftPosition.x) ** 2 +
            (y - aircraftPosition.y) ** 2 +
            (z - aircraftPosition.z) ** 2
        );

        if (distance > 20) {
            positions[index] = aircraftPosition.x;
            positions[index + 1] = aircraftPosition.y;
            positions[index + 2] = aircraftPosition.z;
        }
    }

    particles.geometry.attributes.position.needsUpdate = true;
}
