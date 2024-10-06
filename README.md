# Orrery Web App - Near-Earth Object Viewer (NASA Space Apps Connect 2024)


This repository houses the codebase of the project developed during NASA Space Apps Connect 2024. The application is a 3D simulation that visualizes an orrery (a model of the solar system) and tracks Near-Earth Objects (NEOs) using data from NASA SBDB API.

## Technologies Used
- [Three.js](https://threejs.org/) - 3D Graphics Library
- [NASA SBDB API](https://ssd-api.jpl.nasa.gov/doc/sbdb.html) - Provides methods of requesting machine-readable data for a specified small body within JPL’s SSD/CNEOS Small-Body DataBase
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS)

## Running locally

We recommend running the project through [VSCode](https://code.visualstudio.com/), by creating a [live server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) and navigating to `/dist/index.html`.

## Deploying to GitHub pages

Run the following commands in the root of the project:

`npm install`
`npm run deploy`

Don't forget to create a `gh-pages` branch that will be tracked by the GitHub pages plugin.

## Usage

Once the app is running, you can:

1. Explore the solar system by zooming and panning in the 3D view.
2. See the  positions of planets and NEOs.
3. Click on planets and search for NEOs and PHAs to get information about distance and level of significance.



