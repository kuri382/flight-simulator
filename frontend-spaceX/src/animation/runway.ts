import * as THREE from 'three';

export function createYellowLine(): THREE.Group {
    const cubeGeometry = new THREE.BoxGeometry(500, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0xF4E511
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0);

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
    const dashLength = 1.0; // 各破線の長さ
    const gapLength = 1.0;  // 破線の間隔
    const totalLength = 500; // 破線の全体の長さ
    const dashGeometry = new THREE.BoxGeometry(dashLength, 0.04, 0.1); // 破線と同じ厚さ・幅
    const dashMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF // 白色
    });

    for (let i = -totalLength / 2; i < totalLength / 2; i += dashLength + gapLength) {
        const rightDash = new THREE.Mesh(dashGeometry, dashMaterial);
        rightDash.position.set(i + dashLength / 1, 0.02, 2.3); // 配置と高さ調整
        dashedLineGroup.add(rightDash);
        const leftDash = new THREE.Mesh(dashGeometry, dashMaterial);
        leftDash.position.set(i + dashLength / 1, 0.02, -2.3); // 配置と高さ調整
        dashedLineGroup.add(leftDash);
    }

    // グループ化
    const group = new THREE.Group();
    group.add(way); // 道
    group.add(cube); // 黄色い直線
    group.add(dashedLineGroup); // 破線

    return group;
}
