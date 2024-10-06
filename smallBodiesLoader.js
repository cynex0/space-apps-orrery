import * as THREE from 'three';
import { getElements, calculatePosition } from './nearEarthApiModule.js';

const AU_TO_METERS = 1.496e11; // 1 AU in meters

var smallBodies = {
    neo: [],
    pha: []
}

export default async function loadSmallBodies(meshStore) {
    const vertexShaderCode = 
    `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShaderCode = 
    `
        uniform vec3 solidColor;  // Solid color for the object
        uniform vec3 glowColor;   // Color of the glow
        uniform float intensity;   // Glow intensity

        void main() {
            // Set the main object color with full opacity
            vec4 objectColor = vec4(solidColor, 1.0);  // Solid color with alpha 1.0

            // Set the glow effect, make sure it's additive but does not affect the objectColor's opacity
            vec4 glow = vec4(glowColor * intensity, 0.5); // Glow with some transparency for blending

            // Combine object color with glow, ensuring objectColor is fully opaque
            gl_FragColor = objectColor + glow; // Combine colors
        }
    `

    smallBodies.neo = await getElements("sb-group=neo&limit=500")
    smallBodies.pha = await getElements("sb-group=pha&limit=500")

    smallBodies.neo.forEach(object => {
        const position = calculatePosition(object)
                .multiplyScalar(1 / AU_TO_METERS);

        const earthMesh = meshStore.getMesh('Earth')
        const distance = Math.sqrt(
            Math.pow(earthMesh.position.x - position.x, 2) +
            Math.pow(earthMesh.position.y - position.y, 2) +
            Math.pow(earthMesh.position.z - position.z, 2)
        )

        const intensityFactor = 1 / distance

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                solidColor: { value: new THREE.Color(0xaaaaaa) }, 
                glowColor: { value: new THREE.Color(0xADD8E6) },  
                intensity: { value: intensityFactor }
            },
            vertexShader: vertexShaderCode,
            fragmentShader: fragmentShaderCode,
            transparent: true,
            blending: THREE.AdditiveBlending  
        });

        console.log(object)
        console.log(distance)
        meshStore.createSphere(10000 / AU_TO_METERS, 32, 32,
            mat, position, object[0], true)
    })

    smallBodies.pha.forEach(object => {
        const position = calculatePosition(object)
                .multiplyScalar(1 / AU_TO_METERS);
        

        const earthMesh = meshStore.getMesh('Earth')
        const distance = Math.sqrt(
            Math.pow(earthMesh.position.x - position.x, 2) +
            Math.pow(earthMesh.position.y - position.y, 2) +
            Math.pow(earthMesh.position.z - position.z, 2)
        )
        const intensityFactor = 1 / distance

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                solidColor: { value: new THREE.Color(0xaaaaaa) },
                glowColor: { value: new THREE.Color(0xff3300) },
                intensity: { value: intensityFactor } 
            },
            vertexShader: vertexShaderCode,
            fragmentShader: fragmentShaderCode,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        console.log(object)
        console.log(distance)

        meshStore.createSphere(10000 / AU_TO_METERS, 32, 32,
            mat, position, object[0], true)
    })
}
