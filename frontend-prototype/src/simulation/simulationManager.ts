import { Aircraft } from './aircraft';
import { Inputs, State } from './interfaces';

export interface TimeSeriesRecord {
    time: number;
    position: [number, number, number];
}

export class SimulationManager {
    private aircraft: Aircraft;
    private dt: number;
    private currentTime: number = 0;
    private timeSeries: { time: number; position: [number, number, number]}[] = [];

    constructor(aircraft: Aircraft, dt: number) {
        this.aircraft = aircraft;
        this.dt = dt;
    }

    step(inputs: Inputs): void {
        this.aircraft.update(this.dt, inputs);
        const state = this.aircraft.getState();
        this.timeSeries.push({time: this.currentTime, position: state.position});
        this.currentTime += this.dt;
    }

    getState(): State {
        return this.aircraft.getState();
    }

    getTimeSeriesData() {
        return this.timeSeries;
    }
}
