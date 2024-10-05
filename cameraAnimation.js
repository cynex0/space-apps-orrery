import { Vector3 } from 'three';
import bezier from "./bezier.js";

const ANIMATION_TIME = 1;

class CameraAnimator {
    controls;
    initialPosition;
    targetPosition;
    animationElapsed;

    constructor(controls) {
        this.controls = controls;
        this.initialPosition = new Vector3(
            this.controls.target.x,
            this.controls.target.y,
            this.controls.target.z,
        );
        this.targetPosition = this.initialPosition;

        this.animationElapsed = ANIMATION_TIME;
    }

    animate(target) {
        this.initialPosition = new Vector3(
            this.controls.target.x,
            this.controls.target.y,
            this.controls.target.z,
        );
        this.targetPosition = target;
        this.animationElapsed = 0;
    }

    update(delta) {
        if (this.animationElapsed < ANIMATION_TIME) {
            const factor = bezier(this.animationElapsed, 0, 1, 1, 1)

            this.controls.target.set(
                this.initialPosition.x +
                factor * (this.targetPosition.x - this.initialPosition.x),
                this.initialPosition.y +
                factor * (this.targetPosition.y - this.initialPosition.y),
                this.initialPosition.z +
                factor * (this.targetPosition.z - this.initialPosition.z),
            )

            this.animationElapsed += delta;
        } else {
            this.controls.target.set(
                this.targetPosition.x,
                this.targetPosition.y,
                this.targetPosition.z,
            )
            this.initialPosition = this.targetPosition;
        }
    }
}

export default CameraAnimator;