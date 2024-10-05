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
        [new THREE.MeshBasicMaterial({ // Sun
            map: textureLoader.load('static/8k_sun.jpg'),
        })],
        [null], // Mercury
        [null], // Venus
        [ // Earth
            new THREE.MeshPhysicalMaterial({
                map: textureLoader.load('static/earth/8k_earth_daymap.jpg'),
                // normalMap: earthNormalMap,
                specularColor: new THREE.Color(0x888888),
                specularIntensityMap: textureLoader.load('static/earth/8k_earth_normal_map.tif'),
                bumpMap: textureLoader.load('static/earth/earthbump1k_upscale_smooth2.jpg'),
                bumpScale: 1,
                roughness: 0.9,
                metalness: 0,
                clearcoat: 1,
                clearcoatRoughness: 0.5,
                emissive: new THREE.Color(0x38388f),
                emissiveIntensity: 0.1,
            }),
            new THREE.MeshStandardMaterial({
                map: textureLoader.load('static/earth/8k_earth_clouds.jpg'),
                // alphaMap: textureLoader.load('static/8k_earth_clouds.jpg'),
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            })
        ],
        [null], // Mars
        [null], // Jupiter
        [null], // Saturn
        [null], // Uranus
        [null] // Neptune
    ]

    const sunAndPlanets = [];

    for (let planet = 0; planet <= 9; planet++) {
        for (let layer = 0; layer < sunAndPlanetsMats[planet]?.length; layer++){
            layer == 0 ?
                sunAndPlanets.push([{
                    resolution: 256,
                    position: sunAndPlanetsPositions[planet],
                    scale: sunAndPlanetsScales[planet],
                    mat: sunAndPlanetsMats[planet][layer]
                }]) :
                sunAndPlanets[planet].push({
                    resolution: 256,
                    position: sunAndPlanets[planet][layer - 1].position,
                    scale: sunAndPlanets[planet][layer - 1].scale + (10000 / AU_TO_METERS),
                    mat: sunAndPlanetsMats[planet][layer]
                })
        }
    }
    console.log(sunAndPlanets)
    return sunAndPlanets;
}