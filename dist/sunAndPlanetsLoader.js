import * as THREE from 'three';

const AU_TO_METERS = 1.496e11;

const sunAndPlanetsScales = [
    1.000000, // Sun
    0.003504, // Mercury
    0.008691, // Venus
    0.009149, // Earth
    0.004868, // Mars
    0.100398, // Jupiter
    0.083626, // Saturn
    0.036422, // Uranus
    0.035359 // Neptune
]

const sunAndPlanetsPositions = window.lagrange.planet_positions
    .getPositions(new Date())
    .slice(0, 9)
    .map(element => {
        const obj = {
            x : element.position.x / AU_TO_METERS * 20,
            y : element.position.y / AU_TO_METERS * 20,
            z : element.position.z / AU_TO_METERS * 20,
        }

        return obj
    })

export default function loadSunAndPlanetData(textureLoader) {
    const sunAndPlanetsMats = [
        new THREE.MeshBasicMaterial({ // Sun
            map: textureLoader.load('static/8k_sun.jpg'),
        }),
        null, // Mercury
        null, // Venus
        new THREE.MeshPhysicalMaterial({ // Earth
            map: textureLoader.load('static/8k_earth_daymap.jpg'),
            roughness: 1,
            dispersion: 1,
            reflectivity: 0,
            specularIntensity: 0,
            metalness: 0,
            clearcoat: 0.3,
            clearcoatRoughness: 0.8,
            emissive: new THREE.Color(0x0066ff),
            emissiveIntensity: 0.1,
        }),
        null, // Mars
        null, // Jupiter
        null, // Saturn
        null, // Uranus
        null // Neptune
    ]

    const sunAndPlanets = [];

    for (let index = 0; index <= 9; index++) {
        sunAndPlanets.push({
            resolution: 256,
            position: sunAndPlanetsPositions[index],
            scale: sunAndPlanetsScales[index],
            mat: sunAndPlanetsMats[index]
        })
    }

    return sunAndPlanets;
}