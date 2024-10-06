import * as THREE from 'three';
import { getOrbitalElements, calculatePosition } from './nearEarthApiModule.js';

const AU_TO_METERS = 1.496e11; // 1 AU in meters

export default async function loadSmallBodies(scene, textureLoader) {
   
    const smallBodiesOrbitalData = await getOrbitalElements(1000);
    console.log(smallBodiesOrbitalData)

    const smallBodyMaterial = new THREE.MeshPhysicalMaterial({
        map: textureLoader.load('static/mercury/2k_mercury.jpg'),
        bumpMap: textureLoader.load('static/mercury/mercurybump.jpg'),
        bumpScale: 0.5,
        roughness: 0.95,
        metalness: 0,
        emissive: new THREE.Color(0xb0b0b0),
        emissiveIntensity: 1,
        specularColor: new THREE.Color(0x888888),
    });

    // Iterate over orbital elements and create small body meshes
    smallBodiesOrbitalData.forEach((orbitalElements) => {
        const position = calculatePosition(orbitalElements)
        .multiplyScalar(1 / AU_TO_METERS) 
        .multiplyScalar(5); 

        const geometry = new THREE.SphereGeometry(0.001752, 32, 32); // Half size of Mercury
        const smallBodyMesh = new THREE.Mesh(geometry, smallBodyMaterial);

        // Set position in 3D space
        smallBodyMesh.position.set(position.x, position.y, position.z);

        console.log(smallBodyMesh.position);

        // Add small body mesh to the scene
        scene.add(smallBodyMesh);
    });
}
