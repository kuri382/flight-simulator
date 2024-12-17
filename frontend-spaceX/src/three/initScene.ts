import * as THREE from 'three';

export function initScene(canvas: HTMLCanvasElement) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer(
        {
            canvas: canvas,
            antialias: true
        }
    );
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0);
    directionalLight.position.set(100, 100, 10);
    directionalLight.castShadow = true; // 影を有効化

    // シャドウマップの設定
    directionalLight.shadow.mapSize.width = 2048; // 解像度を上げて影を滑らかに
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;

    // シャドウカメラのサイズを調整
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;

    scene.add(directionalLight);

    return { scene, camera, renderer };
}
