gamificationToggle = document.getElementById("gameificationToggle")
soundSettings = document.getElementById("hiddenSettings")

gamificationToggle.addEventListener("click", () => {
    if(gamificationToggle.checked == false){
        soundSettings.style.display = "none"
    }
    else{
        soundSettings.style.display = "block"

    }
});