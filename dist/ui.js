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