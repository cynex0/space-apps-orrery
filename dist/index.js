import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import MeshStore from './meshStore.js';
import CameraAnimator from './cameraAnimation.js';

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
const ambientLight = new THREE.AmbientLight(0x474747, 0.65);
// ambientLight.castShadow = true
scene.add(ambientLight);
//#endregion

//#region Texture loader
const textureLoader = new THREE.TextureLoader()

const earthTexture = textureLoader.load('static/8k_earth_daymap.jpg')
const sunTexture = textureLoader.load('static/8k_sun.jpg')
//#endregion

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
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 500000)
camera.position.x = 303

scene.add(camera)
//#endregion

//#region Effects
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,   // Strength
    1,   // Radius
    0.1   // Threshold
);
composer.addPass(bloomPass);
//#endregion

//#region Controls
const controls = new OrbitControls(camera, canvas)

controls.enableZoom = true;
controls.enableDamping = true;

const cameraAnimator = new CameraAnimator(controls)
//#endregion

//#region Meshes
const meshStore = new MeshStore(scene, camera, renderer,
    function (position) {
        cameraAnimator.animate(position)
    }
);

// Objects
const earth = meshStore.createSphere(1, 512, 512,
    new THREE.MeshPhysicalMaterial({
        map: earthTexture,
        roughness: 1,
        dispersion: 1,
        reflectivity: 0,
        specularIntensity: 0,
        metalness: 0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.8,
        emissive: new THREE.Color(0x0066ff),
        emissiveIntensity: 0.1,
    }), { x: 300, y: 0, z: 0 })

const sun = meshStore.createSphere(109.2, 128, 128,
    new THREE.MeshBasicMaterial({
        map: sunTexture,
    }), { x: 0, y: 0, z: 0 })
//#endregion

//#region Sun light
const light = new THREE.PointLight(0xffffff, 50000);
light.position.set(sun.position.x, sun.position.y, sun.position.z)
// light.castShadow = true

// light.shadow.mapSize.width = 512 // default
// light.shadow.mapSize.height = 512 // default
// light.shadow.camera.near = 0.5 // default
// light.shadow.camera.far = 500 // default

scene.add(light)
//#endregion

//#region Main loop
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

    window.requestAnimationFrame(tick)
};
//#endregion

tick()