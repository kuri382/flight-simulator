// mapDisplay.ts
const mapCanvas = document.getElementById('mapCanvas') as HTMLCanvasElement;
const mapCtx = mapCanvas.getContext('2d')!;

// Define map parameters
// For simplicity, assume the top-left corner as (minX, minZ) and bottom-right corner as (maxX, maxZ)
// Or dynamically determine it based on positions
let minX = -100;
let maxX = 400;
let minZ = -100;
let maxZ = 400;

export function drawMap(currentPosition: [number, number, number],
    startPosition: [number, number, number],
    targetPosition: [number, number, number]) {

    // Clear map
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    // Background
    mapCtx.fillStyle = 'rgba(34, 34, 34, 0.5)';
    mapCtx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);

    // Coordinate transform function (world -> map canvas)
    const transform = (x: number, z: number) => {
        const xRatio = (x - minX) / (maxX - minX);
        const zRatio = (z - minZ) / (maxZ - minZ);
        const px = xRatio * mapCanvas.width;
        const pz = zRatio * mapCanvas.height;
        return [px, pz];
    };

    // Draw start point
    {
        const [sx, sz] = transform(startPosition[0], startPosition[2]);
        mapCtx.fillStyle = 'blue';
        mapCtx.beginPath();
        mapCtx.arc(sx, sz, 5, 0, Math.PI * 2);
        mapCtx.fill();

        // Add "Start" text
        mapCtx.fillStyle = 'white';
        mapCtx.font = '20px Arial';
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        mapCtx.fillText('Start', sx, sz - 20);
    }

    // Draw current position
    {
        const [cx, cz] = transform(currentPosition[0], currentPosition[2]);
        mapCtx.fillStyle = 'white';
        mapCtx.beginPath();
        mapCtx.arc(cx, cz, 5, 0, Math.PI * 2);
        mapCtx.fill();

        // Add "Current" text
        mapCtx.fillStyle = 'white';
        mapCtx.font = '20px Arial';
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        mapCtx.fillText('Current', cx, cz + 20);
    }

    // Draw target position
    {
        const [tx, tz] = transform(targetPosition[0], targetPosition[2]);
        mapCtx.fillStyle = 'red';
        mapCtx.beginPath();
        mapCtx.arc(tx, tz, 5, 0, Math.PI * 2);
        mapCtx.fill();

        // Add "Target" text
        mapCtx.fillStyle = 'white';
        mapCtx.font = '20px Arial';
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        mapCtx.fillText('Target', tx, tz - 20);
    }

    // Optionally draw grid lines
    mapCtx.strokeStyle = '#444';
    mapCtx.lineWidth = 1;
    const step = 50;
    for (let x = minX; x <= maxX; x += step) {
        const [lineXStart, _] = transform(x, minZ);
        const [lineXEnd, __] = transform(x, maxZ);
        mapCtx.beginPath();
        mapCtx.moveTo(lineXStart, 0);
        mapCtx.lineTo(lineXStart, mapCanvas.height);
        mapCtx.stroke();
    }

    for (let z = minZ; z <= maxZ; z += step) {
        const [lineZStart, lineZPos] = transform(minX, z);
        const [lineZEnd, lineZPosEnd] = transform(maxX, z);
        mapCtx.beginPath();
        mapCtx.moveTo(0, lineZPos);
        mapCtx.lineTo(mapCanvas.width, lineZPos);
        mapCtx.stroke();
    }
}
