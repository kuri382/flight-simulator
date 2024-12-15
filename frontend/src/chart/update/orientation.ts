import { Chart } from 'chart.js';
import { State } from '../../simulation/interfaces';
import { TimeSeriesRecord } from '../../simulation/simulationManager';

export function updateOrientationChart(
    orientationChart: Chart,
    state: State,
    lastPoint: TimeSeriesRecord
) {
    orientationChart.data.labels!.push(lastPoint.time);
    (orientationChart.data.datasets[0].data as number[]).push(state.orientation[0]); // Roll
    (orientationChart.data.datasets[1].data as number[]).push(state.orientation[1]); // Pitch
    (orientationChart.data.datasets[2].data as number[]).push(state.orientation[2]); // Yaw
    orientationChart.update();
}
