import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js'

import MeshStore from './meshStore.js';
import CameraAnimator from './cameraAnimation.js';
import ControllerAnimator from './controllerAnimation.js';
import loadSmallBodies from './smallBodiesLoader.js';
import loadBodyData from './sunAndPlanetsLoader.js';

import { createOrbit, getPositions } from './orbits.js';

const canvas = document.querySelector('canvas.webgl')

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
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.0000001, 100000000000)
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

    light.intensity = Math.pow(dist, 2.1)
})

const cameraAnimator = new CameraAnimator(controls)
const controllerAnimator = new ControllerAnimator(camera, controls)
//#endregion

//#region Meshes
const bodyData = loadBodyData();

window.meshStore = new MeshStore(scene, camera, renderer,
    function (mesh) {
        if (mesh != window.targetedMesh.get()) {
            window.targetedMesh.set(mesh);
        }
    }, document.getElementById("body-text-identifiers")
);

bodyData.forEach(planet => {
    planet.forEach(function (layer, index) {
        if (layer.mat && layer.position) {
			if(layer.name){
				if(layer.name != "Sun" && layer.name != "Moon"){
					const { positions, opacities } = getPositions(layer.name, new Date());
					createOrbit(scene, positions, opacities, layer.name);
				}
			}
            const mesh = window.meshStore.createSphere(layer.scale, layer.resolution,
                layer.resolution, layer.mat, layer.position, layer.name)
            if (layer.name == "Earth") { // default earth mesh for zoom
                window.targetedMesh.set(mesh);
            }
        }
    })
})

const textureLoader = new THREE.TextureLoader()
const ringColorMap = textureLoader.load('static/saturn/saturnringcolor.jpg');
const ringTransparencyMap = textureLoader.load('static/saturn/saturnringpattern.gif');

// Create a large flat plane for the rings
const ringGeometry = new THREE.RingGeometry(0.175, 0.3, 64); // Plane size based on ring size

// Rotate the plane to be horizontal
ringGeometry.rotateX(Math.PI / 2);

// Modify UV mapping to apply the texture along the radius
// Set UVs so that the texture is mapped radially, not across the whole plane
const uvs = ringGeometry.attributes.uv.array;
for (let i = 0; i < uvs.length; i += 2) {
    const x = uvs[i] - 0.5; // Shift UV to be centered on (0,0)
    const y = uvs[i + 1] - 0.5;
    const angle = Math.atan2(y, x); // Calculate the angle
    const radius = Math.sqrt(x * x + y * y); // Calculate the radius
    uvs[i] = radius; // Map radius to U
    uvs[i + 1] = (angle / (2 * Math.PI)) + 0.5; // Map angle to V
}
ringGeometry.attributes.uv.needsUpdate = true;

// Create the ring material
const ringMaterial = new THREE.MeshStandardMaterial({
    map: ringColorMap, // Color map for the rings
    alphaMap: ringTransparencyMap, // Transparency map for the rings
    transparent: true, // Enable transparency
    side: THREE.DoubleSide, // Ensure the rings are visible from both sides
    depthWrite: false, // Disable depth writing to avoid issues with transparency
});

// Create the ring mesh
const rings = new THREE.Mesh(ringGeometry, ringMaterial);

// Position and scale the rings
rings.scale.set(0.006, 0.006, 0.006); // Adjust the size as needed
rings.position.set(bodyData[6][0].position.x, bodyData[6][0].position.y, bodyData[6][0].position.z); // Centered around Saturn

// Add the rings to the Saturn object (assuming you have a Saturn mesh)
scene.add(rings);

// siderial day in seconds
const rotationSpeeds = [
    { name: 'Mercury', speed: 5067000 },
    { name: 'Venus', speed: -20996760 },
    { name: 'Earth', speed: 86160 },
    { name: 'Mars', speed: 88560 },
    { name: 'Jupiter', speed: 35700 },
    { name: 'Saturn', speed: 37980 },
    { name: 'Uranus', speed: 62040 },
    { name: 'Neptune', speed: 57600 },
]

loadSmallBodies(window.meshStore);
//#endregion

//#region Main loop

const FRAME_TIME = 1000 / 120;
const clock = new THREE.Clock()

let elapsedTime = 0;

const tick = () => {
    const delta = clock.getElapsedTime() - elapsedTime
    elapsedTime = elapsedTime + delta

    rotationSpeeds.forEach(planet => {
        meshStore.getMesh(planet.name).rotation.y += (360 / planet.speed) * delta
    })

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
    document.getElementById("welcome").style.animation =
        "translate 3s forwards cubic-bezier(0.6, 0.8, .6, 1)";

    setTimeout(() => {
        if (window.targetedMesh.get()) {
            cameraAnimator.animate(window.targetedMesh.get().position)
            controllerAnimator.animate(window.targetedMesh.get())

            setTimeout(() => {
                const loading = document.getElementById("loading");
                loading.style.background = "transparent";
                loading.style.pointerEvents = "none";
            }, 1000)
        }

        window.targetedMesh.addListener((mesh) => {
            cameraAnimator.animate(mesh.position)
            controllerAnimator.animate(mesh)
        })
    }, 1500) // delay to pass jitter frame
});