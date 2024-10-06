import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js'

import MeshStore from './meshStore.js';
import CameraAnimator from './cameraAnimation.js';
import loadSunAndPlanetData from './sunAndPlanetsLoader.js';

const canvas = document.querySelector('canvas.webgl')

//#region Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
//#endregion

//#region Scene
const scene = new THREE.Scene()

// Add ambient light
// const ambientLight = new THREE.AmbientLight(0x474747, 0.5);
// ambientLight.castShadow = true
// scene.add(ambientLight);
//#endregion

//#region Texture loader
const textureLoader = new THREE.TextureLoader()

const skybox = new THREE.Mesh(
    new THREE.SphereGeometry(500000, 60, 40),
    new THREE.MeshStandardMaterial({
        map: textureLoader.load('static/8k_stars.jpg'),
        side: THREE.BackSide,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: textureLoader.load('static/8k_stars_alpha.jpg'),
        emissiveIntensity: 0.01,
    })
);
scene.add(skybox);

//#region Renderer
const renderer = new THREE.WebGLRenderer({
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
const camera = new THREE.PerspectiveCamera(10, sizes.width / sizes.height, 0.1, 100000000000)
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

//#region Meshes
const meshStore = new MeshStore(scene, camera, renderer,
    function (position) {
        cameraAnimator.animate(position)
    }, document.getElementById("body-text-identifiers")
);

const sunAndPlanetData = loadSunAndPlanetData(textureLoader);
console.log(sunAndPlanetData)
sunAndPlanetData.forEach(planet => {
    planet.forEach(layer => {
        if (layer.mat && layer.position) {
            meshStore.createSphere(layer.scale, layer.resolution,
                layer.resolution, layer.mat, layer.position, layer.name)
        }
    })
})
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

controls.minDistance = 0.2;
controls.maxDistance = 300;
controls.zoomSpeed = 4;
controls.panSpeed = 0.8;
controls.rotateSpeed = 0.5;
controls.dinamicDampingFactor = 1;
controls.enableZoom = true;
controls.enableDamping = true;

controls.addEventListener('change', (event) => {
    const dist = Math.sqrt(Math.pow(camera.position.x, 2) +
        Math.pow(camera.position.y, 2) +
        Math.pow(camera.position.z, 2))

    light.intensity = Math.pow(dist, 2)
})

controls.target.set(
    sunAndPlanetData[3][0].position.x,
    sunAndPlanetData[3][0].position.y,
    sunAndPlanetData[3][0].position.z
)
const cameraAnimator = new CameraAnimator(controls)
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