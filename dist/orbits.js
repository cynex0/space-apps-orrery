import * as THREE from 'three';
import loadBodyData from './sunAndPlanetsLoader.js';

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

	const line = new THREE.Line(lineGeometry, lineMaterial);
	line.computeLineDistances();
	scene.add(line);
}

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

const bodies = loadBodyData();

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

		newData = newData.filter(obj => { return obj.name.toLowerCase() === planet.toLowerCase() });
		newData = newData[0].position;
		newData.x = newData.x / AU_TO_METERS;
		newData.y = newData.y / AU_TO_METERS;
		newData.z = newData.z / AU_TO_METERS;

		positions.push(newData);
		opacities.push(2 - (2 * i / (amount - 1)));
	}

	const planetBody = bodies.find(element => element[0].name == planet)[0]
	if (positions.length > 1) {
		const newPos = sphereSegmentIntersection(positions[0],
			positions[1], planetBody.position, planetBody.scale)
			
		if (newPos) {
			positions[0] = newPos;
		}
	}

	return { positions, opacities };
}

// magik
function sphereSegmentIntersection(point1, point2, spherePosition, r) {
	const d = {
		x: point2.x - point1.x,
		y: point2.y - point1.y,
		z: point2.z - point1.z
	};

	const f = {
		x: point1.x - spherePosition.x,
		y: point1.y - spherePosition.y,
		z: point1.z - spherePosition.z
	};

	const a = d.x * d.x + d.y * d.y + d.z * d.z;
	const b = 2 * (f.x * d.x + f.y * d.y + f.z * d.z);
	const c = f.x * f.x + f.y * f.y + f.z * f.z - r * r;

	// Solve the quadratic equation at^2 + bt + c = 0
	const discriminant = b * b - 4 * a * c;

	if (discriminant < 0) {
		return null;
	} else {
		// One or two intersections
		const sqrtDiscriminant = Math.sqrt(discriminant);
		const t1 = (-b - sqrtDiscriminant) / (2 * a);
		const t2 = (-b + sqrtDiscriminant) / (2 * a);

		if (t1 >= 0 && t1 <= 1) {
			return {
				x: point1.x + t1 * d.x,
				y: point1.y + t1 * d.y,
				z: point1.z + t1 * d.z
			};
		}

		if (t2 >= 0 && t2 <= 1) {
			return {
				x: point1.x + t2 * d.x,
				y: point1.y + t2 * d.y,
				z: point1.z + t2 * d.z
			};
		}

		return null;
	}
}


export { createOrbit, getPositions };