export function getInputs(): {
    aileron: number;
    elevator: number;
    rudder: number;
    throttle: number;
} {
    const aileronSlider = document.getElementById('aileronSlider') as HTMLInputElement;
    const elevatorSlider = document.getElementById('elevatorSlider') as HTMLInputElement;
    const rudderSlider = document.getElementById('rudderSlider') as HTMLInputElement;
    const throttleSlider = document.getElementById('throttleSlider') as HTMLInputElement;

    return {
        aileron: parseFloat(aileronSlider.value) * Math.PI / 180,
        elevator: parseFloat(elevatorSlider.value) * Math.PI / 180,
        rudder: parseFloat(rudderSlider.value) * Math.PI / 180,
        throttle: parseFloat(throttleSlider.value)
    };
}
