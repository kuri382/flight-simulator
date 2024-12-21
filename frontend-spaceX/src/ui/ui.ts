export function getInputs(): {
    thrustPitch: number;
    thrustYaw: number;
    gridFinPitch: number;
    gridFinYaw: number;
    throttle: number;
} {
    const thrustPitchSlider = document.getElementById('thrustPitchSlider') as HTMLInputElement;
    const thrustYawSlider = document.getElementById('thrustYawSlider') as HTMLInputElement;
    const gridFinPitchSlider = document.getElementById('gridFinPitchSlider') as HTMLInputElement;
    const gridFinPitchYaw = document.getElementById('gridFinYawSlider') as HTMLInputElement;
    const throttleSlider = document.getElementById('throttleSlider') as HTMLInputElement;

    return {
        thrustPitch: parseFloat(thrustPitchSlider.value) * Math.PI / 180,
        thrustYaw: parseFloat(thrustYawSlider.value) * Math.PI / 180,
        gridFinPitch: parseFloat(gridFinPitchSlider.value) * Math.PI / 180,
        gridFinYaw: parseFloat(gridFinPitchYaw.value) * Math.PI / 180,
        throttle: parseFloat(throttleSlider.value)
    };
}
