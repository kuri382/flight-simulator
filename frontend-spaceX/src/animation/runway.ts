import * as THREE from 'three';

export function createRunway(): THREE.Group {
    // 滑走路
    const cubeGeometry = new THREE.BoxGeometry(500, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0xF4E511
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0);

    // 道路の作成
    const wayGeometry = new THREE.BoxGeometry(500, 0.2, 4.0);
    const wayMaterial = new THREE.MeshStandardMaterial({
        color: 0x7d7d7d,
        roughness: 10,
    });
    const way = new THREE.Mesh(wayGeometry, wayMaterial);
    way.position.set(0, 0, 0);
    way.receiveShadow = true;

    // 破線の作成
    const dashedLineGroup = new THREE.Group();
    const dashLength = 1.0;
    const gapLength = 1.0;
    const totalLength = 500;
    const dashGeometry = new THREE.BoxGeometry(dashLength, 0.04, 0.1); // 破線と同じ厚さ・幅
    const dashMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF
    });

    for (let i = -totalLength / 2; i < totalLength / 2; i += dashLength + gapLength) {
        const rightDash = new THREE.Mesh(dashGeometry, dashMaterial);
        rightDash.position.set(i + dashLength / 1, 0.02, 2.3);
        dashedLineGroup.add(rightDash);
        const leftDash = new THREE.Mesh(dashGeometry, dashMaterial);
        leftDash.position.set(i + dashLength / 1, 0.02, -2.3);
        dashedLineGroup.add(leftDash);
    }

    const group = new THREE.Group();
    group.add(way); // 道
    group.add(cube); // 黄色い直線
    group.add(dashedLineGroup); // 破線

    return group;
}
