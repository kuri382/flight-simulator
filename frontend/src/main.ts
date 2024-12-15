import * as THREE from 'three';
import { initScene } from './three/initScene';
import { loadModel } from './three/loadModel';
import { initPositionChart, initOrientationChart, initFlightParamsChart } from './chart/initCharts';
import { getInputs } from './ui';

// simulation settings
import { SimulationManager } from './simulation/simulationManager';
import { Aircraft } from './simulation/aircraft';
import { Aerodynamics } from './simulation/aerodynamics';
import { Integrator } from './simulation/integrator';
import { State } from './simulation/interfaces';

// animation settings
import { createClouds } from './animation/cloud';
import { updateAltitudeDisplay } from './animation/altitude';
import { createTerrain } from './animation/terrain';
import { createHorizon } from './animation/horizon';
import { createExhaust, updateExhaust } from './animation/exhaust';

// chart settings
import { updatePositionChart } from './chart/update/position';
import { updateOrientationChart } from './chart/update/orientation';
import { updateFlightParamChart } from './chart/update/flightParam';


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
    velocity: [0, 0, 0],
    angularVelocity: [0, 0, 0]
};

// Three.jsシーンの初期化
const { scene: mainScene, camera: mainCamera, renderer: mainRenderer } = initScene(threeCanvas);
const { scene: subScene, camera: subCamera, renderer: subRenderer } = initScene(subCanvas);

// サブカメラの設定
subCamera.position.set(0, 5, 10);
subCamera.lookAt(0, 0, 0);

// モデルの読み込み
let aircraftMesh: THREE.Object3D | null = null;
loadModel(mainScene, '/models/Su-57.obj').then((model) => {
    aircraftMesh = model;
    subScene.add(model.clone()); // サブシーンにクローンを追加
});

// 背景モデルの追加
const terrain = createTerrain();
mainScene.add(terrain);
const exhaustParticles = createExhaust(mainScene);
const horizon = createHorizon();
mainScene.add(horizon);
const clouds = createClouds();
clouds.forEach(cloud => mainScene.add(cloud));

// シミュレーション関連
const aircraft = new Aircraft(initialState, 1000, [1000, 1000, 1000], new Aerodynamics());
const integrator = new Integrator();
const simManager = new SimulationManager(aircraft, integrator, 0.01);

let stopSimulation = false;

function animate() {
    if (stopSimulation) return;

    requestAnimationFrame(animate);

    const uiInputs = getInputs();
    const inputs = {
        aileron: uiInputs.aileron,
        elevator: uiInputs.elevator,
        rudder: uiInputs.rudder,
        throttle: uiInputs.throttle,
        wind: [0, 0, 0] as [number, number, number]
    };

    simManager.step(inputs);
    const state = simManager.getState();

    if (aircraftMesh) {
        aircraftMesh.position.set(state.position[0], state.position[1], state.position[2]);
        const q = new THREE.Quaternion(
            state.orientation[1],
            state.orientation[2],
            state.orientation[3],
            state.orientation[0]
        );
        aircraftMesh.setRotationFromQuaternion(q);

        const aircraftPosition = new THREE.Vector3(
            state.position[0],
            state.position[1],
            state.position[2]
        );

        mainCamera.position.set(
            state.position[0] + 20,
            state.position[1] + 10,
            state.position[2] + 40
        );
        mainCamera.lookAt(
            state.position[0] + 10,
            state.position[1],
            state.position[2]
        );

        const airspeedDirection = new THREE.Vector3(
            state.velocity[0],
            state.velocity[1],
            state.velocity[2]
        ).normalize();

        // 噴射を更新
        updateExhaust(exhaustParticles, aircraftPosition);

        // 高度表示の更新
        updateAltitudeDisplay(state.position[2]);
    }

    const angleOfAttack = Math.atan2(state.velocity[2], state.velocity[0]) * (180 / Math.PI);
    const airspeed = Math.sqrt(
        state.velocity[0] ** 2 + state.velocity[1] ** 2 + state.velocity[2] ** 2
    );

    const timeSeries = simManager.getTimeSeriesData();
    const lastPoint = timeSeries[timeSeries.length - 1];

    // 各チャートにデータを追加
    updatePositionChart(positionChart, state, lastPoint);
    updateOrientationChart(orientationChart, state, lastPoint);
    updateFlightParamChart(flightParamsChart, angleOfAttack, airspeed, lastPoint);

    // 各チャートを更新
    positionChart.update();
    orientationChart.update();
    flightParamsChart.update();

    // レンダリング
    mainRenderer.render(mainScene, mainCamera);
    subRenderer.render(subScene, subCamera);
}

// 3分後にシミュレーションを停止
setTimeout(() => {
    console.log('シミュレーションを停止しました。');
    stopSimulation = true;
}, 3 * 60 * 1000);

animate();
