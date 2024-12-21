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

// animation settings
import { createClouds } from './animation/cloud';
import { updateAltitudeDisplay } from './chart/state/altitude';
import { updateSpeedDisplay } from './chart/state/speed';
import { createTerrain } from './animation/terrain';
import { createHorizon } from './animation/horizon';
import { createYellowLine } from './animation/runway';

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

loadModel(mainScene, '/models/Su-57.obj').then((model) => {
    aircraftMesh = model;

    // サブシーン用にもクローンを作成し保持
    aircraftMeshSub = model.clone();
    aircraftMeshSub.name = 'subAircraft';
    subScene.add(aircraftMeshSub);

    // カメラをコックピット付近に配置 (値は機体モデルに合わせて微調整)
    aircraftMeshSub.add(subCamera);
    subCamera.position.set(1, 5.5, 0);    // 機体中心から上方向へ1.5m程度
    subCamera.lookAt(3, 0.1, 0);        // 前方を覗き込むように
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

// シミュレーション関連
const aircraft = new Aircraft(
    initialState,
    2000,
    [700, 1500, 3000], // kg m^2
    new Aerodynamics(),
    new Environment(),
);
const simManager = new SimulationManager(aircraft, 0.01);

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
            state.position[0] + 5,
            state.position[1] + 2,
            state.position[2] + 5,
        );
        mainCamera.lookAt(state.position[0], state.position[1], state.position[2]);
        aircraftMesh.add(subCamera);

        updateAltitudeDisplay(state.position[1]);
        updateSpeedDisplay(airspeed);

        throttleSound.updateThrottle(inputs.throttle);
        airspeedSound.updateThrottle(airspeed);
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
