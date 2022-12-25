const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const { randomBytes } = require("crypto");
const app = express();
const database = require('./database.js')
const question_list = require("generated-top10.json")
database.initDB()
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", async (req, res) => {
    if(req.cookies.userId == undefined){
        res.sendFile(path.join(__dirname, '/static/index.html'))    }
    else{
        return res.status(302).redirect("/survey")


    }
});
app.post("/newUser", async (req, res) => {
    console.log(req.body)
    var ret;
    while(ret != 1){
        uid = randomBytes(20).toString('base64')
        ret = database.newUser(uid,req.body.musicSwitch,req.body.narrationSwitch,req.body.ageDropDown,req.body.experienceWithAIRange,req.body.education)
    }
    res.cookie("userId", uid)
    
    return res.status(301).redirect("/intro")

});
app.get("getQuestion", async (req, res) => {
    
});
app.get("/survey", async (req, res) => {
    if(req.cookies.userId == undefined){
        return res.status(302).redirect("/")

    }
    else{
        res.sendFile(path.join(__dirname, '/static/survey.html'))

    }
});



app.use(express.static(path.join(__dirname, 'static')));

app.listen(4000);
process.on("unhandledRejection", (error) => {
    throw error;
});
