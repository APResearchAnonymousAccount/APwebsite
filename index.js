const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const { randomBytes } = require("crypto");
const app = express();
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
    
    res.cookie("userId", randomBytes(20).toString('base64'))
    
    return res.status(301).redirect("/survey")

});
app.get("/intro", async (req, res) => {
    if(req.cookies.userId == undefined){
        return res.status(302).redirect("/")

    }
    else{
        res.sendFile(path.join(__dirname, '/static/survey.html'))

    }
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
