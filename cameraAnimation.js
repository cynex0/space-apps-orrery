import { Vector3 } from 'three';
import Bezier from "./bezier.js";

const AU_TO_METERS = 1.496e11;
const ANIMATION_TIME = 2; // seconds

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
            const factor = Bezier.cubicBezier(1, 0, 0, 1, this.animationElapsed / ANIMATION_TIME, ANIMATION_TIME);
            
            let xVariance = this.targetPosition.x - this.initialPosition.x;
            let yVariance = this.targetPosition.y - this.initialPosition.y;
            let zVariance = this.targetPosition.z - this.initialPosition.z;
            
            const magnitude = Math.sqrt(
                Math.pow(xVariance, 2) +
                Math.pow(yVariance, 2),
                Math.pow(zVariance, 2)
            )

            xVariance = xVariance / magnitude;
            yVariance = yVariance / magnitude;
            zVariance = zVariance / magnitude;
            
            if (factor < 0.5) { // warp effect
                this.controls.target.set(
                    this.initialPosition.x +
                    factor * xVariance / AU_TO_METERS,
                    this.initialPosition.y +
                    factor * yVariance / AU_TO_METERS,
                    this.initialPosition.z +
                    factor * zVariance / AU_TO_METERS,
                )
            } else {
                this.controls.target.set(
                    this.targetPosition.x -
                    (1 - factor) * xVariance / AU_TO_METERS * 5,
                    this.targetPosition.y -
                    (1 - factor) * yVariance / AU_TO_METERS * 5,
                    this.targetPosition.z -
                    (1 - factor) * zVariance / AU_TO_METERS * 5,
                )
            }

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