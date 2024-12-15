const altitudeDisplay = document.getElementById('altitudeDisplay') as HTMLCanvasElement;

export function updateAltitudeDisplay(altitude: number) {
    const ctx = altitudeDisplay.getContext('2d')!;
    ctx.clearRect(0, 0, altitudeDisplay.width, altitudeDisplay.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Altitude: ${altitude.toFixed(2)} m`, altitudeDisplay.width / 2, altitudeDisplay.height / 2);
}