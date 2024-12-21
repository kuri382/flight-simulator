import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export async function loadModel(
  scene: THREE.Scene,
  path: string,
  size: number = 0.5,
  rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): Promise<THREE.Object3D> {
    const extension = path.split('.').pop()?.toLowerCase();

    return new Promise((resolve, reject) => {
        let loader: any;

        if (extension === 'obj') {
            loader = new OBJLoader();
        } else if (extension === 'gltf' || extension === 'glb') {
            loader = new GLTFLoader();
        } else {
            reject(new Error(`Unsupported file format: .${extension}`));
            return;
        }

        loader.load(
            path,
            (result: THREE.Object3D | { scene: THREE.Object3D }) => {
                let object: THREE.Object3D;

                // GLTFLoaderの場合、`result`には`.scene`が存在
                if (extension === 'gltf' || extension === 'glb') {
                    object = (result as { scene: THREE.Object3D }).scene;
                } else {
                    object = result as THREE.Object3D;
                }
                object.scale.set(size, size, size);
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                object.position.sub(center);

                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.rotation.set(rotation.x, rotation.y, rotation.z);
                        child.castShadow = true;
                        child.receiveShadow = false;
                    }
                });
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
