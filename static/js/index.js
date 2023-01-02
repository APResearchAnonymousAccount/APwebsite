const queryString = window.location.search;
const parameters = new URLSearchParams(queryString);
const referer = parameters.get('referer');


var after = false;
var superIndex = 0;
var qIndex = 0
var introMusic = new Audio("music/sprachZarathustra.mp3");
var mainMusic = new Audio("music/winterVivaldi.mp3");
var outroMusic = new Audio("music/exenogenisisTheFatRat.mp3");
var correct = new Audio("music/correct.mp3")
var incorrect = new Audio("music/incorrect.mp3")

var settings
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function initSettings() {
    if (getCookie("userId") != "") {
        sJSON = await fetch('/getSettings')
        settings = await sJSON.json()
        if (settings.music == undefined) {
            sleep(200)
            initSettings()
            return;
        }
        qIndex = settings.qIndex
        surveyTransition()

    } else {
        var infoForm = document.getElementById("mid-box").children[0]
        var refererInput = document.createElement("input")
        refererInput.setAttribute("type", "hidden");
        refererInput.setAttribute("name", "referer");
        refererInput.setAttribute("value", referer);
        infoForm.appendChild(refererInput)

        settings = {}
    }
}
initSettings()

var maxQs = 3

function getCookie(cname) { // Source: https://www.w3schools.com/js/js_cookies.asp
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function audioVolumeOut(q) {   // Source: https://stackoverflow.com/questions/7451508/html5-audio-playback-with-fade-in-and-fade-out

    if (q.volume) {
        var InT = 1;
        var setVolume = 0;  // Target volume level for old song 
        var speed = 0.001;  // Rate of volume decrease
        q.volume = InT;
        var fAudio = setInterval(function () {
            InT -= speed;
            q.volume = InT.toFixed(1);
            if (InT.toFixed(1) <= setVolume) {
                clearInterval(fAudio);
                //alert('clearInterval fAudio'+ InT.toFixed(1));
            };
        }, 10);
    };
};

function intro() {
    if (superIndex == 0) {
        settings.music = document.getElementsByName("musicSwitch")[0].checked
        settings.narration = document.getElementsByName("narrationSwitch")[0].checked
    }
    if (settings.music) {
        introMusic.play()
    }
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

    const fontSize = Math.floor((midBoxWidth + midBoxHeight) / 50)
    const letterWidth = 54.2 / 3 * fontSize / 30
    var lettersMax = (midBoxWidth - midBoxWidth % letterWidth) / letterWidth
    console.log(lettersMax)
    midBox.style.display = "Block"
    var introTextBox = document.createElement("p")
    introTextBox.classList.add("introText");
    introTextBox.style.fontFamily = "monospace"
    introTextBox.style.fontSize = fontSize + "px"

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
                    if (currentLine.length + split[wordIndex].length >= lettersMax) {
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
            nextButton.setAttribute('onclick', "fadeToSurvey()")

        }
        midBox.append(nextButton)
    }
}
function fadeToSurvey() {
    if (settings.music) {
        audioVolumeOut(introMusic)
    }
    var toFade = [document.getElementById("robotContainer"), document.getElementById("anonContainer"), ...(document.querySelectorAll("#mid-box *"))]
    fadeLength = 4;
    toFade.forEach((element) => { if (element != null) { element.style.animation = "fadeOut " + fadeLength + "s forwards"; } })
    setTimeout(surveyTransition, fadeLength * 1000)



}
function surveyTransition() {
    if (settings.music) {

        mainMusic.play()
    }
    var midBox = document.getElementById("mid-box")
    midBox.innerHTML = ""
    if (document.getElementById("robotContainer") != null) {
        document.getElementById("robotContainer").remove()
        document.getElementById("anonContainer").remove()
    }
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
    setTimeout(surveyQuestion, 4 * 1000)


}
var aiBg
var humanBg
var aiBox
var humanBox
async function surveyQuestion() {
    if (aiBg != undefined) {
        aiBg.remove()
        humanBg.remove()
        aiBox.style.backgroundImage = "none"
        humanBox.style.backgroundImage = "none"

    }
    var qJSON = await fetch('/getQuestion')
    var question = await qJSON.json()
    var side = Math.round(Math.random())
    aiBox = side ? document.getElementById("leftSurveyBox") : document.getElementById("rightSurveyBox")
    humanBox = side ? document.getElementById("rightSurveyBox") : document.getElementById("leftSurveyBox")
    aiBg = document.createElement('img')
    humanBg = document.createElement('img')
    aiBg.classList.add('surveyFeedbackBgImage')
    aiBg.id = "aiBg"
    humanBg.id = "humanBg"
    aiBg.src = 'images/robot.png'
    humanBg.src = 'images/anomymous.png'
    humanBg.classList.add('surveyFeedbackBgImage')

    aiBox.innerHTML = "<h2>" + question.title + "</h2>\n<p>" + question.aiText
    humanBox.innerHTML = "<h2>" + question.title + "</h2>\n<p>" + question.text
    humanBox.setAttribute('onclick', "submit(false," + question.qid + ")")
    aiBox.setAttribute('onclick', "submit(true," + question.qid + ")")
    aiBox.appendChild(aiBg)
    humanBox.appendChild(humanBg)

}
async function submit(acc, qid) {
    humanBox.setAttribute('onclick', "")
    aiBox.setAttribute('onclick', "")
    aiBg.style.animation = "fadeOut forwards 2s"
    humanBg.style.animation = "fadeOut forwards 2s"
    aiBox.style.backgroundColor = "rgb(0,0,0,0)"
    humanBox.style.backgroundColor = "rgb(0,0,0,0)"
    if (aiBox == document.getElementById("leftSurveyBox")) {
        aiBox.style.backgroundImage = "linear-gradient(270deg, #af00005e, rgb(0,0,0,0))"
        humanBox.style.backgroundImage = "linear-gradient(90deg, #06af005e, rgb(0,0,0,0))"

    } else {
        aiBox.style.backgroundImage = "linear-gradient(90deg, #af00005e, rgb(0,0,0,0))"
        humanBox.style.backgroundImage = "linear-gradient(270deg, #06af005e, rgb(0,0,0,0))"

    }

    var message = document.createElement("h2")
    message.id = "message"
    if (acc) {
        correct.play()
        message.innerText = "Correct"
        message.style.color = "#06af005e"
    } else {
        incorrect.play()
        message.innerText = "Incorrect"
        message.style.color = "#af00005e"

    }
    body.appendChild(message)
    await sleep(2000)

    message.remove()
    var xhr = new XMLHttpRequest();
    var url = "/postAnswer";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var data = JSON.stringify({ acc: acc, qid: qid });
    xhr.send(data);

    if (qIndex < maxQs || after) {
        qIndex++;



        aiBox.style.backgroundColor = "rgb(25, 39, 52)"
        humanBox.style.backgroundColor = "rgb(25, 39, 52)"
        surveyQuestion()
    } else {
        aiBg.remove()
        humanBg.remove()
        fadeToOutro()
    }
}
function fadeToOutro() {
    if (settings.music) {
        audioVolumeOut(mainMusic)
    }
    var toFade = [...(document.querySelectorAll("#leftSurveyBox *")), ...(document.querySelectorAll("#rightSurveyBox *"))]
    fadeLength = 4;
    toFade.forEach((element) => { element.style.animation = "fadeOut " + fadeLength + "s forwards"; })
    setTimeout(outroTransition, fadeLength * 1000)



}
function outroTransition() {
    if (settings.music) {

        outroMusic.play()
    }
    var leftBox = document.getElementById("leftSurveyBox")
    var rightBox = document.getElementById("rightSurveyBox")
    leftBox.style.animation = "slideBackFromLeft 4s forwards"
    rightBox.style.animation = "slideBackFromRight 4s forwards"

    setTimeout(outro, 4 * 1000)


    /*
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
        setTimeout(surveyQuestion, 4 * 1000)
    */
}

function outro() {
    var leftBox = document.getElementById("leftSurveyBox")
    var rightBox = document.getElementById("rightSurveyBox")
    leftBox.remove()
    rightBox.remove()
    var midBox = document.createElement("div")
    midBox.id = "mid-box"
    var outroText = document.createElement("p")
    outroText.innerText = "Thank you for completing this test. If you wish to continue, you may do so as long as you wish. Or, you are also free to leave now."
    midBox.appendChild(outroText)
    contButton = document.createElement("button")
    contButton.innerText = "Continue"
    contButton.setAttribute('onclick', "fadeToSurvey()")
    after = true;
    midBox.appendChild(contButton)
    document.body.appendChild(midBox)

}