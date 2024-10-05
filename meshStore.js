import * as THREE from 'three';
import DomEvents from './threex.domevents.js';

class MeshStore {
    scene;
    meshes;
    camera;
    renderer;
    onClick;
    domEvents;

    constructor(scene, camera, renderer, onClick) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.onClick = onClick;

        this.domEvents = new DomEvents(camera, renderer.domElement)
        this.meshes = [];
    }

    addMesh(mesh) {
        this.meshes.push(mesh)
        this.scene.add(mesh)

        const call = this.onClick

        this.domEvents.addEventListener(mesh, 'click', function () {
            call(mesh.position)
        }, false)
    }

    createSphere(radius, wDiv, hDiv, mat, pos) {
        const geo = new THREE.SphereGeometry(radius, wDiv, hDiv)
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(pos.x, pos.y, pos.z)
        // mesh.castShadow = true

        this.addMesh(mesh)

        return mesh
    }
}

export default MeshStore;