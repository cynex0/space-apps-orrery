import ObjectListener from "./objectListener.js"
import loadBodyData from './sunAndPlanetsLoader.js';

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

const search = document.getElementById("body-name");
const earthMesh = loadBodyData()[3][0];

window.targetedMesh = new ObjectListener()
window.targetedMesh.addListener(() => {
    if (window.targetedMesh?.get()) {
        const mesh = window.targetedMesh.get()

        search.innerHTML = mesh.name;

        const distance = document.getElementById("distance-to-earth");
        if (mesh.name == "Earth") {
            distance.style.display = "none"
        } else {
            distance.style.display = "unset"
            distance.innerHTML =
                `${mesh.name} is ${Math.round(
                    Math.sqrt(
                        Math.pow(earthMesh.position.x - mesh.position.x, 2) +
                        Math.pow(earthMesh.position.y - mesh.position.y, 2) +
                        Math.pow(earthMesh.position.z - mesh.position.z, 2)
                    ) * 1000
                ) / 1000
                } AU away from Earth`;
        }
    }
})

search.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && window.meshStore) {
        event.preventDefault();

        const results = window.meshStore.search(search.innerHTML);
        if (results?.length &&
            results[0].item != window.targetedMesh.get()) {
            window.targetedMesh.set(results[0].item)
        }

        // clear focus
        search.contentEditable = false;
        search.contentEditable = true;
    }
});

search.addEventListener("blur", function () {
    if (window.targetedMesh.get()) {
        search.innerHTML = window.targetedMesh.get().name;
    }
})

window.cameraChangeListeners = [() => {
    search.contentEditable = false;
    search.contentEditable = true;
}]