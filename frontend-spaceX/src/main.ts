import * as THREE from 'three';
import { initScene } from './three/initScene';
import { loadModel } from './three/loadModel';
import { initPositionChart, initOrientationChart, initFlightParamsChart } from './chart/initCharts';
import { getInputs } from './ui';

// simulation settings
import { SimulationManager } from './simulation/simulationManager';
import { Aircraft } from './simulation/aircraft';
import { Aerodynamics } from './simulation/aerodynamics';
import { State } from './simulation/interfaces';
import { Environment } from './simulation/environment';
import { Wind } from './simulation/wind';

// animation settings
import { createClouds } from './animation/cloud';
import { updateAltitudeDisplay } from './chart/state/altitude';
import { updateSpeedDisplay } from './chart/state/speed';
import { createTerrain } from './animation/terrain';
import { createHorizon } from './animation/horizon';
import { createYellowLine } from './animation/runway';
import { Exhaust } from './animation/exhaust';

// chart settings
import { updatePositionChart } from './chart/update/position';
import { updateOrientationChart } from './chart/update/orientation';
import { updateFlightParamChart } from './chart/update/flightParam';

// audio settings
import { ThrottleSoundController } from './config/audioContoller';

const positionCanvas = document.getElementById('positionChart') as HTMLCanvasElement;
const orientationCanvas = document.getElementById('orientationChart') as HTMLCanvasElement;
const flightParamsCanvas = document.getElementById('flightParamsChart') as HTMLCanvasElement;

const positionChart = initPositionChart(positionCanvas);
const orientationChart = initOrientationChart(orientationCanvas);
const flightParamsChart = initFlightParamsChart(flightParamsCanvas);

const threeCanvas = document.getElementById('threeCanvas') as HTMLCanvasElement;
const subCanvas = document.getElementById('subCanvas') as HTMLCanvasElement;

// 初期状態を設定
const initialState: State = {
    position: [0, 0, 0],
    orientation: [1, 0, 0, 0],
    velocityBody: [0, 0, 0],
    angularVelocityBody: [0, 0, 0]
};

// Three.jsシーンの初期化
const { scene: mainScene, camera: mainCamera, renderer: mainRenderer } = initScene(threeCanvas);
const { scene: subScene, camera: subCamera, renderer: subRenderer } = initScene(subCanvas);

// モデルの読み込み
let aircraftMesh: THREE.Object3D | null = null;
let aircraftMeshSub: THREE.Object3D | null = null;
let exhaustSystem: Exhaust | null = null;

//loadModel(mainScene, '/models/spacex_starship_sn20_bn4.glb', 0.5).then((model) => {
loadModel(mainScene, '/models/spacex_sn24_superheavy_bn7.glb', 0.5).then((model) => {
    aircraftMesh = model;

    // サブシーン用にもクローンを作成し保持
    aircraftMeshSub = model.clone();
    aircraftMeshSub.name = 'subAircraft';
    subScene.add(aircraftMeshSub);

    // カメラをコックピット付近に配置 (値は機体モデルに合わせて微調整)
    aircraftMeshSub.add(subCamera);
    subCamera.position.set(0.5, -4, -10);
    subCamera.lookAt(17, -30, 0);

    exhaustSystem = new Exhaust('/textures/flames_mini.png');
    aircraftMesh.add(exhaustSystem.object3D);
    exhaustSystem.object3D.position.set(0, 0, 0);
});

const throttleSound = new ThrottleSoundController(mainScene, mainCamera, '/sounds/jet-sound.mp3');
const airspeedSound = new ThrottleSoundController(mainScene, mainCamera, '/sounds/barner-sound.mp3');

// 背景モデルの追加
const terrain = createTerrain();
const horizon = createHorizon();
const clouds = createClouds();
const yellowLine = createYellowLine();
mainScene.add(terrain);
mainScene.add(horizon);
mainScene.add(yellowLine);
clouds.forEach(cloud => mainScene.add(cloud));

const windModel = new Wind([50, 0, 0], 2); // 5 m/s の東風 + 乱流強度2

// シミュレーション関連
const aircraft = new Aircraft(
    initialState,
    200000,
    [700, 1500, 3000], // kg m^2
    new Aerodynamics(),
    new Environment(),
    windModel

);
const simManager = new SimulationManager(aircraft, 0.01);

let stopSimulation = false;
let lastTime = performance.now();

function animate() {
    if (stopSimulation) return;
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    const uiInputs = getInputs();
    const inputs = {
        aileron: uiInputs.aileron,
        elevator: uiInputs.elevator,
        rudder: uiInputs.rudder,
        throttle: uiInputs.throttle,
        windEarth: [0, 0, 0] as [number, number, number]
    };

    simManager.step(inputs);
    const state = simManager.getState();
    const airspeed = Math.sqrt(
        state.velocityBody[0] ** 2 + state.velocityBody[1] ** 2 + state.velocityBody[2] ** 2
    );
    const angleOfAttack = Math.atan2(state.velocityBody[1], state.velocityBody[0]);

    if (aircraftMesh) {
        const q = new THREE.Quaternion(
            state.orientation[1],
            state.orientation[2],
            state.orientation[3],
            state.orientation[0]
        );
        // mainScene機体
        aircraftMesh.position.set(state.position[0], state.position[1], state.position[2]);
        aircraftMesh.setRotationFromQuaternion(q);

        // mainCamera(外部視点カメラ)
        mainCamera.position.set(
            state.position[0] + 30,
            state.position[1] + 15,
            state.position[2] + 10,
        );
        mainCamera.lookAt(
            state.position[0],
            state.position[1] + 10,
            state.position[2],
        );
        aircraftMesh.add(subCamera);

        updateAltitudeDisplay(state.position[1]);
        updateSpeedDisplay(airspeed);

        throttleSound.updateThrottle(inputs.throttle);
        airspeedSound.updateThrottle(airspeed);

        if (exhaustSystem) {
            exhaustSystem.update(deltaTime, inputs.throttle);
        }
    }

    const timeSeries = simManager.getTimeSeriesData();
    const lastPoint = timeSeries[timeSeries.length - 1];

    updatePositionChart(positionChart, state, lastPoint);
    updateOrientationChart(orientationChart, state, lastPoint);
    updateFlightParamChart(flightParamsChart, angleOfAttack, airspeed, lastPoint);

    positionChart.update();
    orientationChart.update();
    flightParamsChart.update();

    mainRenderer.render(mainScene, mainCamera);
    subRenderer.render(mainScene, subCamera);
}

// シミュレーションタイマー
setTimeout(() => {
    console.log('シミュレーションを停止しました。');
    stopSimulation = true;
}, 3 * 60 * 1000);

animate();
