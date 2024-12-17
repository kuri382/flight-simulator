import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

export function initControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer, target: THREE.Vector3) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 20;
    controls.maxDistance = 40;

    controls.target.copy(target);
    controls.update();

    return controls;
}
