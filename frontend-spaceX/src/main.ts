import * as THREE from 'three';

// three settings
import { initScene } from './three/initScene';
import { initControls } from './three/initControls';
import { loadModel } from './three/loadModel';
import { drawMap } from './three/map';

// ui settings
import { getInputs } from './ui/ui';
import { AutopilotController, initializeUI } from './ui/autopilotController';

// simulation settings
import { SimulationManager } from './simulation/simulationManager';
import { Aircraft } from './simulation/aircraft';
import { Aerodynamics } from './simulation/aerodynamics';
import { State } from './simulation/interfaces';
import { Environment } from './simulation/environment';
import { Wind } from './simulation/wind';
import { Controller } from './simulation/controller';

// animation settings
import { createClouds } from './animation/cloud';
import { updateAltitudeDisplay } from './chart/state/altitude';
import { updateSpeedDisplay } from './chart/state/speed';
import { createTerrain } from './animation/terrain';
import { createHorizon } from './animation/horizon';
import { createRunway } from './animation/runway';
import { Exhaust } from './animation/exhaust';

// chart settings
import { initPositionChart, initOrientationChart, initFlightParamsChart } from './chart/initCharts';
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

// ミッションゴール設定
const destination = {
    position: [300, 1, 300] as [number, number, number],
    velocity: [20, 0, 0] as [number, number, number]
};
const startPoint = [...initialState.position] as [number, number, number];

// ミッション達成判定用のしきい値
const missionHorizontalThreshold = 100; // 半径100m以内の到達
const missionAltitudeThreshold = 4; // 高度4m以下への到達

// アニメーションシーンの初期化
const { scene: mainScene, camera: mainCamera, renderer: mainRenderer } = initScene(threeCanvas);
const { scene: subScene, camera: subCamera, renderer: subRenderer } = initScene(subCanvas);
const controls = initControls(mainCamera, mainRenderer, new THREE.Vector3(0, 9, 0.1));

// モデルの読み込み
let aircraftMesh: THREE.Object3D | null = null;
let aircraftMeshSub: THREE.Object3D | null = null;
let exhaustSystem: Exhaust | null = null;
let launchSiteMesh: THREE.Object3D | null = null;
let targetSiteMesh: THREE.Object3D | null = null;

loadModel(mainScene, '/models/spacex_sn24_superheavy_bn7.glb', 0.5).then((model) => {
    aircraftMesh = model;

    aircraftMeshSub = model.clone();
    aircraftMeshSub.name = 'subAircraft';
    subScene.add(aircraftMeshSub);

    aircraftMeshSub.add(subCamera);
    subCamera.position.set(0.5, -4, -2);
    subCamera.lookAt(15, -40, 0);

    exhaustSystem = new Exhaust('/textures/flames_mini.png');
    aircraftMesh.add(exhaustSystem.object3D);
    exhaustSystem.object3D.position.set(0, 0, 0);
});

loadModel(mainScene, '/models/environment/launch_site.glb', 1.0, { x: 0, y: 0, z: 1 }).then((model) => {
    launchSiteMesh = model;
});

loadModel(mainScene, '/models/environment/launch_site.glb', 1.0, { x: 0, y: 0, z: 1 }).then((model) => {
    targetSiteMesh = model;
});

// 環境モデルの追加
const terrain = createTerrain();
const horizon = createHorizon();
const clouds = createClouds();
const yellowLine = createRunway();
mainScene.add(terrain);
mainScene.add(horizon);
mainScene.add(yellowLine);
clouds.forEach(cloud => mainScene.add(cloud));

// 環境サウンドの追加
const throttleSound = new ThrottleSoundController(mainScene, mainCamera, '/sounds/jet-sound.mp3');
const airspeedSound = new ThrottleSoundController(mainScene, mainCamera, '/sounds/barner-sound.mp3');

// 入力系の設定
const autopilotController = new AutopilotController();
initializeUI(autopilotController);
const controller = new Controller();
const windModel = new Wind([50, 0, 0], 2); // 5 m/s の東風 + 乱流強度2

// 機体諸元の設定
const aircraft = new Aircraft(
    initialState,
    200000,
    [700, 1500, 3000], // kg m^2
    new Aerodynamics(),
    new Environment(),
    windModel
);

// シミュレーションサイクルの設定
const simManager = new SimulationManager(aircraft, 0.05); // ms
let stopSimulation = false;
let lastTime = performance.now();

function animate() {
    if (stopSimulation) return;
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    const uiInputs = getInputs();

    // 自動制御機
    const state = simManager.getState();

    let inputs;
    if (autopilotController.isEnabled()) {
        // 自動制御ONの場合、自動コントローラから入力生成
        inputs = controller.getControlInputs(state, destination, deltaTime);
    } else {
        // 手動入力
        inputs = {
            thrustPitch: uiInputs.thrustPitch,
            thrustYaw: uiInputs.thrustYaw,
            gridFinPitch: uiInputs.gridFinPitch,
            gridFinYaw: uiInputs.gridFinYaw,
            throttle: uiInputs.throttle,
            windEarth: [0, 0, 0] as [number, number, number]
        };
    }

    simManager.step(inputs);

    const airspeed = Math.sqrt(
        state.velocityBody[0] ** 2 + state.velocityBody[1] ** 2 + state.velocityBody[2] ** 2
    );
    const angleOfAttack = Math.atan2(state.velocityBody[1], state.velocityBody[0]);

    // 目標地点との水平距離計算
    const dx = destination.position[0] - state.position[0];
    const dz = destination.position[2] - state.position[2];
    const horizontalDist = Math.sqrt(dx * dx + dz * dz);
    const currentAltitude = state.position[1]

    // 目標地点付近で停止判定
    if (horizontalDist < missionHorizontalThreshold && currentAltitude < missionAltitudeThreshold) {
        // 速度を0に設定(最終状態を上書き)
        const finalState = simManager.getState();
        finalState.velocityBody = [0, 0, 0];
        finalState.angularVelocityBody = [0, 0, 0];
    }

    if (launchSiteMesh) {
        launchSiteMesh.position.set(0, 1, 0);
    }

    if (targetSiteMesh) {
        targetSiteMesh.position.set(destination.position[0]-25, destination.position[1], destination.position[2]-100);
    }

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

        aircraftMesh.add(subCamera);

        updateAltitudeDisplay(state.position[1]);
        updateSpeedDisplay(airspeed);
        drawMap(state.position, startPoint, destination.position);

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

    mainCamera.position.set(
        state.position[0] + 30,
        state.position[1] + 15,
        state.position[2] + 10
    );

    controls.target.set(
        state.position[0],
        state.position[1] + 10,
        state.position[2]
    );
    controls.update();

    mainRenderer.render(mainScene, mainCamera);
    subRenderer.render(mainScene, subCamera);
}

setTimeout(() => {
    console.log('シミュレーションを停止しました。');
    stopSimulation = true;
}, 10 * 60 * 1000);

animate();
