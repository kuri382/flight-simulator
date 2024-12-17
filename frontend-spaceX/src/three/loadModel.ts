import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export async function loadModel(
  scene: THREE.Scene,
  path: string,
  size: number = 0.5,
  rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): Promise<THREE.Object3D> {
    // ファイルの拡張子を取得
    const extension = path.split('.').pop()?.toLowerCase();

    return new Promise((resolve, reject) => {
        let loader: any;

        // 適切なローダーを選択
        if (extension === 'obj') {
            loader = new OBJLoader();
        } else if (extension === 'gltf' || extension === 'glb') {
            loader = new GLTFLoader();
        } else {
            reject(new Error(`Unsupported file format: .${extension}`));
            return;
        }

        // モデルの読み込み処理
        loader.load(
            path,
            (result: THREE.Object3D | { scene: THREE.Object3D }) => {
                let object: THREE.Object3D;

                // GLTFLoaderの場合、`result`には`.scene`が存在する
                if (extension === 'gltf' || extension === 'glb') {
                    object = (result as { scene: THREE.Object3D }).scene;
                } else {
                    object = result as THREE.Object3D;
                }

                // スケールと中心位置の調整
                object.scale.set(size, size, size);

                // バウンディングボックスで中心を取得して移動
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                object.position.sub(center);

                // 子オブジェクトを含めて回転と影の設定を適用
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        // 指定された回転を適用
                        child.rotation.set(rotation.x, rotation.y, rotation.z);
                        child.castShadow = true;
                        child.receiveShadow = false;
                    }
                });

                // シーンに追加して解決
                scene.add(object);
                resolve(object);
            },
            undefined,
            (error: any) => {
                console.error(`Error loading model (${path}):`, error);
                reject(error);
            }
        );
    });
}
