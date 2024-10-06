import { Vector3 } from 'three';
import Bezier from "./bezier.js";

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
            const factor = 3 * Bezier.cubicBezier(1, 0, 0, 1, this.animationElapsed / ANIMATION_TIME, ANIMATION_TIME);
            
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
            

            if (factor < 1.5) { // warp effect
                this.controls.target.set(
                    this.initialPosition.x +
                    factor * xVariance,
                    this.initialPosition.y +
                    factor * yVariance,
                    this.initialPosition.z +
                    factor * zVariance,
                )
            } else {
                this.controls.target.set(
                    this.targetPosition.x -
                    (3 - factor) * xVariance,
                    this.targetPosition.y -
                    (3 - factor) * yVariance,
                    this.targetPosition.z -
                    (3 - factor) * zVariance,
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