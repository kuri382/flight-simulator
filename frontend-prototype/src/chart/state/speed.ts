const SpeedDisplay = document.getElementById('speedDisplay') as HTMLCanvasElement;

export function updateSpeedDisplay(speed: number) {
    const ctx = SpeedDisplay.getContext('2d')!;

    // Canvas の解像度を動的に設定
    const scale = window.devicePixelRatio || 1; // デバイスのピクセル比を取得
    SpeedDisplay.width = SpeedDisplay.clientWidth * scale;
    SpeedDisplay.height = SpeedDisplay.clientHeight * scale;

    ctx.scale(scale, scale); // スケールを設定

    // 背景と文字の描画
    ctx.clearRect(0, 0, SpeedDisplay.clientWidth, SpeedDisplay.clientHeight);
    ctx.fillStyle = '#1e1e1e'; // ダークな背景色
    ctx.fillRect(0, 0, SpeedDisplay.clientWidth, SpeedDisplay.clientHeight);

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; // テキスト基準点を中央に設定
    const speedInKmH = speed * 3.6;
    ctx.fillText(`対気速度: ${speedInKmH.toFixed(2)} km/h`, SpeedDisplay.clientWidth / 2, SpeedDisplay.clientHeight / 2);
}
