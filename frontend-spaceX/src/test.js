import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

let scene, camera, renderer;
let rocket, flame, smoke;
let isLaunching = false;
let rocketSpeed = 0.0;
let rocketAcceleration = 0.0005;

init();
animate();

function init() {
    // Scene, camera, renderer setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 20);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x333333);
    scene.add(ambient);

    // Ground (just for reference)
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);

    // Load rocket model
    const loader = new OBJLoader();
    loader.load('/public/models/falcon9.obj', obj => {
        rocket = obj;
        rocket.scale.set(0.1, 0.1, 0.1);
        rocket.position.set(0, 0, 0);
        scene.add(rocket);

        // Create flame sprite
        const flameTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/ball.png');
        const flameMaterial = new THREE.SpriteMaterial({ map: flameTexture, color: 0xffaa00, transparent: true, opacity: 0.8 });
        flame = new THREE.Sprite(flameMaterial);
        flame.scale.set(0.5, 0.5, 0.5);
        flame.position.set(0, -0.5, 0);
        flame.visible = false;
        rocket.add(flame);

        // Create smoke sprite
        const smokeTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/smokeparticle.png');
        const smokeMaterial = new THREE.SpriteMaterial({ map: smokeTexture, color: 0xffffff, transparent: true, opacity: 0.5 });
        smoke = new THREE.Sprite(smokeMaterial);
        smoke.scale.set(1, 1, 1);
        smoke.position.set(0, -0.7, 0);
        smoke.visible = false;
        rocket.add(smoke);
    });

    // Resize
    window.addEventListener('resize', onWindowResize, false);

    // Launch button
    document.getElementById('launchBtn').addEventListener('click', () => {
        if (rocket) {
            isLaunching = true;
            flame.visible = true;
            smoke.visible = true;
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    requestAnimationFrame(animate);

    if (isLaunching && rocket) {
        rocketSpeed += rocketAcceleration;
        rocket.position.y += rocketSpeed;

        // Simulate flame flicker or smoke variation if needed
        flame.material.opacity = 0.8 + Math.sin(time * 0.01) * 0.1;
        smoke.material.opacity = 0.5 + Math.sin(time * 0.005) * 0.1;
    }

    renderer.render(scene, camera);
}