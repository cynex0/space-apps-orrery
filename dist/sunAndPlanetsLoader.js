import * as THREE from 'three';

const AU_TO_METERS = 1.496e11;

const bodyScales = [
    1.000000, // Sun
    0.003504, // Mercury
    0.008691, // Venus
    0.009149, // Earth
    0.004868, // Mars
    0.100398, // Jupiter
    0.083626, // Saturn
    0.036422, // Uranus
    0.035359, // Neptune
    0.002495, // Moon
]

const bodyNames = [
    'Sun',
    'Mercury',
    'Venus',
    'Earth',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Moon'
]

const bodyPositions = window.lagrange.planet_positions
    .getPositions(new Date())
    .filter(obj => {return bodyNames.map(s => s.toLowerCase()).includes(obj.name)})
    .map(element => {
        const obj = {
            x: element.position.x / AU_TO_METERS * 20,
            y: element.position.y / AU_TO_METERS * 20,
            z: element.position.z / AU_TO_METERS * 20,
        }

        return obj
    })

export default function loadBodyData(textureLoader) {
    const bodyMats = [
        [new THREE.MeshBasicMaterial({ // Sun
            map: textureLoader.load('static/8k_sun.jpg'),
        })],
        [new THREE.MeshPhysicalMaterial({
            map: textureLoader.load('static/mercury/2k_mercury.jpg'),
            bumpMap: textureLoader.load('static/mercury/mercurybump.jpg'),
            bumpScale: 0.5,
            roughness: 0.95,
            metalness: 0,
            emissive: new THREE.Color(0xb0b0b0),
            emissiveIntensity: 0.1,
            specularColor: new THREE.Color(0x888888),
        })], // Mercury
        [
            new THREE.MeshPhysicalMaterial({
                map: textureLoader.load('static/venus/2k_venus_surface.jpg'),
                roughness: 0.9,
                bumpMap: textureLoader.load('static/venus/venusbump.jpg'),
                metalness: 0,
                emissive: new THREE.Color(0xeec1a6),
                emissiveIntensity: 0.1,
            }),
            new THREE.MeshPhysicalMaterial({
                map: textureLoader.load('static/venus/2k_venus_atmosphere.jpg'),
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide,
                roughness: 0.9,
                clearcoat: 0.6,
                clearcoatRoughness: 0.5,
                specularColor: new THREE.Color(0x888888),
            }),
        ], // Venus
        [
            new THREE.MeshPhysicalMaterial({
                map: textureLoader.load('static/earth/8k_earth_daymap.jpg'),
                // normalMap: textureLoader.load('static/earth/8k_earth_normal_map.tif'),
                specularColor: new THREE.Color(0x888888),
                specularIntensityMap: textureLoader.load('static/earth/8k_earth_specular_map.tif'),
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
                side: THREE.DoubleSide,
            })
        ],
        [new THREE.MeshPhysicalMaterial({
            map: textureLoader.load('static/mars/2k_mars.jpg'),
            normalMap: textureLoader.load('static/mars/mars_normal.jpg'),
            specularColor: new THREE.Color(0x888888),
            roughness: 0.9,
            metalness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0.5,
            emissive: new THREE.Color(0xd14f3f),
            emissiveIntensity: 0.01,
        })], // Mars
        [new THREE.MeshPhysicalMaterial({
            map: textureLoader.load('static/2k_jupiter.jpg'),
            specularColor: new THREE.Color(0x888888),
            roughness: 0.8,
            metalness: 0.1,
            reflectivity: 0.1,
            thickness: 200,
            transparent: true,
            opacity: 0.98,
            side: THREE.DoubleSide,
            emissive: new THREE.Color(0xffcc00),
            emissiveIntensity: 0.01,
        })], // Jupiter
        [new THREE.MeshPhysicalMaterial({
            map: textureLoader.load('static/2k_saturn.jpg'),
            specularColor: new THREE.Color(0x888888),
            roughness: 0.9,
            metalness: 0.1,
            reflectivity: 0.5,
            thickness: 200,
            transparent: true,
            opacity: 0.99,
            side: THREE.DoubleSide,
            emissive: new THREE.Color(0xd4af37),
            emissiveIntensity: 0.01,
        })], // Saturn
        [new THREE.MeshPhysicalMaterial({
            map: textureLoader.load('static/2k_uranus.jpg'),
            specularColor: new THREE.Color(0x888888),
            roughness: 0.9,
            metalness: 0.1,
            reflectivity: 0.5,
            thickness: 200,
            transparent: true,
            opacity: 0.99,
            side: THREE.DoubleSide,
            emissive: new THREE.Color(0x85e5e5),
            emissiveIntensity: 0.01,
        })], // Uranus
        [new THREE.MeshPhysicalMaterial({
            map: textureLoader.load('static/2k_neptune.jpg'),
            specularColor: new THREE.Color(0x888888),
            roughness: 0.9,
            metalness: 0.1,
            reflectivity: 0.5,
            thickness: 200,
            transparent: true,
            opacity: 0.99,
            side: THREE.DoubleSide,
            emissive: new THREE.Color(0x2d68c4),
            emissiveIntensity: 0.01,
        })], // Neptune
        [new THREE.MeshPhysicalMaterial({
            map: textureLoader.load('static/moon/4k_moon.jpg'),
            roughness: 0.95,
            metalness: 0,
            emissive: new THREE.Color(0xb0b0b0),
            emissiveIntensity: 0.007,
            specularColor: new THREE.Color(0x888888)
        })], // Moon
    ]

    const bodies = [];

    for (let body = 0; body <= bodyMats.length; body++) {
        for (let layer = 0; layer < bodyMats[body]?.length; layer++){
            layer == 0 ?
                bodies.push([{
                    resolution: 256,
                    position: bodyPositions[body],
                    scale: bodyScales[body],
                    mat: bodyMats[body][layer],
                    name: bodyNames[body],
                }]) :
                bodies[body].push({
                    resolution: 256,
                    position: bodies[body][layer - 1].position,
                    scale: bodies[body][layer - 1].scale + (300000 / AU_TO_METERS),
                    mat: bodyMats[body][layer]
                })
        }
    }
    
    return bodies;
}