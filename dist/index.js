import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x474747, 0.65);
// ambientLight.castShadow = true
scene.add(ambientLight);

// Texture loader
const textureLoader = new THREE.TextureLoader()
const earthTexture = textureLoader.load('static/8k_earth_daymap.jpg')
const earthNormalMap = textureLoader.load('static/8k_earth_normal_map_inverted.tif')
const earthSpecularMap = textureLoader.load('static/8k_earth_normal_map.tif')
const sunTexture = textureLoader.load('static/8k_sun.jpg')

function createSphere(radius, wDiv, hDiv, mat, pos) {
    const geo = new THREE.SphereGeometry(radius, wDiv, hDiv)
    const mesh = new THREE.Mesh(geo, mat) 
    mesh.position.set(pos.x, pos.y, pos.z)
    // mesh.castShadow = true
    
    scene.add(mesh)
    return mesh
}

function attachLight(position, intensity) {
    const light = new THREE.PointLight( 0xffffff, intensity );
    light.position.set(position.x, position.y, position.z)
    // light.castShadow = true

    // light.shadow.mapSize.width = 512 // default
    // light.shadow.mapSize.height = 512 // default
    // light.shadow.camera.near = 0.5 // default
    // light.shadow.camera.far = 500 // default

    scene.add(light)
}

// Object
const earth = createSphere(1, 512, 512, 
    new THREE.MeshPhysicalMaterial({
        map: earthTexture,
        // normalMap: earthNormalMap,
        specularColor: new THREE.Color(0x888888),
        specularIntensityMap: earthSpecularMap,
        roughness: 0.9,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.5,
        emissive: new THREE.Color(0x0066ff),
        emissiveIntensity: 0.05,
    }), {x : 0, y : 0, z : 0})

const sun = createSphere(109.2, 128, 128, 
    new THREE.MeshBasicMaterial({
        map: sunTexture,
    }), {x : 214.8, y : 0, z : 0})

const sunLight = attachLight(sun.position, 1)

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Renderer gets updated each time window is resized
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    composer.setSize(sizes.width, sizes.height);
})

// Camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 500000)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)

controls.enableZoom = true;
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;

// Effects
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 
    1,   // Strength
    0.65,   // Radius
    1.25   // Threshold
);
composer.addPass(bloomPass);

const clock = new THREE.Clock()

const tick = () => {
    // const elapsedTime = clock.getElapsedTime()
    controls.update()
    renderer.render(scene, camera)
    composer.render()

    window.requestAnimationFrame(tick)
};

tick()