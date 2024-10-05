export async function getSolarSystemData(command = 'MB') {
    const url = `https://ssd.jpl.nasa.gov/horizons_batch.cgi?batch=1&COMMAND='${command}'&OBJ_DATA='YES'`;
    
    try {
        const response = await fetch(url);
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error fetching data from Horizons API:', error);
        return null;
    }
}