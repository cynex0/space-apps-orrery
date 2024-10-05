import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

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
const ambientLight = new THREE.AmbientLight(0x474747, 0.65);
// ambientLight.castShadow = true
scene.add(ambientLight);
//#endregion

//#region Texture loader
const textureLoader = new THREE.TextureLoader()
const starsTexture = textureLoader.load('static/8k_stars.jpg')

const skybox = new THREE.Mesh(
    new THREE.SphereGeometry(500000, 60, 40), 
    new THREE.MeshStandardMaterial({
        map: starsTexture,
        side: THREE.BackSide
      })
);
scene.add(skybox);

function createSphere(radius, wDiv, hDiv, mat, pos) {
    const geo = new THREE.SphereGeometry(radius, wDiv, hDiv)
    const mesh = new THREE.Mesh(geo, mat) 
    mesh.position.set(pos.x, pos.y, pos.z)
    // mesh.castShadow = true
    
    scene.add(mesh)
    return mesh
}

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
    1.5,   // Strength
    1,   // Radius
    0.1   // Threshold
);
composer.addPass(bloomPass);
//#endregion

//#region Meshes
const meshStore = new MeshStore(scene, camera, renderer,
    function (position) {
        cameraAnimator.animate(position)
    }
);

const sunAndPlanetData = loadSunAndPlanetData(textureLoader);
sunAndPlanetData.forEach(object => {
    if (object.mat && object.position) {
        meshStore.createSphere(object.scale, object.resolution,
            object.resolution, object.mat, object.position)
    }
})
//#endregion

//#region Sun light
const light = new THREE.PointLight(0xffffff, 5000);
light.position.set(0, 0, 0)
// light.castShadow = true

// light.shadow.mapSize.width = 512 // default
// light.shadow.mapSize.height = 512 // default
// light.shadow.camera.near = 0.5 // default
// light.shadow.camera.far = 500 // default

scene.add(light)
//#endregion

//#region Controls
const controls = new OrbitControls(camera, canvas)

controls.distance = 0.2
controls.minDistance = 0.2;
controls.maxDistance = 100;
controls.zoomSpeed = 5;
controls.enableZoom = true;
controls.enableDamping = true;

controls.target.set(
    sunAndPlanetData[3].position.x,
    sunAndPlanetData[3].position.y,
)
const cameraAnimator = new CameraAnimator(controls)
//#endregion

//#region Main loop
camera.position.x = sunAndPlanetData[3].position.x
camera.position.y = sunAndPlanetData[3].position.y
camera.position.z = sunAndPlanetData[3].position.z

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