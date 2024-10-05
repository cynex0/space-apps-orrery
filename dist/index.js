import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from './three.js';

import MeshStore from './meshStore.js';
import CameraAnimator from './cameraAnimation.js';

const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3

scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Renderer gets updated each time window is resized
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Controls
const controls = new OrbitControls(camera, canvas)

const cameraAnimator = new CameraAnimator(controls)

controls.enableZoom = true;
controls.enableDamping = true;

// Objects
const meshStore = new MeshStore(scene, camera, renderer,
    function (position) {
        cameraAnimator.animate(position)
    }
);

// Texture loader
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('static/2k_earth_daymap.jpg')

// Object creation
const material = new THREE.MeshBasicMaterial({ map: texture })

const sphere = new THREE.DodecahedronGeometry(0.5, 3)

const sphereMesh = new THREE.Mesh(sphere, material)
sphereMesh.position.x = 0
sphereMesh.position.y = 0
sphereMesh.position.z = 0

meshStore.addMesh(sphereMesh)

const sphereMesh2 = new THREE.Mesh(sphere, material)
sphereMesh2.position.x = 0
sphereMesh2.position.y = 3
sphereMesh2.position.z = 0

meshStore.addMesh(sphereMesh2)

const sphereMesh3 = new THREE.Mesh(sphere, material)
sphereMesh3.position.x = 2
sphereMesh3.position.y = 3
sphereMesh3.position.z = -2

meshStore.addMesh(sphereMesh3)

const clock = new THREE.Clock()

let elapsedTime = 0;
const tick = () => {
    const delta = clock.getElapsedTime() - elapsedTime
    elapsedTime = elapsedTime + delta

    controls.update()
    controls.enableDamping = true

    cameraAnimator.update(delta)

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
};

tick()