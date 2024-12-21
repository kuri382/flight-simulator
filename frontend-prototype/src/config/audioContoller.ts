import * as THREE from 'three';

export class ThrottleSoundController {
    private listener: THREE.AudioListener;
    private sound: THREE.Audio;
    private audioLoader: THREE.AudioLoader;
    private airspeed: number;

    constructor(scene: THREE.Scene, camera: THREE.Camera, audioFilePath: string) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);

        // サウンドオブジェクトを作成
        this.sound = new THREE.Audio(this.listener);

        // オーディオローダーを作成
        this.audioLoader = new THREE.AudioLoader();

        // 初期値
        this.airspeed = 0;

        // 音声ファイルを読み込み
        this.audioLoader.load(audioFilePath, (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true); // ループ再生
            this.sound.setVolume(0); // 初期音量を0
            this.sound.play(); // 再生開始
        });
    }

    updateThrottle(airspeed: number) {
        this.airspeed = THREE.MathUtils.clamp(airspeed, 0, 1); // 0～1の範囲に制限

        // 音量と再生速度を調整
        this.sound.setVolume(this.airspeed); // 音量 (0.0～1.0)
        this.sound.playbackRate = 0.3 + this.airspeed * 1.5; // 再生速度 (0.5～2.0)
    }
}
