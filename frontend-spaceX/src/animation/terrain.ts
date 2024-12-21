import * as THREE from 'three';

export function createTerrain({
  terrainSize = 5000,
  gridDivisions = 200,
  numMountains = 30,
  maxHeight = 100,
  exclusionRadius = 600
} = {}): THREE.Mesh {

  const terrainGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, gridDivisions, gridDivisions);
  terrainGeometry.rotateX(-Math.PI / 2);

  const vertices = terrainGeometry.attributes.position.array;
  const mountainPeaks = [];

  // ランダムな山の頂点を生成
  for (let i = 0; i < numMountains; i++) {
    let x, z;
    do {
      x = (Math.random() - 0.5) * terrainSize;
      z = (Math.random() - 0.5) * terrainSize;
    } while (Math.sqrt(x * x + z * z) < exclusionRadius);

    mountainPeaks.push({ x, z });
  }

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i + 2];
    let y = -10; // 最低の高さのオフセット

    // 中心部の除外範囲を考慮
    const centralDistance = Math.sqrt(x * x + z * z);
    if (centralDistance < exclusionRadius) {
      vertices[i + 1] = y; // 中心部には高さを設定しない
      continue;
    }

    // 各山の頂点との距離に基づいて高さを決定
    mountainPeaks.forEach(peak => {
      const dx = x - peak.x;
      const dz = z - peak.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      // 高さを可変にするロジック: 基準の高さ - 距離に応じた減少分
      const height = Math.max(0, maxHeight - (distance * 0.1));
      y += height;
    });

    vertices[i + 1] = y;
  }


  terrainGeometry.attributes.position.needsUpdate = true;
  terrainGeometry.computeVertexNormals();

  const terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0x583822,
    wireframe: false,
  });

  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  return terrain;
}
