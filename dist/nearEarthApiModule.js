import * as THREE from 'three';

export const getOrbitalElements = async (limit = 1000) => {
    const apiUrl = 'http://localhost:3000/api/small-bodies';


    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching orbital elements:', error);
        return [];
    }
};


export const calculatePosition = (orbitalElements) => {
    const name = orbitalElements[0]; // Name of the body
    const e = orbitalElements[1];    // eccentricity
    const a = orbitalElements[2];    // semi-major axis
    const tp = orbitalElements[7];   // time of perihelion passage (in Julian days)
    const i = orbitalElements[6];    // inclination (in degrees)
    const om = orbitalElements[4];   // longitude of ascending node (in degrees)
    const w = orbitalElements[5];    // argument of periapsis (in degrees)


    if (isNaN(a) || isNaN(e) || isNaN(tp) || isNaN(i) || isNaN(om) || isNaN(w)) {
        console.error('Invalid orbital elements', orbitalElements);
        return new THREE.Vector3(0, 0, 0); // Return default position if invalid
    }


    const AU_TO_METERS = 1.496e11; // 1 AU in meters
    const MU_SUN = 1.327e20; // Standard gravitational parameter for the Sun in m^3/s^2

    // Convert values to numbers
    const semiMajorAxis = parseFloat(a) * AU_TO_METERS; // Convert AU to meters
    const eccentricity = parseFloat(e);
    const inclination = THREE.MathUtils.degToRad(parseFloat(i)); // Convert degrees to radians
    const omRad = THREE.MathUtils.degToRad(parseFloat(om)); // Convert degrees to radians
    const wRad = THREE.MathUtils.degToRad(parseFloat(w)); // Convert degrees to radians
    const tpJD = parseFloat(tp); // Assuming tp is in Julian Days

    // Validate semi-major axis and eccentricity before proceeding
    if (semiMajorAxis <= 0 || eccentricity < 0 || eccentricity >= 1) {
        console.error('Invalid semi-major axis or eccentricity:', { semiMajorAxis, eccentricity });
        return new THREE.Vector3(0, 0, 0);
    }

   // Calculate orbital period (T) in seconds
   const T = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / MU_SUN); // Period in seconds

   // Calculate Mean Anomaly (M) in radians
   const elapsedTime = (toJulianDay(new Date()) - tpJD) * 86400; // Elapsed time in seconds
   const M = (2 * Math.PI / T) * elapsedTime; // Mean anomaly in radians

    // Solve for Eccentric Anomaly (E) using a simple iteration
    let E = M; // Initial guess
    for (let j = 0; j < 10; j++) {
        E = E + (M - (E - eccentricity * Math.sin(E))) / (1 - eccentricity * Math.cos(E));
    }

    // Calculate True Anomaly (ν) from Eccentric Anomaly (E)
    const nu = 2 * Math.atan2(Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
                               Math.sqrt(1 - eccentricity) * Math.cos(E / 2));

    const adjustedNu = nu + wRad; 

    // Calculate distance (r) from the central body
    const r = semiMajorAxis * (1 - eccentricity * Math.cos(E)); // Distance from the central body

    // Calculate position in the orbital plane (x, y)
    const x = r * (Math.cos(adjustedNu)); // Position in the orbital plane
    const y = r * (Math.sin(adjustedNu)); // Position in the orbital plane

    // Rotate to 3D space
    const z = y * Math.sin(inclination); // z-position based on inclination
    const xyDistance = Math.sqrt(x * x + y * y);
    
    // Apply rotation for longitude of ascending node
    const rotatedX = xyDistance * Math.cos(omRad) - z * Math.sin(omRad);
    const rotatedZ = xyDistance * Math.sin(omRad) + z * Math.cos(omRad);
    
    return new THREE.Vector3(rotatedX, y * Math.cos(inclination), rotatedZ);
};


const toJulianDay = (date) => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; 
    const day = date.getUTCDate();

 
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const julianDay = day + Math.floor((153 * m + 2) / 5) + (365 * y) + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    return julianDay; 
};
