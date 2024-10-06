import * as THREE from 'three';
import DomEvents from './threex.domevents.js';
import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.mjs'

class MeshStore {
    scene;
    meshes;
    camera;
    renderer;
    onClick;
    domEvents;
    fuzzySearch;
    textContainer;
    scheduleFuzzySearchRefresh;

    constructor(scene, camera, renderer, onClick, textContainer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.onClick = onClick;
        this.textContainer = textContainer;
        this.scheduleFuzzySearchRefresh = true;

        this.domEvents = new DomEvents(camera, renderer.domElement)
        this.meshes = [];
    }

    addMesh(mesh, name, hideName) {
        this.meshes.push(mesh)
        this.scene.add(mesh)

        const call = this.onClick
        const domEvents = this.domEvents

        if (name) {
            if (!hideName) {
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
                    call(mesh)
                })
            }

            let mouseMoveAttached = false;

            const mouseMoveListener = function () {
                potentialClick = false;

                if (mouseMoveAttached) {
                    domEvents.removeEventListener(mesh, 'mousemove', mouseMoveListener)
                }
                mouseMoveAttached = false;
            };

            let potentialClick = true;

            domEvents.addEventListener(mesh, 'mousedown', function () {
                potentialClick = true;


                domEvents.addEventListener(mesh, 'mousemove', mouseMoveListener, false);
                mouseMoveAttached = true;
            }, false)

            domEvents.addEventListener(mesh, 'click', function () {
                if (potentialClick) {
                    call(mesh)
                }

                if (mouseMoveAttached) {
                    domEvents.removeEventListener(mesh, 'mousemove', mouseMoveListener)
                }
                mouseMoveAttached = false;
            }, false)

            this.scheduleFuzzySearchRefresh = true;
        }
    }

    search(query) {
        if (!this.fuzzySearch || this.scheduleFuzzySearchRefresh) {
            this.fuzzySearch = new Fuse(this.meshes, {
                keys: ['name']
            });

            this.scheduleFuzzySearchRefresh = false;
        }

        return this.fuzzySearch.search(query)
    }

    createSphere(radius, wDiv, hDiv, mat, pos, name, hideName) {
        const geo = new THREE.SphereGeometry(radius, wDiv, hDiv)
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(pos.x, pos.y, pos.z)
        mesh.name = name
        // mesh.castShadow = true

        this.addMesh(mesh, name, hideName)

        return mesh
    }

    getMesh(name) {
        return this.meshes.find(mesh => {return mesh.name === name})
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
        position.x = (precomputedX + width / 2) * positionMultiplyer;

        const precomputedY = (position.y * height / 2);
        position.y = (- precomputedY + height / 2) * positionMultiplyer;

        const opacity = (Math.abs(precomputedX) / (width / 2)) +
            (Math.abs(precomputedY) / (height / 2));
        element.style.opacity = opacity;

        if (opacity > 0.2) {
            element.style.pointerEvents = "all"
        } else {
            element.style.pointerEvents = "none"
        }

        position.z = 0;

        return position;
    }
}

export default MeshStore;