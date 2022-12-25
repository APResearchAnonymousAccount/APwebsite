var superIndex = 0;

function intro() {
    var introText = ["We live in a world full of information. Modern life is a constant stream of information, bombarding us with posts, messages, and articles. It is no surprise then, that information has been weaponized, used to subvert, mislead, divide and deceive. Powerful entities create false, misleading, or incomplete information to push a narrative that suits their interests. The governments of multiple nations, including Russia, China, and Iran, have all sponsored far-reaching “disinformation” campaigns.", " Now, modern technology is poised to worsen this problem further. AI algorithms can be used to write convincing deceptive text. However, these algorithms are still fundamentally different from humans: they are merely imitating us based on large quantities of data. Can you tell what was written by an AI and what was written by a human?"]
    var split = introText[superIndex].split(" ")
    var maxLength = split.reduce((a, b) => { return Math.max(typeof a == "string" ? a.length : a, b.length) });
    var midBox = document.getElementById("mid-box")

    midBox.innerHTML = ""
    var computedStyle = getComputedStyle(midBox);
    var midBoxWidth = midBox.clientWidth;
    midBoxWidth -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
    var lettersMax = (midBoxWidth-midBoxWidth%15)/15
    console.log(lettersMax)
    midBox.style.display = "Block"
    var introTextBox = document.createElement("p")
    introTextBox.classList.add("introText");
    introTextBox.innerHTML = "█"
    console.log(introTextBox)
    midBox.appendChild(introTextBox)
    console.log(introTextBox)

    introTextBox.classList.add("introText");
    midBox.style.justifyContent = "center"
    alternateIntervals = {
        ".": 500,
        ",": 100,
    }
    var baseInt = 50
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
                introTextBox.innerHTML = previous + letter + "█";
                currentLine += letter;
                index++;
                if (letter == " ") {
                    

                    wordIndex++;
                }
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

        }
        midBox.append(nextButton)
    }
}
