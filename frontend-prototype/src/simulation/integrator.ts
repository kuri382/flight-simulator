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
            velocityBody: [
                state.velocityBody[0] + derivative.velocityBody[0] * dt,
                state.velocityBody[1] + derivative.velocityBody[1] * dt,
                state.velocityBody[2] + derivative.velocityBody[2] * dt
            ],
            angularVelocityBody: [
                state.angularVelocityBody[0] + derivative.angularVelocityBody[0] * dt,
                state.angularVelocityBody[1] + derivative.angularVelocityBody[1] * dt,
                state.angularVelocityBody[2] + derivative.angularVelocityBody[2] * dt
            ]
        };
    }
}
