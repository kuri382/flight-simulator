import * as THREE from 'three';

export function createHorizon(): THREE.Mesh {
    // THREE.PlaneGeometry を THREE.CircleGeometry に変更
    const horizonGeometry = new THREE.CircleGeometry(5000, 64); // 半径5000、セグメント数64の円
    const horizonMaterial = new THREE.MeshStandardMaterial({
        color: 0x2f4f4f,
        side: THREE.DoubleSide
    });
    const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
    horizon.rotation.x = -Math.PI / 2; // 地平線が地面に平行になるように回転
    horizon.receiveShadow = true;
    return horizon;
}
