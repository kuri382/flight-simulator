export class AutopilotController {
    private enabled: boolean;

    constructor() {
        this.enabled = false;
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }
}

export function initializeUI(autopilotController: AutopilotController) {
    const autopilotToggleButton = document.getElementById('autopilotToggleButton') as HTMLButtonElement;
    autopilotToggleButton.addEventListener('click', () => {
        const newState = autopilotController.toggle();
        autopilotToggleButton.textContent = `Autopilot: ${newState ? 'ON' : 'OFF'}`;
    });
}