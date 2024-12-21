export class Wind {
    private constantWind: [number, number, number]; // [x, y, z] in Earth Frame
    private turbulenceIntensity: number;

    constructor(constantWind: [number, number, number], turbulenceIntensity: number = 0) {
        this.constantWind = constantWind;
        this.turbulenceIntensity = turbulenceIntensity;
    }

    getWindVector(): [number, number, number] {
        // 定常風
        const windX = this.constantWind[0];
        const windY = this.constantWind[1];
        const windZ = this.constantWind[2];

        // 乱流（ノイズを追加）
        const turbulenceX = this.turbulenceIntensity * (Math.random() - 0.5);
        const turbulenceY = this.turbulenceIntensity * (Math.random() - 0.5);
        const turbulenceZ = this.turbulenceIntensity * (Math.random() - 0.5);

        return [
            windX + turbulenceX,
            windY + turbulenceY,
            windZ + turbulenceZ,
        ];
    }
}
