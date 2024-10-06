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

const fragmentShader = `
	varying float vOpacity;
	void main() {
		gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity);
	}
`;

function createOrbit(scene, points, opacities) {
	const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

	const opacityAttribute = new Float32Array(opacities);
	lineGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacityAttribute, 1));

	const lineMaterial = new THREE.ShaderMaterial({
		vertexShader,
		fragmentShader,
		transparent: true
	});

	const line = new THREE.Line( lineGeometry, lineMaterial );
	line.computeLineDistances();
	scene.add( line );
}

// const planetAmounts = {
// 	mercury: 70,
// 	venus: 100,
// 	earth: 150,
// 	mars: 200,
// 	jupiter: 400,
// 	saturn: 440,
// 	uranus: 470,
// 	neptune: 500,
// }

const planetAmounts = {
	mercury: 70,
	venus: 100,
	earth: 100,
	mars: 100,
	jupiter: 100,
	saturn: 100,
	uranus: 100,
	neptune: 100,
}

const planetSteps = {
	mercury: 1,
	venus: 1,
	earth: 1,
	mars: 2,
	jupiter: 5,
	saturn: 10,
	uranus: 20,
	neptune: 30,
}

// step in days
function getPositions(planet, startDate) {
	let positions = [];
	let opacities = [];
	let amount = planetAmounts[planet.toLowerCase()];
	let step = planetSteps[planet.toLowerCase()];
	for (let i = 0; i < amount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() - (i * step));
		let newData = window.lagrange.planet_positions.getPositions(date);
		newData = newData.filter(obj => {return obj.name.toLowerCase() === planet.toLowerCase()});
		newData = newData[0].position;
		newData.x = newData.x / AU_TO_METERS;
		newData.y = newData.y / AU_TO_METERS;
		newData.z = newData.z / AU_TO_METERS;
		positions.push(newData);
		opacities.push(2 - (2 * i / (amount - 1)));
	}
	return {positions, opacities};
}



export { createOrbit, getPositions };