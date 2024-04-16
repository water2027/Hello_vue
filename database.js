const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost', // 数据库服务器地址
    user: 'water', // 数据库用户名
    database: 'boke', // 数据库名
    password: '@2004LSYqs' // 数据库密码
});

module.exports = pool.promise();