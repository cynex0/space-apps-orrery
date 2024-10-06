import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js'

import MeshStore from './meshStore.js';
import CameraAnimator from './cameraAnimation.js';
import ControllerAnimator from './controllerAnimation.js';
import loadSunAndPlanetData from './sunAndPlanetsLoader.js';

const canvas = document.querySelector('canvas.webgl')
let targetedMesh = null;

//#region Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
//#endregion

//#region Scene
const scene = new THREE.Scene()
//#endregion

//#region Texture loader
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader();

const texture = cubeTextureLoader.load([
    './static/cubemap/nx.jpg',
    './static/cubemap/ny.jpg',
    './static/cubemap/nz.jpg',
    './static/cubemap/px.jpg',
    './static/cubemap/py.jpg',
    './static/cubemap/pz.jpg',
]);
scene.background = texture;
//#endregion

//#region Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
//#endregion

//Renderer gets updated each time window is resized
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    composer.setSize(sizes.width, sizes.height);
})
//#endregion

//#region Camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.0001, 100000000000)
scene.add(camera)
//#endregion

//#region Effects
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,   // Strength
    1,   // Radius
    0.33   // Threshold
);
composer.addPass(bloomPass);
//#endregion

//#region Sun light
const light = new THREE.PointLight(0xffffff, 10000);
light.position.set(0, 0, 0)
// light.castShadow = true

// light.shadow.mapSize.width = 512 // default
// light.shadow.mapSize.height = 512 // default
// light.shadow.camera.near = 0.5 // default
// light.shadow.camera.far = 500 // default

scene.add(light)
//#endregion

//#region Controls
const controls = new TrackballControls(camera, canvas)

controls.zoomSpeed = 4;
controls.panSpeed = 1;
controls.rotateSpeed = 1;
controls.dinamicDampingFactor = 0.1;
controls.enableDamping = true;

controls.addEventListener('change', () => {
    const dist = Math.sqrt(Math.pow(camera.position.x, 2) +
        Math.pow(camera.position.y, 2) +
        Math.pow(camera.position.z, 2))

    light.intensity = Math.pow(dist, 2)
})

const cameraAnimator = new CameraAnimator(controls)
const controllerAnimator = new ControllerAnimator(camera, controls)
//#endregion

//#region Meshes
const sunAndPlanetData = loadSunAndPlanetData(textureLoader);

const meshStore = new MeshStore(scene, camera, renderer,
    function (mesh) {
        if (mesh != targetedMesh) {
            cameraAnimator.animate(mesh.position)
            controllerAnimator.animate(mesh)

            targetedMesh = mesh;
        }
    }, document.getElementById("body-text-identifiers")
);

sunAndPlanetData.forEach(planet => {
    planet.forEach(layer => {
        if (layer.mat && layer.position) {
            const mesh = meshStore.createSphere(layer.scale, layer.resolution,
                layer.resolution, layer.mat, layer.position, layer.name)

            if (layer.name == "Earth") { // default earth mesh for zoom
                targetedMesh = mesh;
            }
        }
    })
})
//#endregion

//#region Main loop

const FRAME_TIME = 1000 / 120;
const clock = new THREE.Clock()

let elapsedTime = 0;

const tick = () => {
    const delta = clock.getElapsedTime() - elapsedTime
    elapsedTime = elapsedTime + delta

    controls.update()
    controls.enableDamping = true

    cameraAnimator.update(delta)
    controllerAnimator.update(delta)

    renderer.render(scene, camera)
    composer.render()

    if (delta < FRAME_TIME) {
        setTimeout(
            () => window.requestAnimationFrame(tick),
            FRAME_TIME - delta)
    }
};
//#endregion

tick()

window.addEventListener("load", () => {
    setTimeout(() => {
        if (targetedMesh) {
            cameraAnimator.animate(targetedMesh.position)
            controllerAnimator.animate(targetedMesh)

            setTimeout(() => {
                const loading = document.getElementById("loading");
                loading.style.background = "transparent";
                loading.style.pointerEvents = "none";
            }, 1000)
        }
    }, 200) // delay to pass jitter frame
});