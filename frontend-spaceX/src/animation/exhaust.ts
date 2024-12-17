import * as THREE from 'three';

interface ExhaustConfig {
    particleCount?: number;
    initialVelocityMin?: number;
    initialVelocityMax?: number;
    lifetimeMin?: number;
    lifetimeMax?: number;
    positionJitter?: number;  // random position jitter around nozzle
    direction?: THREE.Vector3;
    baseOpacity?: number;     // opacity at throttle = 0
    maxOpacity?: number;      // opacity at throttle = 1
    baseSize?: number;        // size at throttle = 0
    maxSizeScale?: number;    // size scale factor at throttle = 1
    velocityScale?: number;   // velocity scale factor for throttle
    lifetimeScale?: number;   // lifetime scale factor for throttle
    textureSize?: number;     // base particle size
    blending?: THREE.Blending;
    alphaTest?: number;
}

const defaultConfig: Required<ExhaustConfig> = {
    particleCount: 80,
    initialVelocityMin: 1,
    initialVelocityMax: 2,
    lifetimeMin: 0.5,
    lifetimeMax: 1.5,
    positionJitter: 3,
    direction: new THREE.Vector3(0, -1, 0),
    baseOpacity: 0.1,
    maxOpacity: 1.0,
    baseSize: 1.5, // 0.3
    maxSizeScale: 3.0, //2.0
    velocityScale: 5, //0.5
    lifetimeScale: 0.5,
    textureSize: 0.02,
    blending: THREE.AdditiveBlending,
    alphaTest: 0.01
};

interface ParticleProps {
    positions: Float32Array;
    velocities: Float32Array;
    lifeTimes: Float32Array;
    ages: Float32Array;
    count: number;
}

export class Exhaust {
    private group: THREE.Group;
    private geometry: THREE.BufferGeometry;
    private material: THREE.PointsMaterial;
    private points: THREE.Points;
    private particleProps: ParticleProps;
    private config: Required<ExhaustConfig>;

    constructor(textureUrl: string, userConfig: ExhaustConfig = {}) {
        this.config = { ...defaultConfig, ...userConfig };

        this.group = new THREE.Group();

        const count = this.config.particleCount;
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);
        const lifeTimes = new Float32Array(count);
        const ages = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            velocities[i] = Math.random() * (this.config.initialVelocityMax - this.config.initialVelocityMin) + this.config.initialVelocityMin;
            lifeTimes[i] = Math.random() * (this.config.lifetimeMax - this.config.lifetimeMin) + this.config.lifetimeMin;
            ages[i] = Math.random() * lifeTimes[i];
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setDrawRange(0, count);

        const texture = new THREE.TextureLoader().load(textureUrl);
        this.material = new THREE.PointsMaterial({
            map: texture,
            transparent: true,
            alphaTest: this.config.alphaTest,
            size: this.config.textureSize,
            depthWrite: false,
            blending: this.config.blending
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.group.add(this.points);

        this.particleProps = { positions, velocities, lifeTimes, ages, count };
    }

    get object3D(): THREE.Group {
        return this.group;
    }

    update(deltaTime: number, throttle: number) {
        const { positions, velocities, lifeTimes, ages, count } = this.particleProps;
        const dir = this.config.direction.clone().normalize();

        for (let i = 0; i < count; i++) {
            ages[i] += deltaTime;

            if (ages[i] > lifeTimes[i]) {
                // Respawn particle
                ages[i] = 0;
                positions[i * 3 + 0] = 0;
                positions[i * 3 + 1] = (Math.random() - 0.5) * this.config.positionJitter;
                positions[i * 3 + 2] = (Math.random() - 0.5) * this.config.positionJitter;

                const velBase = Math.random() * (this.config.initialVelocityMax - this.config.initialVelocityMin) + this.config.initialVelocityMin;
                velocities[i] = velBase * (this.config.velocityScale + throttle);
                const lifeBase = Math.random() * (this.config.lifetimeMax - this.config.lifetimeMin) + this.config.lifetimeMin;
                lifeTimes[i] = lifeBase * (this.config.lifetimeScale + throttle);
            }

            const v = velocities[i];
            positions[i * 3 + 0] += dir.x * v * deltaTime;
            positions[i * 3 + 1] += dir.y * v * deltaTime;
            positions[i * 3 + 2] += dir.z * v * deltaTime;
        }

        this.geometry.attributes.position.needsUpdate = true;

        const opacity = this.config.baseOpacity + (this.config.maxOpacity - this.config.baseOpacity) * throttle;
        const size = this.config.baseSize * (1.0 + (this.config.maxSizeScale - 1.0) * throttle);

        this.material.opacity = opacity;
        this.material.size = size;
    }
}
