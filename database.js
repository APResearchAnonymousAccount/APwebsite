const sqlite = require('sqlite3');
const path = require('path');
const db = new sqlite.Database(path.resolve("./users.sqlite"));
const run = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, ...params, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
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

    await run(`
        INSERT INTO answers (hid,aiid, uid, acc) VALUES (?,?,?,?)

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
    if (uid != null) {
        var answers = await run(`
    SELECT acc
    FROM answers
    WHERE uid = ?;
`, [uid]);
        var right = 0;
        for(var i = 0;i<answers.length;i++){
            if(answers[i].acc === 1){
                right++
            }
        }

        return [right,answers.length]

    }
    
};
const getAnswerList = async (uid) => {
    if (uid != null) {
        var answers = await run(`
    SELECT hid,aiid
    FROM answers
    WHERE uid = ?;
`, [uid]);
        return answers

    }
};
module.exports = { newUser, logAnswer, getSettings, getAnswerList, checkUser, getScore }; ``