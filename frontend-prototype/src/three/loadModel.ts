import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export async function loadModel(scene: THREE.Scene, path: string): Promise<THREE.Object3D> {
    const loader = new OBJLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            path,
            (object) => {
                const size = 0.2;
                object.scale.set(size, size, size);
                // バウンディングボックスで中心を取得して移動
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                object.position.sub(center);

                // 子オブジェクトを含めて回転を適用
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.rotation.y = Math.PI / 2; // ピッチ方向に90度回転
                        child.castShadow = true; // 機体が影をキャスト
                        child.receiveShadow = false;
                    }
                });

                scene.add(object);
                resolve(object);
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
                reject(error);
            }
        );
    });
}