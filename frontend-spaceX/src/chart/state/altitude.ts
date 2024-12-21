const altitudeDisplay = document.getElementById('altitudeDisplay') as HTMLCanvasElement;

export function updateAltitudeDisplay(altitude: number) {
    const ctx = altitudeDisplay.getContext('2d')!;

    // Canvas の解像度を動的に設定
    const scale = window.devicePixelRatio || 1; // デバイスのピクセル比を取得
    altitudeDisplay.width = altitudeDisplay.clientWidth * scale;
    altitudeDisplay.height = altitudeDisplay.clientHeight * scale;

    ctx.scale(scale, scale); // スケールを設定

    // 背景と文字の描画
    ctx.clearRect(0, 0, altitudeDisplay.clientWidth, altitudeDisplay.clientHeight);
    ctx.fillStyle = '#1e1e1e'; // ダークな背景色
    ctx.fillRect(0, 0, altitudeDisplay.clientWidth, altitudeDisplay.clientHeight);

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; // テキスト基準点を中央に設定
    ctx.fillText(`高度: ${altitude.toFixed(2)} m`, altitudeDisplay.clientWidth / 2, altitudeDisplay.clientHeight / 2);
}
