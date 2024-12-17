import { State, Inputs, ForcesMoments } from './interfaces';

// 迎角などはBody Frame速度から計算してForcesMomentsをBody Frameで返す。

export class Aerodynamics {
    private airDensity = 1.225; // ρ
    private wingArea = 0; // S
    private chord = 2.0;   // c (mean aerodynamic chord)
    private C_L0 = 0.2; // [1/rad]
    private C_L_alpha = 5.5;    // dC_L/dα (rad^-1)
    private C_D0 = 0.02;
    private C_D_alpha = 0.04;   // 非線形項を単純化するため線形近似
    private C_M0 = 0.0;
    private C_M_alpha = -1.2;   // 静安定のため負値
    private C_M_delta_e = -0.5; // エレベータ偏角によるモーメント変化

    getForcesAndMoments(state: State, inputs: Inputs): ForcesMoments {
        const u = state.velocityBody[0];
        const w = state.velocityBody[2];
        const v = state.velocityBody[1];
        const V = Math.sqrt(u*u + v*v + w*w);

        // 迎角
        const alpha = Math.atan2(w, u); // for three.js axis (w, u)

        // 動圧
        const q = 0.5 * this.airDensity * V * V;

        // コントロール入力 (エレベータ)
        const delta_e = inputs.elevator;

        // 線形モデルによる空力係数
        const C_L = this.C_L0 + this.C_L_alpha * alpha + 0 * delta_e;
        const C_D = this.C_D0 + this.C_D_alpha * alpha;
        const C_M = this.C_M0 + this.C_M_alpha * alpha + this.C_M_delta_e * delta_e;

        // 力とモーメントへ変換
        const lift = q * this.wingArea * C_L;
        const drag = q * this.wingArea * C_D;
        const pitchMoment = q * this.wingArea * this.chord * C_M;

        return {
            Fx: 0,
            Fy: inputs.throttle * 3500000 - drag,
            Fz: 0,
            Mx: inputs.aileron * 500,
            My: inputs.rudder * -500,
            Mz: inputs.elevator * -0.05 + pitchMoment,
        };
    }
}
