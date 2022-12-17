const express = require("express");

const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, 'static')));
app.post("/fan-mail", async (req, res) => {

});
app.get("/", (req, res) => {

    res.sendFile(path.resolve("./static/welcome.html"));
});
app.listen(4000);
process.on("unhandledRejection", (error) => {
    throw error;
});
