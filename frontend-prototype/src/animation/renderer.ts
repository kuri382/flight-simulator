import * as THREE from 'three';
import { State } from '../simulation/interfaces';

export class Renderer {
    private mainScene: THREE.Scene;
    private mainCamera: THREE.Camera;
    private mainRenderer: THREE.WebGLRenderer;
    private aircraftMesh: THREE.Object3D | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.mainRenderer = new THREE.WebGLRenderer({ canvas });
        this.mainRenderer.setSize(window.innerWidth, window.innerHeight);

        this.mainScene = new THREE.Scene();
        this.mainCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.mainCamera.position.set(20, 10, 40);
        this.mainScene.add(this.mainCamera);
    }

    loadAircraftModel(model: THREE.Object3D) {
        this.aircraftMesh = model;
        this.mainScene.add(model);
    }

    update(state: State) {
        if (this.aircraftMesh) {
            // Convert NED to three.js
            // NED: x-forward, y-right, z-down
            // Three.js: x-right, y-up, z-forward
            // One possible mapping:
            // NED -> Three.js: (Xned, Yned, Zned) -> (Xthree = Yned, Ythree = -Zned, Zthree = Xned)
            const x_t = state.position[1];     // Yned -> Xthree
            const y_t = -state.position[2];    // -Zned -> Ythree
            const z_t = state.position[0];     // Xned -> Zthree

            this.aircraftMesh.position.set(x_t, y_t, z_t);

            // Orientation: q is Body->Earth
            // Need a consistent approach to get a correct Three.js rotation
            // For simplicity, assume q transforms Body to NED, then rotate axes to match Three.js frame
            const q = new THREE.Quaternion(
                state.orientation[1],
                state.orientation[2],
                state.orientation[3],
                state.orientation[0]
            );

            // Apply additional rotation to match Three.js frame?
            // For example a rotation that maps NED axes to Three.js axes
            const nedToThree = new THREE.Quaternion();
            // This depends on the chosen axis mapping. 
            // One might first rotate around Y axis by 90 deg, etc.

            const finalQ = q.multiply(nedToThree);
            this.aircraftMesh.setRotationFromQuaternion(finalQ);
        }

        this.mainRenderer.render(this.mainScene, this.mainCamera);
    }
}
