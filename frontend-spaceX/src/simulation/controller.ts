// controller.ts
import { State, Inputs } from './interfaces';
import * as THREE from 'three';

interface Destination {
    position: [number, number, number];
    velocity: [number, number, number];
}
class PID {
    private kp: number;
    private ki: number;
    private kd: number;
    private integral: number;
    private prevError: number;
    private initialized: boolean;
    private integralLimit: number;

    constructor(kp: number, ki: number, kd: number, integralLimit = 1000) {
        this.kp = kp;
        this.ki = ki;
        this.kd = kd;
        this.integral = 0;
        this.prevError = 0;
        this.initialized = false;
        this.integralLimit = integralLimit;
    }

    update(error: number, dt: number): number {
        if (!this.initialized) {
            this.prevError = error;
            this.initialized = true;
        }
        this.integral += error * dt;
        // Limit integral
        this.integral = Math.max(Math.min(this.integral, this.integralLimit), -this.integralLimit);

        const derivative = (error - this.prevError) / dt;
        this.prevError = error;

        const output = this.kp * error + this.ki * this.integral + this.kd * derivative;
        return output;
    }

    reset(): void {
        this.integral = 0;
        this.prevError = 0;
        this.initialized = false;
    }
}

export class Controller {
    private pitchPID: PID;
    private yawPID: PID;
    private altitudePID: PID;
    private speedPID: PID;

    constructor() {
        // Adjust gains as needed
        this.altitudePID = new PID(0.1, 0.0001, 0.005);
        this.pitchPID = new PID(0.15, 0.0001, 0.05);
        this.yawPID = new PID(0.15, 0.0001, 0.05);
        this.speedPID = new PID(0.05, 0.0001, 0.01);
    }

    getControlInputs(state: State, destination: Destination, dt: number): Inputs {
        const position = state.position;
        const orientation = new THREE.Quaternion(
            state.orientation[1],
            state.orientation[2],
            state.orientation[3],
            state.orientation[0]
        );
        const velocityBody = state.velocityBody;

        // Convert Body velocity to Earth frame
        const velocityEarth = this.bodyToEarth(orientation, velocityBody);
        const speed = velocityEarth.length();

        // Extract Euler angles (ZYX order)
        const euler = new THREE.Euler();
        euler.setFromQuaternion(orientation, 'ZYX');
        const currentRoll = euler.x;
        const currentPitch = euler.y;
        const currentYaw = euler.z;

        // Target values
        const destinationAltitude = destination.position[1];
        const destinationSpeed = new THREE.Vector3(destination.velocity[0], destination.velocity[1], destination.velocity[2]).length();

        // Horizontal distance to target
        const dx = destination.position[0] - position[0];
        const dz = destination.position[2] - position[2];
        const horizontalDist = Math.sqrt(dx * dx + dz * dz);

        // Altitude control -> desired pitch angle
        const altitudeError = destinationAltitude - position[1];
        const desiredPitchRaw = this.altitudePID.update(altitudeError, dt);
        const desiredPitchClamped = Math.max(Math.min(desiredPitchRaw, 0.1), -0.1);

        // Yaw control target
        let desiredYaw = Math.atan2(dx, dz);
        let yawError = desiredYaw - currentYaw;
        yawError = ((yawError + Math.PI) % (2 * Math.PI)) - Math.PI;

        const closeThreshold = 10;
        if (horizontalDist < closeThreshold) {
            // If close to target, aim to have final speed = 0
            const pitchError = (0 - currentPitch);
            const pitchControl = this.pitchPID.update(pitchError, dt);

            // Maintain current yaw or align with desiredYaw minimally
            // Here, could set yawErrorClose = 0 to maintain heading,
            // or try to align yaw to desired yaw if needed.
            const yawErrorClose = yawError * 0.1; // small correction
            const yawControl = this.yawPID.update(yawErrorClose, dt);

            // Speed should be zero at final destination
            const speedError = 0 - speed; // target 0 speed
            const throttleControl = this.speedPID.update(speedError, dt);
            const throttle = Math.min(Math.max(throttleControl, 0), 1);

            const maxControlAngle = 0.1;
            const thrustPitch = Math.max(Math.min(pitchControl, maxControlAngle), -maxControlAngle);
            const thrustYaw = Math.max(Math.min(yawControl, maxControlAngle), -maxControlAngle);
            const gridFinPitch = thrustPitch;
            const gridFinYaw = thrustYaw;

            return {
                throttle: throttle,
                thrustPitch: thrustPitch,
                thrustYaw: thrustYaw,
                gridFinPitch: gridFinPitch,
                gridFinYaw: gridFinYaw,
                windEarth: [0, 0, 0]
            };
        } else {
            // Normal guidance
            const pitchError = desiredPitchClamped - currentPitch;
            const pitchControl = this.pitchPID.update(pitchError, dt);
            const yawControl = this.yawPID.update(yawError, dt);

            const speedError = destinationSpeed - speed;
            const throttleControl = this.speedPID.update(speedError, dt);
            const throttle = Math.min(Math.max(throttleControl, 0), 1);

            const maxControlAngle = 0.1;
            const thrustPitch = Math.max(Math.min(pitchControl, maxControlAngle), -maxControlAngle);
            const thrustYaw = Math.max(Math.min(yawControl, maxControlAngle), -maxControlAngle);
            const gridFinPitch = thrustPitch;
            const gridFinYaw = thrustYaw;

            return {
                throttle: throttle,
                thrustPitch: thrustPitch,
                thrustYaw: thrustYaw,
                gridFinPitch: gridFinPitch,
                gridFinYaw: gridFinYaw,
                windEarth: [0, 0, 0]
            };
        }
    }

    private bodyToEarth(q: THREE.Quaternion, vBody: [number, number, number]): THREE.Vector3 {
        const v = new THREE.Vector3(vBody[0], vBody[1], vBody[2]);
        return v.applyQuaternion(q);
    }
}
