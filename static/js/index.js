const queryString = window.location.search;
const parameters = new URLSearchParams(queryString);
const referer = parameters.get('referer');

var testing = true;
var after = false;
var superIndex = 0;
var qPreload = null;
var tryPlay = false;
var qIndex = 0
var introMusic = new Audio("music/sprachZarathustra.mp3");
var mainMusic = new Audio("music/winterVivaldi.mp3");
var afterMusic = new Audio("music/winterVivaldi.mp3");

var outroMusic = new Audio("music/exenogenisisTheFatRat.mp3");
var correct = new Audio("music/correct.mp3")
var incorrect = new Audio("music/incorrect.mp3")

var settings
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function initSettings(i) {
    if (getCookie("userId") != "" && i < 5) {
        var sJSON = await fetch('/getSettings')
        settings = await sJSON.json()
        if (settings.music === undefined) {
            sleep(200)
            initSettings(i + 1)
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
    if (i >= 5) {
        document.cookie = "userId" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}
initSettings(0)

var maxQs = 10

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
    var introText = ["We live in a world full of information. Modern life is a constant stream of information, bombarding us with posts, messages, and articles. It is no surprise then, that information has been weaponized, used to subvert, mislead, divide and deceive. Powerful entities create false, misleading, or incomplete information to push a narrative that suits their interests. In order to influence foreign politics, the governments of multiple nations, including Russia, China, and Iran, have all sponsored far-reaching “disinformation” campaigns.", "Now, modern technology is poised to worsen this problem further. Artificial Intelligence algorithms can be used to write convincing posts, either spreading false information, or simply arguing in favor of certain positions. AI-powered bots are hard to detect and could be used to mass-produce artificial accounts and posts on a scale never seen before.", "However, although AI models have been trained to imitate humans, they are still fundamentally different. Given that, by some metrics, the best language generation model has only one hundredth the power of the human brain, it may be possible for people to learn to distinguish AI-generated political posts from human-written posts. To test this hypothesis, I made this experiment. You will be shown a series of pairs of posts. In each pair, one post is AI-generated, and one is a public tweet. Your task is to determine which one is AI-generated. Click those you think are AI-generated, and avoid those you think are real tweets."]
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
        ".": 500,
        ",": 100,
    }
    var baseInt = 50
    if (testing) {
        alternateIntervals = {
            ".": 1,
            ",": 1,
        }
        var baseInt = 1

    }
    var index = 0
    var letter = ""
    var currentLine = "█"
    var wordIndex = 0;
    function nextLetter(timestamp, startTime) {
        if(qPreload === null && getCookie("userId") != ""){
            qPreload = fetch('/getQuestion?hid=n&aiid=n')

        }
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
    if (settings.music && !after) {
        audioVolumeOut(introMusic)

    } else if (settings.music) {
        audioVolumeOut(outroMusic)

    }
    var toFade = [document.getElementById("robotContainer"), document.getElementById("anonContainer"), ...(document.querySelectorAll("#mid-box *"))]
    fadeLength = 4;
    toFade.forEach((element) => { if (element != null) { element.style.animation = "fadeOut " + fadeLength + "s forwards"; } })
    setTimeout(surveyTransition, fadeLength * 1000)



}
function surveyTransition() {
    if (settings.music && !after) {

        mainMusic.play().catch((error) => { tryPlay = true;})
    } else if (settings.music) {
        afterMusic.play()
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
    if(qPreload === null){
        qPreload = fetch('/getQuestion?hid=n&aiid=n')

    }
    var qJSON = await qPreload
    
    var question = await qJSON.json()
    if(question.end){
        fadeToOutro();
        return
    }
    qPreload = fetch('/getQuestion?hid='+question.hid+'&aiid='+question.aiid)

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

    aiBox.innerHTML = "<h2>" + question.title + "</h2>\n<p>" + question.aiPost
    humanBox.innerHTML = "<h2>" + question.title + "</h2>\n<p>" + question.humanPost
    humanBox.setAttribute('onclick', "submit(false," + question.hid + "," + question.aiid + ")")
    aiBox.setAttribute('onclick', "submit(true," + question.hid + "," + question.aiid + ")")
    aiBox.appendChild(aiBg)
    humanBox.appendChild(humanBg)

}
async function submit(acc, hid, aiid) {
    if(tryPlay){
        mainMusic.play()
        tryPlay = false;
    }
    humanBox.setAttribute('onclick', "")
    aiBox.setAttribute('onclick', "")
    if (!testing) {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        if (vw > 750) {
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
        } else {

            aiBox.style.backgroundColor = "rgb(0,0,0,0)"
            humanBox.style.backgroundColor = "rgb(0,0,0,0)"
            if (aiBox == document.getElementById("leftSurveyBox")) {
                aiBox.style.backgroundImage = "linear-gradient(0deg, #af00005e, rgb(0,0,0,0))"
                humanBox.style.backgroundImage = "linear-gradient(180deg, #06af005e, rgb(0,0,0,0))"

            } else {
                aiBox.style.backgroundImage = "linear-gradient(180deg, #af00005e, rgb(0,0,0,0))"
                humanBox.style.backgroundImage = "linear-gradient(0deg, #06af005e, rgb(0,0,0,0))"

            }

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
        if (after) {
            var scoreRaw = await fetch("/getScore")
            var score = await scoreRaw.json();
            var currentQACC = 0;
            if (acc) {
                currentQACC++;
            }
            message.innerText += " (Total accuracy: " + ((score[0] + currentQACC) / score[1] * 100).toFixed(2) + "%)"
        }
        body.appendChild(message)
        await sleep(2000)

        message.remove()
    }
    var xhr = new XMLHttpRequest();
    var url = "/postAnswer";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var data = JSON.stringify({ acc: acc, hid: hid, aiid: aiid });
    xhr.send(data);

    if (qIndex < maxQs - 1 || after) {
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

async function outro() {
    
        var leftBox = document.getElementById("leftSurveyBox")
        var rightBox = document.getElementById("rightSurveyBox")
        var scoreRaw = await fetch("/getScore")
        var score = await scoreRaw.json();

        leftBox.remove()
        rightBox.remove()
        var midBox = document.createElement("div")
        midBox.id = "mid-box"
        var centerBox = document.createElement("div")
        var outroText = document.createElement("p")
        if(!after){
            outroText.innerText = "Thank you for completing this test. If you wish to continue, you may do so as long as you wish. Or, you are also free to leave now. A few notes: just because something was AI generated doesn't mean it's wrong, and just because something is human written doesn't mean its right. This survey was simply to test how realistic these AI generated posts were. Also, given that the \"Human\" posts were taken directly from twitter, there is no way to be sure that they were not AI-generated."
            centerBox.appendChild(outroText)
            contButton = document.createElement("button")
            contButton.innerText = "Continue"
            contButton.setAttribute('onclick', "fadeToSurvey()")
            after = true;
            centerBox.appendChild(contButton)
        }else {
            outroText.innerText = "You've reached the end of all the questions I generated. I'll probably try to make some more, so maybe come back sometime, but otherwise this is the end."
            centerBox.appendChild(outroText)
        }
        
        
        scoreBox = document.createElement("p")
        scoreBox.innerText = "Final Acurracy: " + score[0] + "/" + score[1]
        centerBox.appendChild(scoreBox)
        midBox.appendChild(centerBox)
        document.body.appendChild(midBox)
    
}