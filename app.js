const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const db = require('./database');
function addPost(newPost) {
    return db.execute('INSERT INTO posts (title, jmjx, body, tag) VALUES (?, ?, ?, ?)',
                      [newPost.title, newPost.jmjx, newPost.body, newPost.tag]);
}

function addReply(newreply){
    return db.execute('INSERT INTO reply (title,name,reply) VALUES (?, ?, ?)',
    [newreply.title, newreply.name, newreply.reply])
}

function deletePost(title) {
    return db.execute('DELETE FROM posts WHERE title = ?', [title]);
}

function delreply(dereply){
    return db.execute('DELETE FROM reply WHERE title = ? AND name = ? AND reply = ?',[dereply.title,dereply.name,dereply.reply])
}

app.use('/myhtml', express.static(path.join(__dirname, 'myhtml')));
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/posts',(req,res)=>{
        //从数据库获取数据
        db.execute('SELECT * FROM posts ORDER BY created_at DESC')
            .then(([rows])=>{
                res.json(rows);
            })
            .catch(err=>{
                res.status(500).send({message:'error:',error:err})
            });
});

app.post('/api/create',async (req, res) => {
try{
    const { title, jmjx, body, tag } = req.body;
    await addPost(req.body);
    res.send({message:'成功',title:title});
}catch(err){
        console.error(err);
        res.status(500).send({message:'失败',error:err});
}
});

app.post('/api/reply',async (req, res) => {
    try{
        const {title, name, reply} = req.body;
        await addReply(req.body);
        res.status(200).send({message:'成功'});
    }catch(err){
        console.error(err);
        res.status(500).send({message:'失败',error:err});
    }
});

app.post('/api/delreply',async (req,res)=>{
    try{
        const {name,reply,title} = req.body;

        await delreply(req.body);
        res.status(200).send({message:'成功'});
    }catch(err){
        console.error(err);
        res.status(500).send({message:'失败',error:err});
    }
})

app.post('/api/del',async (req, res) => {
    const {title}=req.body;
    await fs.promises.rm(path.join(__dirname, 'public', title), { recursive: true });
    await deletePost(title);
});

app.get('/api/getart', (req, res) => {
    const { title } = req.query;
    db.execute('SELECT title, body FROM posts WHERE title = ?', [title])
        .then(([rows]) => {
            // 判断是否找到了文章
            if (rows.length > 0) {
                res.json(rows[0]);
            } else {
                res.status(404).send('文章未找到');
            }
        })
        .catch(err => {
            // 处理查询过程中可能出现的错误
            console.error('数据库查询失败', err);
            res.status(500).send('内部服务器错误');
        });
});

app.post('/api/update', (req, res) => {
    const { title, newbody } = req.body;
    console.log(title)
    console.log(newbody)
    // 检查 title 和 body 是否存在
    if (title === undefined || newbody === undefined) {
        return res.status(400).send({ message: '缺少必要的参数' });
    }

    db.execute('UPDATE posts SET body = ? WHERE title = ?', [newbody, title])
        .then(result => {
            if (result[0].affectedRows > 0) {
                res.send({ message: '更新成功' });
            } else {
                res.status(404).send({ message: '未找到相应标题的帖子' });
            }
        })
        .catch(err => {
            console.error('数据库操作失败', err);
            res.status(500).send({ message: '内部服务器错误' });
        });
});

app.get('/api/getreply',(req,res)=>{
    const {title} = req.query;
    db.execute('SELECT name, reply, time FROM reply WHERE title = ?', [title])
        .then(([rows]) => {
            // 判断是否找到了文章
            if (rows.length > 0) {
                res.json(rows);
            } else {
                res.status(404).send('文章未找到');
            }
        })
        .catch(err => {
            // 处理查询过程中可能出现的错误
            console.error('数据库查询失败', err);
            res.status(500).send('内部服务器错误');
        });
})

app.get('/api/get_post_by_tag', (req, res) => {
    const { tag } = req.query;
    db.execute('SELECT title, jmjx, body, created_at FROM posts WHERE tag = ?', [tag])
        .then(([rows]) => {
            res.json(rows);
        })
        .catch(err => {
            console.error('数据库查询失败', err);
            res.status(500).send('内部服务器错误');
        });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});