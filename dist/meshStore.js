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
}

export default MeshStore;