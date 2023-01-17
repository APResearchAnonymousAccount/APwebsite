const mysql = require('mysql');
require('dotenv').config()
// Database Connection for Production

// let config = {
//     user: process.env.SQL_USER,
//     database: process.env.SQL_DATABASE,
//     password: process.env.SQL_PASSWORD,
// }

// if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
//   config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
// }

// let connection = mysql.createConnection(config);



let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS
});
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
            sql, ...params,
            function (error, results, fields) {
                if (error) throw error;
                resolve(results);
            }
        );

    });
};
const initDB = async function () {
    await run(`
    DROP TABLE IF EXISTS users
    `, []);
    await run(`
    DROP TABLE IF EXISTS answers
    `, []);
    await run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
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
        id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
        hid INTEGER NOT NULL,
        aiid INTEGER NOT NULL,
        uid TEXT NOT NULL,
        acc BOOL
    );
    `, []);
    connection.end()
}
initDB();
