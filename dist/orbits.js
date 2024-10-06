import * as THREE from 'three';

const AU_TO_METERS = 1.496e11;

const vertexShader = `
	attribute float opacity;
	varying float vOpacity;
	void main() {
		vOpacity = opacity;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

const planetSpeeds = {
	earth: 1,
	mars: 1.88,
	mercury: 0.24,
	venus: 0.62,
	jupiter: 11.86,
	saturn: 29.46,
	uranus: 84.01,
	neptune: 164.8
}

const orbitColors = {
    mercury: '176, 176, 176',
    venus: '255, 204, 0',
    earth: '0, 170, 255',
	mars: '255, 69, 0',
	jupiter: '255, 127, 80',
	saturn: '218, 165, 32',
	uranus: '65, 105, 225',
	neptune: '133, 173, 219'
};

const AMOUNT = 70;
const STEP = 2;


for (let color in orbitColors) {
	orbitColors[color] = orbitColors[color].split(',').map(num => num / 255);
}

let fragmentShaders = {};
for (let planet in orbitColors) {
	fragmentShaders[planet] = `
		varying float vOpacity;
		void main() {
			gl_FragColor = vec4(${orbitColors[planet]}, vOpacity);
		}
	`;
}

function createOrbit(scene, points, opacities, planet) {
	const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

	const opacityAttribute = new Float32Array(opacities);
	lineGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacityAttribute, 1));

	const lineMaterial = new THREE.ShaderMaterial({
		vertexShader,
		fragmentShader: fragmentShaders[planet.toLowerCase()],
		transparent: true
	});

	const line = new THREE.Line( lineGeometry, lineMaterial );
	line.computeLineDistances();
	scene.add( line );
}

// step in days
function getPositions(planet, startDate) {
	let positions = [];
	let opacities = [];
	let step = STEP * planetSpeeds[planet.toLowerCase()];
	for (let i = 0; i < AMOUNT; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() - (i * step));
		let newData = window.lagrange.planet_positions.getPositions(date);
		newData = newData.filter(obj => {return obj.name.toLowerCase() === planet.toLowerCase()});
		newData = newData[0].position;
		newData.x = newData.x / AU_TO_METERS;
		newData.y = newData.y / AU_TO_METERS;
		newData.z = newData.z / AU_TO_METERS;
		positions.push(newData);
		opacities.push(2 - (2 * i / (AMOUNT - 1)));
	}
	return {positions, opacities};
}



export { createOrbit, getPositions };