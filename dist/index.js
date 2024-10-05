import {OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const textureLoader = new THREE.TextureLoader()
const myTexture = textureLoader.load('static/image.png')

function createSphere(radius, wDiv, hDiv, mat, pos) {
    const geo = new THREE.SphereGeometry(radius, wDiv, hDiv)
    const mesh = new THREE.Mesh(geo, mat) 
    mesh.position.set(pos.x, pos.y, pos.z)
    scene.add(mesh)
    return mesh
}

// Objects
const sunMesh = createSphere(3, 64, 64, new THREE.MeshBasicMaterial(), {x: 0, y: 0, z: 0})
const planetMesh = createSphere(0.2, 16, 16, new THREE.MeshBasicMaterial(), {x: 5, y: 5, z: 5})


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
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    controls.update()
    controls.enableDamping = true
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
};

tick()