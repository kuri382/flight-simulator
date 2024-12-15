import { State, Inputs, ForcesMoments } from './interfaces';
import { Aerodynamics } from './aerodynamics';
import { Integrator } from './integrator';

function quaternionToRotationMatrix(q: [number, number, number, number]): number[][] {
    const [q0, q1, q2, q3] = q;
    const q0q0 = q0 * q0;
    const q1q1 = q1 * q1;
    const q2q2 = q2 * q2;
    const q3q3 = q3 * q3;

    return [
        [q0q0 + q1q1 - q2q2 - q3q3, 2 * (q1*q2 - q0*q3),       2 * (q1*q3 + q0*q2)],
        [2 * (q1*q2 + q0*q3),       q0q0 - q1q1 + q2q2 - q3q3, 2 * (q2*q3 - q0*q1)],
        [2 * (q1*q3 - q0*q2),       2 * (q2*q3 + q0*q1),       q0q0 - q1q1 - q2q2 + q3q3]
    ];
}

export class Aircraft {
    private state: State;
    private mass: number;
    private inertia: [number, number, number];
    private aero: Aerodynamics;

    constructor(initialState: State, mass: number, inertia: [number, number, number], aero: Aerodynamics) {
        this.state = initialState;
        this.mass = mass;
        this.inertia = inertia;
        this.aero = aero;
    }

    update(inputs: Inputs, dt: number, integrator: Integrator): void {
        const fm = this.aero.getForcesAndMoments(this.state, inputs);
        const derivative = this.computeStateDerivative(this.state, fm, inputs);
        this.state = integrator.integrate(this.state, derivative, dt);
    }

    computeStateDerivative(state: State, fm: ForcesMoments, inputs: Inputs): State {
        const mass = this.mass; // mass
        const inertia = this.inertia; // inertia tensor
        const g = 9.81;

        // Convert body forces to earth frame if fm is currently in body frame
        // Assuming fm is currently in body frame:
        const R = quaternionToRotationMatrix(state.orientation);
        const F_earth = [
            R[0][0]*fm.Fx + R[0][1]*fm.Fy + R[0][2]*fm.Fz,
            R[1][0]*fm.Fx + R[1][1]*fm.Fy + R[1][2]*fm.Fz,
            R[2][0]*fm.Fx + R[2][1]*fm.Fy + R[2][2]*fm.Fz,
        ];

        // Add gravity in earth frame
        const F_total = [
            F_earth[0],
            F_earth[1],
            F_earth[2] - mass*g
        ];

        // Accelerations in earth frame
        const ax = F_total[0] / mass;
        const ay = F_total[1] / mass;
        const az = F_total[2] / mass;

        // Convert moments (assuming they are given in body frame) to angular accelerations in body frame
        // Angular acceleration
        const p = state.angularVelocity[0];
        const q = state.angularVelocity[1];
        const r = state.angularVelocity[2];

        const Ix = inertia[0];
        const Iy = inertia[1];
        const Iz = inertia[2];

        const angularAcceleration = {
            x: (fm.Mx - (q * r * (Iz - Iy))) / Ix,
            y: (fm.My - (r * p * (Ix - Iz))) / Iy,
            z: (fm.Mz - (p * q * (Iy - Ix))) / Iz,
        };

        // Quaternion derivative
        const q0 = state.orientation[0];
        const q1 = state.orientation[1];
        const q2 = state.orientation[2];
        const q3 = state.orientation[3];

        const quaternionDerivative: [number, number, number, number] = [
            0.5 * (-q1 * p - q2 * q - q3 * r),
            0.5 * (q0 * p + q2 * r - q3 * q),
            0.5 * (q0 * q - q1 * r + q3 * p),
            0.5 * (q0 * r + q1 * q - q2 * p),
        ];

        return {
            position: [
                state.velocity[0],
                state.velocity[1],
                state.velocity[2],
            ],
            velocity: [
                ax,
                ay,
                az,
            ],
            angularVelocity: [
                angularAcceleration.x,
                angularAcceleration.y,
                angularAcceleration.z,
            ],
            orientation: quaternionDerivative,
        };
    }

    getState(): State {
        return this.state;
    }
}