import * as THREE from 'three';

export function createHorizon(): THREE.Mesh {
    const horizonGeometry = new THREE.CircleGeometry(5000, 64);
    const horizonMaterial = new THREE.MeshStandardMaterial({
        color: 0x2f4f4f,
        side: THREE.DoubleSide
    });
    const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
    // 地平線が地面に平行になるように回転
    horizon.rotation.x = -Math.PI / 2;
    horizon.receiveShadow = true;
    return horizon;
}
