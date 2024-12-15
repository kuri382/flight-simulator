export interface State {
    position: [number, number, number];
    orientation: [number, number, number, number]; // quaternion
    velocity: [number, number, number];
    angularVelocity: [number, number, number];
}

export interface Inputs {
    aileron: number;
    elevator: number;
    rudder: number;
    throttle: number;
    wind: [number, number, number];
}

export interface ForcesMoments {
    Fx: number;
    Fy: number;
    Fz: number;
    Mx: number;
    My: number;
    Mz: number;
}
