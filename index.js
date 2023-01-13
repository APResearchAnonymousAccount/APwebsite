const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const { randomBytes } = require("crypto");
const app = express();
const database = require('./database.js')
const question_list = require("./generated-top10.json")
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
    var uList = await database.getAnswerList(uid)
    console.log(uList)
    uList.forEach((element,index) => {
        uList[index] = element.qid
    });
    var qid = Math.floor(Math.random() * question_list.length)
    if(uList.length == question_list.length){
        return res.status(301).redirect('/end.html')
    }
    var i = 0;
    while(uList.includes(qid) == true){
        i++
        qid++
        qid = qid % question_list.length
        if(i > question_list.length){
            console.log("bad")
            break;
            

        }
    }
    var question = question_list[qid]
    question.qid = qid;

    return res.json(question)

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
    return res.status(200)
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
