import { State, Inputs, ForcesMoments } from './interfaces';

// 迎角などはBody Frame速度から計算してForcesMomentsをBody Frameで返す。

export class Aerodynamics {
    private airDensity = 1.225;
    private wingArea = 20;

    getForcesAndMoments(state: State, inputs: Inputs): ForcesMoments {
        const u = state.velocityBody[0];
        const w = state.velocityBody[2];
        const angleOfAttack = Math.atan2(w, u) + inputs.elevator * 0.1;

        const cl = 2 * Math.PI * angleOfAttack;
        const q = 0.5 * this.airDensity * (u * u + w * w); // simplified: ignoring side velocity for now
        const lift = q * this.wingArea * cl;

        const cd = 0.02 + 0.04 * (angleOfAttack * angleOfAttack);
        const drag = q * this.wingArea * cd;

        return {
            Fx: -drag + inputs.throttle * 20000,
            Fy: 0, // for simplicity
            Fz: lift,
            Mx: inputs.aileron * 500,
            My: inputs.elevator * 500,
            Mz: inputs.rudder * -500,
        };
    }
}
