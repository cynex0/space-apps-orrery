import * as THREE from 'three';
import DomEvents from './threex.domevents.js';

class MeshStore {
    scene;
    meshes;
    camera;
    renderer;
    onClick;
    domEvents;
    textContainer;

    constructor(scene, camera, renderer, onClick, textContainer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.onClick = onClick;
        this.textContainer = textContainer;

        this.domEvents = new DomEvents(camera, renderer.domElement)
        this.meshes = [];
    }

    addMesh(mesh, name) {
        this.meshes.push(mesh)
        this.scene.add(mesh)

        const call = this.onClick

        if (name) {
            const span = document.createElement("span");
            const textContent = document.createTextNode(name);
            span.classList.add("body-label");

            span.appendChild(textContent);
            this.textContainer.appendChild(span);

            setInterval(() => {
                const position = this.positionToScreenCoords(mesh, span);

                span.style.transform =
                    `translateX(calc(${position.x}px - 50%)) translateY(calc(${position.y}px - 50%))`;
            }, 2);

            span.addEventListener('click', function () {
                call(mesh.position)
            })
        }

        let potentialClick = true;

        this.domEvents.addEventListener(mesh, 'mousedown', function (event) {
            potentialClick = true;
        }, false)

        this.domEvents.addEventListener(mesh, 'mousemove', function (event) {
            potentialClick = false;
        }, false)

        this.domEvents.addEventListener(mesh, 'click', function () {
            if (potentialClick) {
                call(mesh.position)
            }
        }, false)
    }

    createSphere(radius, wDiv, hDiv, mat, pos, name) {
        const geo = new THREE.SphereGeometry(radius, wDiv, hDiv)
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(pos.x, pos.y, pos.z)
        // mesh.castShadow = true

        this.addMesh(mesh, name)

        return mesh
    }

    positionToScreenCoords(mesh, element) {
        let position = new THREE.Vector3();
        position = position.setFromMatrixPosition(mesh.matrixWorld);
        position.project(this.camera);

        const directionVect = mesh.position.clone()
            .sub(this.camera.position).normalize();
        const cameraFacing = this.camera.getWorldDirection(new THREE.Vector3());
        const positionMultiplyer = Math.sign(cameraFacing.dot(directionVect));

        let width = document.body.clientWidth;
        let height = document.body.clientHeight;

        const precomputedX = (position.x * width / 2);
        position.x = Math.max(element.clientWidth / 2 + 20,
            Math.min((precomputedX + width / 2) * positionMultiplyer,
                width - element.clientWidth / 2 - 20)
        );

        const precomputedY = (position.y * height / 2);
        position.y = Math.max(element.clientHeight / 2 + 20,
            Math.min((- precomputedY + height / 2) * positionMultiplyer,
                height - element.clientHeight / 2 - 20)
        );

        const opacity = (Math.abs(precomputedX) / (width / 2)) +
            (Math.abs(precomputedY) / (height / 2));
        element.style.opacity = opacity;

        if (opacity > 0.4) {
            element.style.pointerEvents = "all"
        } else {
            element.style.pointerEvents = "none"
        }

        position.z = 0;

        return position;
    }
}

export default MeshStore;