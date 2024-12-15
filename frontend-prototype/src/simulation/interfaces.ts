export interface State {
    position: [number, number, number];       // Earth Frame (NED)
    orientation: [number, number, number, number]; // Quaternion representing Body->Earth rotation
    velocityBody: [number, number, number];   // Body Frame
    angularVelocityBody: [number, number, number]; // Body Frame
}

export interface Inputs {
    aileron: number;
    elevator: number;
    rudder: number;
    throttle: number;
    windEarth: [number, number, number]; // Wind in Earth Frame
}

export interface ForcesMoments {
    Fx: number; // body X-axis
    Fy: number; // body Y-axis
    Fz: number; // body Z-axis
    Mx: number; // roll moment about body X
    My: number; // pitch moment about body Y
    Mz: number; // yaw moment about body Z
}
