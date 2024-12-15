export class Environment {
    private gravity = 9.81; // m/s^2

    getGravityInEarthFrame(mass: number): [number, number, number] {
        // NEDでDown軸正、Z軸正方向が下向きなら +mass*gとなる
        return [0, 0, -mass * this.gravity];
    }
}
