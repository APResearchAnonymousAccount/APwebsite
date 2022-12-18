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
await run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    uid TEXT NOT NULL,
    music BOOL,
    narration BOOL,
    age TINYINT,
    experience TINYINT,
    education TEXT NOT NULL
);
`, []);
await run(`
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    aiText TEXT NOT NULL,
    humanText TEXT NOT NULL
);
`, []);
export const newUser = async (uid,music,narration,age,experience,education) => {

    const [{ check }] = await run(`
        SELECT count(*) as count
        FROM queue
        WHERE uid = ?;
    `, [uid]);
    if (check > 0) {
        return -1;
    }
    await run(`
        INSERT INTO users (uid,music,narration,age,experience,education) VALUES (?,?,?,?,?,?)

    `, [uid,music,narration,age,experience,education]);
    const [{ ret }] = await run(`
        SELECT count(*) as count
        FROM queue
        WHERE uid = ?;
    `, uid);
    return ret;
};
export const logQ = async () => {
    const request = await run(`
        SELECT url, ip
        FROM queue
        ORDER BY id ASC
        LIMIT 1;
    `, []);
    if (request.length === 0) {
        return undefined;
    }
    const [{ url, ip }] = request;
    // Delete based off of url and ip in case there are duplicates
    await run(`
        DELETE FROM queue
        WHERE url = ? AND ip = ?;
    `, [url, ip]);
    return url;
};
