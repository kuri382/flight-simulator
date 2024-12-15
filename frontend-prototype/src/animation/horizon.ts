import * as THREE from 'three';

export function createHorizon(): THREE.Mesh {
    const horizonGeometry = new THREE.PlaneGeometry(2000, 2000);
    const horizonMaterial = new THREE.MeshBasicMaterial({
        color: 0x2f4f4f,
        side: THREE.DoubleSide
    });
    const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
    horizon.rotation.x = Math.PI / 2;
    return horizon;
}