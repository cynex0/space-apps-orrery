import ObjectListener from "./objectListener.js"
import loadSunAndPlanetData from './sunAndPlanetsLoader.js';

document.getElementById("display_labels")
    .addEventListener('change', function () {
        const targets = document.getElementsByClassName("body-label");

        if (this.checked) {
            for (let index = 0; index < targets.length; index++) {
                targets[index].style.display = "unset";
            }
        } else {
            for (let index = 0; index < targets.length; index++) {
                targets[index].style.display = "none";
            }
        }
    });

const earthMesh = loadSunAndPlanetData()[3];

window.targetedMesh = new ObjectListener(() => {
    if (window.targetedMesh?.get()) {
        const mesh = window.targetedMesh.get()

        document.getElementById("body-name").innerHTML = mesh.name;

        const distance = document.getElementById("distance-to-earth");
        if (mesh.name == "Earth") {
            distance.style.display = "none"
        } else {
            distance.style.display = "unset"
            distance.innerHTML =
                `${mesh.name} is ${Math.round(
                    Math.sqrt(
                        Math.pow(earthMesh[0].position.x - mesh.position.x, 2) +
                        Math.pow(earthMesh[0].position.y - mesh.position.y, 2) +
                        Math.pow(earthMesh[0].position.z - mesh.position.z, 2)
                    ) / 20 * 100
                ) / 100
                } AU away from Earth`;
        }
    }
})