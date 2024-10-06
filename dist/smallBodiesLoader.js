import * as THREE from 'three';
import { getElements, calculatePosition } from './nearEarthApiModule.js';

const AU_TO_METERS = 1.496e11; // 1 AU in meters

export default async function loadSmallBodies(meshStore) {
    const smallBodyMaterial = new THREE.MeshPhysicalMaterial({
        roughness: 0.95,
        emissive: new THREE.Color(0xb0b0b0),
        emissiveIntensity: 1
    });

    [
        "sb-kind=a&sb-ns=n&limit=500", // numbered asteroids
        "sb-kind=a&sb-ns=u&limit=500", // un-numbered asteroids
        "sb-kind=c&sb-ns=n&limit=500", // numbered commets
        "sb-kind=c&sb-ns=u&limit=500", // un-numbered commets
    ].forEach(async (query) => {
        const result = await getElements(query);

        result.forEach((element) => {
            const position = calculatePosition(element)
                .multiplyScalar(1 / AU_TO_METERS);

            meshStore.createSphere(10000 / AU_TO_METERS, 32, 32,
                smallBodyMaterial, position, element[0], true)
        })
    })
}
