import { Vector3, Box3 } from 'three';
import Bezier from "./bezier.js";

const ANIMATION_TIME = 2; // seconds
const MAX_DISTANCE = 10;
const MIN_FOV = 50;
const MAX_FOV = 120;

class CameraAnimator {
    camera;
    controls;
    initialDistance;
    targetDistance;
    animationElapsed;

    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;

        this.initialDistance = camera.position.distanceTo(controls.target);
        this.targetPosition = this.initialDistance;

        this.animationElapsed = ANIMATION_TIME;
    }

    animate(target) {
        const size = new Vector3();
        const boundingBox = new Box3().setFromObject(target)
        boundingBox.getSize(size)

        this.initialDistance = this.camera.position
            .distanceTo(this.controls.target);
        this.targetDistance = Math.max(
            size.x, Math.max(size.y, size.z)
        ) * 1.5;

        if (this.initialDistance != this.targetDistance) {
            this.camera.fov = MIN_FOV;
            this.camera.updateProjectionMatrix();

            this.controls.minDistance = this.initialDistance
            this.controls.maxDistance = this.initialDistance
            this.animationElapsed = 0;
        }
    }

    update(delta) {
        if (this.animationElapsed < ANIMATION_TIME) {
            const factor = Bezier.cubicBezier(1, 0, 0, 1, this.animationElapsed / ANIMATION_TIME, ANIMATION_TIME);
            const fovFactor = Math.abs(factor - 0.5) * 2;

            this.camera.fov = MIN_FOV * fovFactor + MAX_FOV * (1 - fovFactor);
            this.camera.updateProjectionMatrix();

            this.controls.maxDistance = this.initialDistance +
                (this.targetDistance - this.initialDistance) * factor
            this.controls.minDistance = this.initialDistance +
                (this.targetDistance - this.initialDistance) * factor

            this.animationElapsed += delta;
        } else {
            this.controls.minDistance = this.targetDistance;
            this.controls.maxDistance = MAX_DISTANCE;

            this.camera.fov = MIN_FOV;
            this.camera.updateProjectionMatrix();

            this.initialDistance = this.initialDistance;
        }
    }
}

export default CameraAnimator;