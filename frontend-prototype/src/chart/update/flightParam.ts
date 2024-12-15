import { Chart } from 'chart.js';
import { State } from '../../simulation/interfaces';
import { TimeSeriesRecord } from '../../simulation/simulationManager';

export function updateFlightParamChart(
    flightParamsChart: Chart,
    angleOfAttack: number,
    airspeed: number,
    lastPoint: TimeSeriesRecord
) {
    flightParamsChart.data.labels!.push(lastPoint.time);
    (flightParamsChart.data.datasets[0].data as number[]).push(angleOfAttack); // Angle of Attack
    (flightParamsChart.data.datasets[1].data as number[]).push(airspeed); // Airspeed
    flightParamsChart.update();
}
