import { Aircraft } from './aircraft';
import { Integrator } from './integrator';
import { Inputs, State } from './interfaces';

export interface TimeSeriesRecord {
    time: number;
    position: [number, number, number];
}

export class SimulationManager {
    private aircraft: Aircraft;
    private integrator: Integrator;
    private dt: number;
    private currentTime: number;
    private timeSeriesData: TimeSeriesRecord[];

    constructor(aircraft: Aircraft, integrator: Integrator, dt: number) {
        this.aircraft = aircraft;
        this.integrator = integrator;
        this.dt = dt;
        this.currentTime = 0;
        this.timeSeriesData = [];
    }

    step(inputs: Inputs): void {
        this.aircraft.update(inputs, this.dt, this.integrator);
        const state = this.aircraft.getState();
        this.timeSeriesData.push({
            time: this.currentTime,
            position: state.position
        });
        this.currentTime += this.dt;
    }

    getState(): State {
        return this.aircraft.getState();
    }

    getTimeSeriesData(): TimeSeriesRecord[] {
        return this.timeSeriesData;
    }
}
