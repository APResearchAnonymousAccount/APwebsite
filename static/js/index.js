
var superIndex = 0;
var qIndex = 0
if(document.cookie["userId"] != undefined){
    surveyTransition()
}


function intro() {

    var introText = ["We live in a world full of information. Modern life is a constant stream of information, bombarding us with posts, messages, and articles. It is no surprise then, that information has been weaponized, used to subvert, mislead, divide and deceive. Powerful entities create false, misleading, or incomplete information to push a narrative that suits their interests. The governments of multiple nations, including Russia, China, and Iran, have all sponsored far-reaching “disinformation” campaigns.", " Now, modern technology is poised to worsen this problem further. AI algorithms can be used to write convincing deceptive text. However, these algorithms are still fundamentally different from humans: they are merely imitating us based on large quantities of data. Can you tell what was written by an AI and what was written by a human?"]
    var split = introText[superIndex].split(" ")
    var maxLength = split.reduce((a, b) => { return Math.max(typeof a == "string" ? a.length : a, b.length) });
    var midBox = document.getElementById("mid-box")

    midBox.innerHTML = ""
    var computedStyle = getComputedStyle(midBox);
    var midBoxWidth = midBox.clientWidth;
    midBoxWidth -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
    var midBoxHeight = midBox.clientHeight;
    midBoxHeight -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);

    const fontSize = Math.floor((midBoxWidth+midBoxHeight)/50)
    const letterWidth = 54.2/3 * fontSize/30
    var lettersMax = (midBoxWidth-midBoxWidth%letterWidth)/letterWidth
    console.log(lettersMax)
    midBox.style.display = "Block"
    var introTextBox = document.createElement("p")
    introTextBox.classList.add("introText");
    introTextBox.style.fontFamily = "monospace"
    introTextBox.style.fontSize = fontSize+"px"

    introTextBox.innerHTML = "█"
    midBox.appendChild(introTextBox)

    introTextBox.classList.add("introText");
    midBox.style.justifyContent = "center"
    alternateIntervals = {
        ".": 1, // 500
        ",": 1, // 100
    }
    var baseInt = 1 // 50
    var index = 0
    var letter = ""
    var currentLine = "█"
    var wordIndex = 0;
    function nextLetter(timestamp, startTime) {
        var runtime = timestamp - startTime
        letter = introText[superIndex][index]
        inverval = letter in alternateIntervals ? alternateIntervals[letter] : baseInt
        if (runtime < inverval) {
            requestAnimationFrame((ts) => nextLetter(ts, startTime))
        } else {

            if (letter != undefined) {
                var previous = introTextBox.innerHTML.slice(0, introTextBox.innerHTML.length - 1)
                introTextBox.innerHTML = previous + letter;
                currentLine += letter;
                index++;
                if (letter == " ") {
                    wordIndex++;
                    //console.log(currentLine + " | "+currentLine.length+" + "+split[wordIndex].length+" / "+lettersMax)
                    if(currentLine.length+split[wordIndex].length >= lettersMax){
                        introTextBox.innerHTML += "<br>"
                        currentLine = ""
                    }

                }
                introTextBox.innerHTML += "█"
                requestAnimationFrame((ts) => nextLetter(ts, ts))
            } else {
                superIndex += 1;
                showNext();
                return;
            }
        }
    }
    requestAnimationFrame((timestamp) => { nextLetter(timestamp, timestamp) })
    function showNext() {
        nextButton = document.createElement("button")

        if (superIndex < introText.length) {
            nextButton.innerText = "Next"
            nextButton.setAttribute('onclick', "intro()")
        } else {
            nextButton.innerText = "Begin"
            nextButton.setAttribute('onclick', "fade()")

        }
        midBox.append(nextButton)
    }
}
function fade() { 
    var toFade = [document.getElementById("robotContainer"),document.getElementById("anonContainer"),...(document.querySelectorAll("#mid-box *"))]
    fadeLength = 4;
    toFade.forEach((element) => {element.style.animation = "fadeOut "+fadeLength+"s forwards";})
    setTimeout(surveyTransition,fadeLength*1000)



}
function surveyTransition() {
        
    var midBox = document.getElementById("mid-box")
    midBox.innerHTML = ""
    document.getElementById("robotContainer").remove()
    document.getElementById("anonContainer").remove()
    var leftBox = document.createElement("div")
    leftBox.id = "leftSurveyBox"
    var rightBox = document.createElement("div")
    rightBox.id = "rightSurveyBox"
    leftBox.classList.add("survey-box")
    rightBox.classList.add("survey-box")
    body = document.querySelector("body")
    body.appendChild(leftBox)
    body.appendChild(rightBox)
    midBox.remove();
    setTimeout(survey,4*1000)


}
function survey() {

}