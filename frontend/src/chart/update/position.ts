import { Chart } from 'chart.js';
import { State } from '../../simulation/interfaces';
import { TimeSeriesRecord } from '../../simulation/simulationManager';

export function updatePositionChart(
    positionChart: Chart,
    state: State,
    lastPoint: TimeSeriesRecord
) {
    positionChart.data.labels!.push(lastPoint.time);
    (positionChart.data.datasets[0].data as number[]).push(state.position[0]); // X Position
    (positionChart.data.datasets[1].data as number[]).push(state.position[1]); // Y Position
    (positionChart.data.datasets[2].data as number[]).push(state.position[2]); // Z Position
    positionChart.update();
}
