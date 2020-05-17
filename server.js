const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smartbrain'
});

db.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('MySql connected...');
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    let sql = "SELECT * FROM users";
    db.query(sql, (err, result) => {
        if(err) res.status(400).json('Something is wrong');
        res.send(result);
    });
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    db.query(`SELECT email, password FROM login WHERE email = '${email}'`, (err, result) => {
        if(err) console.log(err);
        if(result.length){
            const isValid = bcrypt.compareSync(password, result[0].password);
            if(isValid) {
                db.query(`SELECT * FROM users WHERE email = '${email}'`, (err, result) => {
                    if(err) console.log(err);
                    if(result.length){
                        res.json(result[0]);
                    } else {
                        res.status(400).json('wrong credentials');
                    }
                })
            } else {
                res.status(400).json('wrong credentials');
            }
        } else {
            res.status(400).json('wrong credentials');
        }
    });
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password);
    db.query(`INSERT INTO login (email, password) VALUES ('${email}', '${hash}')`, (err, result) => {
        if(err) console.log(err);
        if(result.insertId){
            db.query(`INSERT INTO users (name, email, joined) VALUES ('${name}', '${email}', '${new Date()}')`, (err, result) => {
                if(err) console.log(err);
                if(result.insertId) {
                    res.json(result.insertId);
                } else {
                    res.status(400).json('Not registered 1');
                }
            })
        } else {
            res.status(400).json('Not registered 1');
        }
    });
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.query(`SELECT * FROM users WHERE id = '${id}'`, (err, result) => {
        if(err) console.log(err);
        if(result.length) {
            res.json(result[0]);
        } else {
            res.status(400).json('Not found');
        }
    });
});

app.put('/image', (req, res) => {
    const { id } = req.body;
    db.query(`SELECT entries FROM users WHERE id = '${id}'`, (err, result) => {
        if(err) console.log(err);
        if(result.length) {
            let entries = result[0].entries + 1;
            db.query(`UPDATE users SET entries = '${entries}' WHERE id = '${id}'`, (err, data) => {
                if(err) console.log(err);
                if(data.affectedRows) {
                    res.json(String(entries));
                } else {
                    res.status(404).json('entries not updated');
                }
            });
        } else {
            res.status(400).json('Not found');
        }
    });
});

app.listen(3000, () => {
    console.log('app is running on port 3000');
});