import { Chart, registerables, LinearScale, CategoryScale } from 'chart.js';

Chart.register(...registerables);
Chart.register(LinearScale, CategoryScale);

export function initPositionChart(canvas: HTMLCanvasElement): Chart {
    return new Chart(canvas.getContext('2d')!, {
        type: 'line',
        data: {
            labels: [] as number[],
            datasets: [
                { label: 'X Position', data: [] as number[], borderColor: 'red', fill: false },
                { label: 'Y Position', data: [] as number[], borderColor: 'green', fill: false },
                { label: 'Z Position', data: [] as number[], borderColor: 'blue', fill: false }
            ]
        },
        options: {
            responsive: false,
            scales: {
                x: { title: { display: true, text: 'Time (s)' }, type: 'linear' },
                y: { title: { display: true, text: 'Position (m)' } }
            }
        }
    });
}

export function initOrientationChart(canvas: HTMLCanvasElement): Chart {
    return new Chart(canvas.getContext('2d')!, {
        type: 'line',
        data: {
            labels: [] as number[],
            datasets: [
                { label: 'Roll', data: [] as number[], borderColor: 'orange', fill: false },
                { label: 'Pitch', data: [] as number[], borderColor: 'purple', fill: false },
                { label: 'Yaw', data: [] as number[], borderColor: 'brown', fill: false }
            ]
        },
        options: {
            responsive: false,
            scales: {
                x: { title: { display: true, text: 'Time (s)' }, type: 'linear' },
                y: { title: { display: true, text: 'Orientation (degrees)' } }
            }
        }
    });
}

export function initFlightParamsChart(canvas: HTMLCanvasElement): Chart {
    return new Chart(canvas.getContext('2d')!, {
        type: 'line',
        data: {
            labels: [] as number[],
            datasets: [
                { label: 'Angle of Attack (AoA)', data: [] as number[], borderColor: 'pink', fill: false },
                { label: 'Airspeed', data: [] as number[], borderColor: 'cyan', fill: false }
            ]
        },
        options: {
            responsive: false,
            scales: {
                x: { title: { display: true, text: 'Time (s)' }, type: 'linear' },
                y: { title: { display: true, text: 'Value' } }
            }
        }
    });
}
