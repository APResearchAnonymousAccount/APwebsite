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
    DROP TABLE users
    `, []);
    await run(`
    DROP TABLE answers
    `, []);
    await run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        uid TEXT,
        music BOOL,
        narration BOOL,
        age TINYINT,
        experience TINYINT,
        education TEXT,
        referer text
    );
    `, []);
    await run(`
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        hid INTEGER NOT NULL,
        aiid INTEGER NOT NULL,
        uid INTEGER NOT NULL,
        acc BOOL
    );
    `, []);
}
initDB();