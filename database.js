const mysql = require('mysql');



// Database Connection for Production

let config = {
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
}
if (process.env.INSTANCE_CONNECTION_NAME) {
    config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}

let connection = mysql.createConnection(config);



connection.connect(function (err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected as thread id: ' + connection.threadId);
});
const run = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(
            sql, params,
            function (error, results, fields) {
                if (error) throw error;
                resolve(results);
            }
        );

    });
};
const checkUser = async (uid) => {
    var check = await run(`
    SELECT count(*) as count
    FROM users
    WHERE uid = ?;
`, [uid]);
    return check[0]
}
const newUser = async (uid, music, narration, age, experience, education, referer) => {
    if (music == "on") {
        music = true;
    }
    if (narration == "on") {
        narration = true;
    }
    var check = await run(`
        SELECT count(*) as count
        FROM users
        WHERE uid = ?;
    `, [uid]);
    if (check[0].count > 0) {
        return -1;
    }
    await run(`
        INSERT INTO users (uid,music,narration,age,experience,education,referer) VALUES (?,?,?,?,?,?,?)

    `, [uid, music, narration, age, experience, education, referer]);
    var ret = await run(`
        SELECT count(*) as count
        FROM users
        WHERE uid = ?;
    `, [uid]);
    return ret[0].count;
};
const logAnswer = async (hid, aiid, uid, acc) => {
    require('dotenv').config()
    console.log(Number(process.env.IRA))
    answersTable = ["answers","answersIRA"][Number(process.env.IRA)]
    await run(`
        INSERT INTO ${answersTable} (hid,aiid, uid, acc) VALUES (?,?,?,?)

    `, [hid, aiid, uid, acc]);
    return
};
const getSettings = async (uid) => {
    if (uid != null) {
        var settings = await run(`
    SELECT music, narration
    FROM users
    WHERE uid = ?;
`, [uid]);
        return settings

    }
};
const getScore = async (uid) => {
    require('dotenv').config()
    console.log(Number(process.env.IRA))
    answersTable = ["answers","answersIRA"][Number(process.env.IRA)]
    if (uid != null) {
        var answers = await run(`
    SELECT acc
    FROM ${answersTable}
    WHERE uid = ?;
`, [uid]);
        var right = 0;
        for (var i = 0; i < answers.length; i++) {
            if (answers[i].acc === 1) {
                right++
            }
        }

        return [right, answers.length]

    }

};
const getAnswerList = async (uid) => {
    require('dotenv').config()
    console.log(Number(process.env.IRA))
    answersTable = ["answers","answersIRA"][Number(process.env.IRA)]
    if (uid != null) {
        var answers = await run(`
    SELECT hid,aiid
    FROM ${answersTable}
    WHERE uid = ?;
`, [uid]);
        return answers

    }
};
module.exports = { newUser, logAnswer, getSettings, getAnswerList, checkUser, getScore }; ``