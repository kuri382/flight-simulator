import { State, Inputs, ForcesMoments } from './interfaces';

export class Aerodynamics {
    private readonly airDensity = 1.225; // 空気密度 [kg/m^3]
    private readonly wingArea = 20; // 翼面積 [m^2]

    getForcesAndMoments(state: State, inputs: Inputs): ForcesMoments {
        // 仮の迎角モデル
        const angleOfAttack = Math.atan2(state.velocity[2], state.velocity[0]) + inputs.elevator * 0.1;

        // 揚力係数（CL）のモデル
        const cl = 2 * Math.PI * angleOfAttack; // 仮の線形モデル
        const lift = 0.5 * this.airDensity * Math.pow(state.velocity[0], 2) * this.wingArea * cl;

        // 抗力係数（CD）のモデル
        const cd = 0.02 + 0.04 * Math.pow(angleOfAttack, 2); // 仮のパラボラモデル
        const drag = 0.5 * this.airDensity * Math.pow(state.velocity[0], 2) * this.wingArea * cd;

        return {
            Fx: -drag + inputs.throttle * 5000, // 推力と抗力
            Fy: lift, // 揚力
            Fz: 0, // 水平面のみ
            Mx: inputs.aileron * 500, // ロールモーメント
            My: inputs.rudder * -500, // ヨーイングモーメント
            Mz: inputs.elevator * 500, // ピッチングモーメント
        };
    }
}

