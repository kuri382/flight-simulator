import { State, Inputs, ForcesMoments } from './interfaces';
import * as THREE from 'three';

export class Aerodynamics {
    private airDensity = 1.225; // air density [kg/m^3]
    private referenceArea = 10.0; // rocket reference area [m^2]

    // Axial force coefficient approximation: C_A = C_A0 + C_A_alpha * alpha
    private C_A0 = 0.2;
    private C_A_alpha = 0.05;

    // Normal force coefficient (small-angle approximation): C_N = C_N_alpha * alpha
    private C_N_alpha = 4.0;

    // Grid fin parameters
    private gridFinArea = 0.5;  // projected area of grid fin [m^2]
    private C_N_gridFin = 2.5;  // normal force coeff per rad deflection

    private maxColdGasThrust = 7.4e7; // maximum thrust [N]

    // Assume thruster is placed at some offset from CG
    // For example, place thruster slightly offset in X direction or Y direction if needed.
    // Here, assume thruster at CG (no moment), can be changed as needed.
    private thrusterPosition = new THREE.Vector3(0, 0, 0);  // thruster position relative to CG

    // Fin positions for moment calculations
    // Pitch control fins located +/-2m along Z-axis
    // Yaw control fins located +/-2m along X-axis
    private finArmPitch = new THREE.Vector3(0, 0, 2);
    private finArmYaw   = new THREE.Vector3(2, 0, 0);

    getForcesAndMoments(state: State, inputs: Inputs): ForcesMoments {
        const u = state.velocityBody[0];
        const v = state.velocityBody[1]; // Body Y-axis along rocket axis
        const w = state.velocityBody[2];
        const V = Math.sqrt(u * u + v * v + w * w);

        // Angle of attack alpha: angle between rocket axis (Y) and velocity vector
        const alpha = Math.atan2(Math.sqrt(u * u + w * w), v);

        // Dynamic pressure
        const q = 0.5 * this.airDensity * V * V;

        // Compute aerodynamic coefficients
        const C_A = this.C_A0 + this.C_A_alpha * alpha;  // axial direction
        const C_N = this.C_N_alpha * alpha;              // normal direction

        // Axial force (along -Y direction)
        const Fy_axial = -C_A * q * this.referenceArea;

        // Normal force acts perpendicular to rocket axis in the plane of X-Z
        // The direction of normal force should point opposite to the (u,w) direction if we consider restoring force.
        // Velocity component perpendicular to Y-axis:
        const V_perp = Math.sqrt(u * u + w * w);
        let normalDirX = 0;
        let normalDirZ = 0;
        if (V_perp > 1e-8) {
            // Unit vector in direction of velocity component perpendicular to Y
            // Normal force should act to push nose back toward aligned with v (Y-axis)
            // If alpha>0, and velocity has components in X,Z, normal force tries to reduce alpha,
            // so we apply normal force opposite to the direction of (u,w).
            normalDirX = u / V_perp;
            normalDirZ = w / V_perp;
        }

        const normalForceMag = C_N * q * this.referenceArea;
        const Fx_normal = -normalForceMag * normalDirX;  // opposite to the (u,w) direction
        const Fz_normal = -normalForceMag * normalDirZ;

        // Thrust vector calculation
        const thrust = inputs.throttle * this.maxColdGasThrust;
        const thrustPitch = inputs.thrustPitch || 0;
        const thrustYaw = inputs.thrustYaw || 0;

        // Direction: Start from Y axis
        const thrustDir = new THREE.Vector3(0, 1, 0);
        // Apply rotations in order Z->Y->X or as needed. 
        // Here Euler is 'ZYX', meaning first rotate about Z, then Y, then X. 
        // Make sure the chosen order aligns with input definition.
        const thrustRot = new THREE.Euler(thrustPitch, thrustYaw, 0, 'ZYX');
        const thrustMat = new THREE.Matrix4().makeRotationFromEuler(thrustRot);
        thrustDir.applyMatrix4(thrustMat);

        const Fx_thrust = thrust * thrustDir.x;
        const Fy_thrust = thrust * thrustDir.y;
        const Fz_thrust = thrust * thrustDir.z;

        // Grid fin deflections
        const gridFinPitch = inputs.gridFinPitch || 0; // pitch fin deflection [rad]
        const gridFinYaw   = inputs.gridFinYaw || 0;   // yaw fin deflection [rad]

        // Grid fins produce force roughly proportional to deflection
        // Pitch fins produce X-direction force
        const Fx_fin = q * this.gridFinArea * this.C_N_gridFin * gridFinPitch;
        // Yaw fins produce Z-direction force
        const Fz_fin = q * this.gridFinArea * this.C_N_gridFin * gridFinYaw;
        const Fy_fin = 0; // simplified: no Y-direction force from fins

        // Compute moments
        // For thrust: if thruster is not at CG, we do r x F
        const thrusterForceVec = new THREE.Vector3(Fx_thrust, Fy_thrust, Fz_thrust);
        const M_thrust = new THREE.Vector3().crossVectors(this.thrusterPosition, thrusterForceVec);

        // For fins:
        // Pitch fin force acts in X-direction at Z=2m offset
        const finForcePitchVec = new THREE.Vector3(Fx_fin, 0, 0);
        const M_finPitch = new THREE.Vector3().crossVectors(this.finArmPitch, finForcePitchVec);

        // Yaw fin force acts in Z-direction at X=2m offset
        const finForceYawVec = new THREE.Vector3(0, 0, Fz_fin);
        const M_finYaw = new THREE.Vector3().crossVectors(this.finArmYaw, finForceYawVec);

        const M_fin = new THREE.Vector3(
            M_finPitch.x + M_finYaw.x,
            M_finPitch.y + M_finYaw.y,
            M_finPitch.z + M_finYaw.z
        );

        // Total forces
        const Fx_total = Fx_normal + Fx_thrust + Fx_fin;
        const Fy_total = Fy_axial + Fy_thrust + Fy_fin;
        const Fz_total = Fz_normal + Fz_thrust + Fz_fin;

        // Total moments
        // Add thrust moment and fin moment. Aerodynamic moment from the main body could be added if modeled.
        const Mx_total = M_thrust.x + M_fin.x;
        const My_total = M_thrust.y + M_fin.y;
        const Mz_total = M_thrust.z + M_fin.z;

        return {
            Fx: Fx_total,
            Fy: Fy_total,
            Fz: Fz_total,
            Mx: Mx_total,
            My: My_total,
            Mz: Mz_total,
        };
    }
}
