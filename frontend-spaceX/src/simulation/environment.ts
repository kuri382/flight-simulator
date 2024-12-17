export class Environment {
    private gravity = 9.81; // m/s^2

    getGravityInEarthFrame(mass: number): [number, number, number] {
        // Y軸鉛直方向
        return [0, -mass * this.gravity, 0];
    }
}
