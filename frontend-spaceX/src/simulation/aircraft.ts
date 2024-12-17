import { State, Inputs, ForcesMoments } from './interfaces';
import { Aerodynamics } from './aerodynamics';
import { Wind } from './wind';
import { Environment } from './environment';
import { CoordinateTransform } from './coordinateTransform';

// StateはPosition,OrientationをEarth Frameで持ち、Velocity,AngularVelocityはBody Frameで持つ
// 微分計算時、ForcesMomentsはBody Frameで得られるため、重力や風などのEarth FrameベクトルをBody Frameに変換して合わせるか、逆にForcesMomentsをEarthに変換する方法をとる。
// ここではForcesMomentsがBody Frameなので、重力をEarth→Bodyへ変換してから合力計算を行う。

export class Aircraft {
    private state: State;
    private mass: number;
    private inertia: [number, number, number];
    private aero: Aerodynamics;
    private env: Environment;
    private wind: Wind;

    constructor(
        initialState: State,
        mass: number,
        inertia: [number, number, number],
        aero: Aerodynamics,
        env: Environment,
        wind: Wind,
    ) {
        this.state = initialState;
        this.mass = mass;
        this.inertia = inertia;
        this.aero = aero;
        this.env = env;
        this.wind = wind;
    }

    computeDerivative(inputs: Inputs): State {
        // 空力
        const fm = this.aero.getForcesAndMoments(this.state, inputs);

        // 重力 (Earth Frame)
        const gravityEarth = this.env.getGravityInEarthFrame(this.mass);

        // 風(Earth Frame)
        const windEarth = this.wind.getWindVector();

        const windBody = CoordinateTransform.earthToBody(this.state.orientation, windEarth);
        // 重力をBody Frameへ変換
        const gravityBody = CoordinateTransform.earthToBody(this.state.orientation, gravityEarth);

        // Body Frameでの合力
        const Fx_total = fm.Fx + gravityBody[0] + windBody[0];
        const Fy_total = fm.Fy + gravityBody[1] + windBody[1];
        const Fz_total = fm.Fz + gravityBody[2] + windBody[2];

        // 加速度(Body Frame)
        const ax = Fx_total / this.mass;
        const ay = Fy_total / this.mass;
        const az = Fz_total / this.mass;

        // 角速度
        const p = this.state.angularVelocityBody[0];
        const q = this.state.angularVelocityBody[1];
        const r = this.state.angularVelocityBody[2];

        const Ix = this.inertia[0];
        const Iy = this.inertia[1];
        const Iz = this.inertia[2];

        // 角加速度(Body Frame)
        const pdot = (fm.Mx - (q * r * (Iz - Iy))) / Ix;
        const qdot = (fm.My - (r * p * (Ix - Iz))) / Iy;
        const rdot = (fm.Mz - (p * q * (Iy - Ix))) / Iz;

        // 位置微分 (Earth Frame)
        // velocityBodyをEarthに変換
        const velocityEarth = CoordinateTransform.bodyToEarth(this.state.orientation, this.state.velocityBody);

        // Orientation微分 (四元数)
        const q0 = this.state.orientation[0];
        const q1 = this.state.orientation[1];
        const q2 = this.state.orientation[2];
        const q3 = this.state.orientation[3];

        const qdot0 = 0.5 * (-q1 * p - q2 * q - q3 * r);
        const qdot1 = 0.5 * (q0 * p + q2 * r - q3 * q);
        const qdot2 = 0.5 * (q0 * q - q1 * r + q3 * p);
        const qdot3 = 0.5 * (q0 * r + q1 * q - q2 * p);

        return {
            position: [velocityEarth[0], velocityEarth[1], velocityEarth[2]],
            orientation: [qdot0, qdot1, qdot2, qdot3],
            velocityBody: [ax, ay, az],
            angularVelocityBody: [pdot, qdot, rdot]
        };
    }

    update(dt: number, inputs: Inputs): void {
        const derivative = this.computeDerivative(inputs);

        // 状態更新 (シンプルなEuler法)
        this.state = {
            position: [
                this.state.position[0] + derivative.position[0] * dt,
                this.state.position[1] + derivative.position[1] * dt,
                this.state.position[2] + derivative.position[2] * dt,
            ],
            orientation: [
                this.state.orientation[0] + derivative.orientation[0] * dt,
                this.state.orientation[1] + derivative.orientation[1] * dt,
                this.state.orientation[2] + derivative.orientation[2] * dt,
                this.state.orientation[3] + derivative.orientation[3] * dt,
            ],
            velocityBody: [
                this.state.velocityBody[0] + derivative.velocityBody[0] * dt,
                this.state.velocityBody[1] + derivative.velocityBody[1] * dt,
                this.state.velocityBody[2] + derivative.velocityBody[2] * dt,
            ],
            angularVelocityBody: [
                this.state.angularVelocityBody[0] + derivative.angularVelocityBody[0] * dt,
                this.state.angularVelocityBody[1] + derivative.angularVelocityBody[1] * dt,
                this.state.angularVelocityBody[2] + derivative.angularVelocityBody[2] * dt,
            ]
        };

        // 高度が0m未満の場合に修正 Y軸鉛直方向
        if (this.state.position[1] < 0) {
            this.state.position[1] = 0;
            if (this.state.velocityBody[1] < 0) {
                this.state.velocityBody[1] = 0;
            }
        }
        // 四元数正規化
        const norm = Math.sqrt(
            this.state.orientation[0] ** 2 +
            this.state.orientation[1] ** 2 +
            this.state.orientation[2] ** 2 +
            this.state.orientation[3] ** 2
        );
        this.state.orientation = this.state.orientation.map(o => o / norm) as [number, number, number, number];
    }

    getState(): State {
        return this.state;
    }
}
