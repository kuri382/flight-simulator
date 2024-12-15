import { State } from './interfaces';

export class Integrator {
    integrate(state: State, derivative: State, dt: number): State {
        // Simple Euler integration
        return {
            position: [
                state.position[0] + derivative.position[0] * dt,
                state.position[1] + derivative.position[1] * dt,
                state.position[2] + derivative.position[2] * dt
            ],
            orientation: [
                state.orientation[0] + derivative.orientation[0] * dt,
                state.orientation[1] + derivative.orientation[1] * dt,
                state.orientation[2] + derivative.orientation[2] * dt,
                state.orientation[3] + derivative.orientation[3] * dt
            ],
            velocity: [
                state.velocity[0] + derivative.velocity[0] * dt,
                state.velocity[1] + derivative.velocity[1] * dt,
                state.velocity[2] + derivative.velocity[2] * dt
            ],
            angularVelocity: [
                state.angularVelocity[0] + derivative.angularVelocity[0] * dt,
                state.angularVelocity[1] + derivative.angularVelocity[1] * dt,
                state.angularVelocity[2] + derivative.angularVelocity[2] * dt
            ]
        };
    }
}
