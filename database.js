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
const initDB = async function () {
    await run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        uid TEXT,
        music BOOL,
        narration BOOL,
        age TINYINT,
        experience TINYINT,
        education TEXT
    );
    `, []);
    await run(`
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        qid INTEGER NOT NULL,
        uid INTEGER NOT NULL,
        acc BOOL
    );
    `, []);
}
const newUser = async (uid, music, narration, age, experience, education) => {

    const [{ check }] = await run(`
        SELECT count(*) as count
        FROM users
        WHERE uid = ?;
    `, [uid]);
    if (check > 0) {
        return -1;
    }
    await run(`
        INSERT INTO users (uid,music,narration,age,experience,education) VALUES (?,?,?,?,?,?)

    `, [uid, music, narration, age, experience, education]);
    const [{ ret }] = await run(`
        SELECT count(*) as count
        FROM users
        WHERE uid = ?;
    `, [uid]);
    return ret;
};
const logAnswer = async (qid, uid, acc) => {

    await run(`
        INSERT INTO answers (qid, uid, acc) VALUES (?,?,?)

    `, [qid, uid, acc]);
};
module.exports = { initDB, newUser, logAnswer };``