import {OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Texture loader
const textureLoader = new THREE.TextureLoader()
const myTexture = textureLoader.load('static/image.png')

// Object
const sphere = new THREE.DodecahedronGeometry(0.5, 3)
const material = new THREE.MeshBasicMaterial({
    map: myTexture
})

const sphereMesh = new THREE.Mesh(sphere, material)
scene.add(sphereMesh)

sphereMesh.position.x = 0
sphereMesh.position.y = 0

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
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)

controls.enableZoom = true;
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const clock = new THREE.Clock()

const tick = () => {
    // const elapsedTime = clock.getElapsedTime()
    controls.update()
    controls.enableDamping = true
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
};

tick()