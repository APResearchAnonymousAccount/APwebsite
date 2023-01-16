const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const { randomBytes } = require("crypto");
const app = express();
const database = require('./database.js')
const humanList = require("./human.json")
const aiList = require("./ai.json")

const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid');
  
app.use(cookieParser());
app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, '/static/index.html')) 

});
app.post("/newUser", async (req, res) => {
    var ret;
    var count = 0;
    while(ret != 1){
        uid = uuidv4();
        ret = await database.newUser(uid,req.body.musicSwitch,req.body.narrationSwitch,req.body.ageDropDown,req.body.experienceWithAIRange,req.body.education,req.body.referer)
        count++;
        if(count > 12){
            console.log("infiloop - "+JSON.stringify(ret))
            break;
        }
    }
    res.cookie("userId", uid)
    
    return res.status(301).redirect('/intro')

});
app.get("/getQuestion", async (req, res) => {
    var uid = req.cookies.userId
    if(uid == undefined){
        return res.status(302).redirect("/")
    }
    console.log("st")
    var uList = await database.getAnswerList(uid)
    console.log(uList)
    var uListHuman = []
    var uListAI = []

    uList.forEach((element,index) => {
        uListHuman.push(element.hid)
        uListAI.push(element.aiid)
    });
    if(uList.length == humanList.length || uList.length == aiList.length ){
        return res.status(301).redirect('/end.html')
    }
    var hid = Math.floor(Math.random() * humanList.length)
    var aiid = Math.floor(Math.random() * aiList.length)
    
    var i = 0;
    var reversePair = false;
    for(var i = 0; i < uListAI.length;i++){
        if(hid == aiList[i][1]){
            reversePair = true;
        }
    }

    while(uListHuman.includes(hid) == true || reversePair){
        i++
        hid++
        hid = hid % humanList.length
        if(i > humanList.length){
            console.log("bad")
            break;
            

        }
        reversePair = false;
        for(var i = 0; i < uListAI.length;i++){
            if(hid == aiList[i][1]){
                reversePair = true;
            }
        }
    }
    var siblingPair = false;
    console.log(aiid)
    while(uListAI.includes(aiid) == true || uListHuman.includes(aiList[aiid][1] || siblingPair)){
        i++
        aiid++
        aiid = hid % humanList.length
        if(i > aiList.length){
            console.log("bad")
            break;
            

        }
        for(var i = 0; i < uListAI.length;i++){
            if(aiid == aiList[i][1]){
                siblingPair = true;
            }
        }
    }
    var question = {
        title: "",
        humanPost: humanList[hid],
        aiPost: aiList[aiid][0],
        hid: hid,
        aiid: aiid

    }

    return res.json(question)

});
app.get("/getScore", async (req, res) => {
    var uid = req.cookies.userId
    if(uid == undefined){
        return res.status(302).redirect("/")
    }
    score = await database.getScore(uid);
    console.log(score)
    return res.status(200).json(score);

});
app.get("/getSettings", async (req, res) => {
    var uid = req.cookies.userId
    var settings = []
    if(uid == undefined){
        return res.status(400)
    }
    let check = (await database.checkUser(uid)).count
    if(check == 0){
        settings[0] = {}
        res.cookie('userId', "", {expires: new Date(Date.now())});
        return res.json(settings[0])
    }

    settings = await database.getSettings(uid)

    var uList = await database.getAnswerList(uid)
    uList.forEach((element,index) => {
        uList[index] = element.qid
    });
    settings[0].qIndex = uList.length
    return res.json(settings[0])

});
app.post("/postAnswer", async (req, res) => {
    var question = req.body;
    database.logAnswer(question.hid,question.aiid,req.cookies.userId,question.acc)
    res.sendStatus(200) 
    res.end()
    return 
});

/*app.get("/survey", async (req, res) => {
    if(req.cookies.userId == undefined){
        return res.status(302).redirect("/")

    }
    else{
        res.sendFile(path.join(__dirname, '/static/survey.html'))

    }
});*/



app.use(express.static(path.join(__dirname, 'static')));

app.listen(4000);
process.on("unhandledRejection", (error) => {
    throw error;
});
