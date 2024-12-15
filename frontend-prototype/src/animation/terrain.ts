import * as THREE from 'three';

export function createTerrain(): THREE.Mesh {
  // 地表のジオメトリを作成
  const terrainGeometry = new THREE.PlaneGeometry(2000, 2000, 1000, 100); // 細分化の設定
  terrainGeometry.rotateX(-Math.PI / 2); // 平面を水平に配置

  // 頂点をノイズで変形
  const vertices = terrainGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i + 2];
    const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 10; // ノイズで高さを生成
    vertices[i + 1] = y;
  }

  // 頂点更新を通知
  terrainGeometry.attributes.position.needsUpdate = true;
  terrainGeometry.computeVertexNormals(); // 法線を再計算

  // マテリアルを作成
  const terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0x583822, // 茶色
    wireframe: false, // ワイヤーフレームを無効化
  });

  // 地表のメッシュを作成
  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);

  return terrain; // 作成した地表を返す
}